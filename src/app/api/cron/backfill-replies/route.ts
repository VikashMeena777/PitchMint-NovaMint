import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  scoreEmailEngagement,
  formatInterestSummary,
  mapInterestToReplyFields,
  type EmailEngagementData,
} from "@/lib/email/interest-detector";

/**
 * Cron Job: Backfill & Re-Score Engagement Data
 * Schedule: Daily at 3 AM
 *
 * Re-processes older emails that may have accumulated new engagement
 * signals since they were last scored. Also catches any emails that
 * were missed by the regular check-replies cron.
 *
 * This endpoint handles:
 * 1. Emails with engagement that were never categorized
 * 2. Emails whose engagement changed since last scoring
 * 3. Emails older than 30 days (outside check-replies window)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Wider window: look at emails from the last 90 days
  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch emails that have engagement but no categorization,
  // OR have stale categorization (older than 7 days)
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: emails, error: fetchError } = await supabase
    .from("emails")
    .select(
      "id, prospect_id, user_id, subject, to_email, open_count, click_count, first_opened_at, last_opened_at, first_clicked_at, sent_at, scheduled_at, has_reply, reply_received_at, reply_category, status"
    )
    .eq("status", "sent")
    .gte("sent_at", ninetyDaysAgo)
    .or("open_count.gt.0,click_count.gt.0,has_reply.eq.true")
    .or(`reply_category.is.null,updated_at.lt.${sevenDaysAgo}`)
    .order("sent_at", { ascending: false })
    .limit(500);

  if (fetchError || !emails || emails.length === 0) {
    return NextResponse.json({
      message: "No emails to backfill",
      processed: 0,
      timestamp: new Date().toISOString(),
    });
  }

  let processed = 0;
  let upgraded = 0;
  let downgraded = 0;

  for (const email of emails) {
    try {
      const emailData: EmailEngagementData = {
        id: email.id,
        prospect_id: email.prospect_id,
        user_id: email.user_id,
        subject: email.subject,
        to_email: email.to_email,
        open_count: email.open_count || 0,
        first_opened_at: email.first_opened_at,
        last_opened_at: email.last_opened_at,
        click_count: email.click_count || 0,
        first_clicked_at: email.first_clicked_at,
        sent_at: email.sent_at,
        scheduled_at: email.scheduled_at,
        has_reply: email.has_reply || false,
        reply_received_at: email.reply_received_at,
        reply_category: email.reply_category,
        status: email.status,
      };

      const result = scoreEmailEngagement(emailData);

      // Skip emails with no meaningful engagement
      if (result.score < 10) continue;

      const { reply_category, reply_sentiment } = mapInterestToReplyFields(result);
      const newSummary = formatInterestSummary(result);

      // Check if categorization changed
      const categoryChanged = reply_category !== email.reply_category;

      if (categoryChanged) {
        await supabase
          .from("emails")
          .update({
            reply_category,
            reply_sentiment,
            reply_body: newSummary,
          })
          .eq("id", email.id);

        // Track upgrade/downgrade for logging
        const levelOrder = ["no_engagement", "low_engagement", "warming_up", "engaged", "interested"];
        const oldIdx = levelOrder.indexOf(email.reply_category || "no_engagement");
        const newIdx = levelOrder.indexOf(reply_category);
        if (newIdx > oldIdx) upgraded++;
        else if (newIdx < oldIdx) downgraded++;
      }

      processed++;
    } catch (err) {
      console.error(`[Backfill] Error processing email ${email.id}:`, err);
    }
  }

  console.log(
    `[Backfill] Processed ${processed} emails: ${upgraded} upgraded, ${downgraded} downgraded`
  );

  return NextResponse.json({
    processed,
    total: emails.length,
    upgraded,
    downgraded,
    timestamp: new Date().toISOString(),
  });
}
