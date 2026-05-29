import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  scoreEmailEngagement,
  scoreProspectEngagement,
  formatInterestSummary,
  mapInterestToReplyFields,
  mapInterestToProspectStatus,
  type EmailEngagementData,
} from "@/lib/email/interest-detector";

/**
 * Cron Job: Multi-Signal Interest Detection
 * Schedule: Every 10 minutes
 *
 * Detects prospect interest using ALL available engagement signals
 * without requiring Gmail read scopes (no CASA assessment needed).
 *
 * Signals analyzed:
 *   ✅ Email opens (count, timing, reopens, recency)
 *   ✅ Link clicks (count, velocity, open-to-click gap)
 *   ✅ Temporal patterns (time-to-open, revisit windows)
 *   ✅ Behavioral decay (engagement freshness scoring)
 *   ✅ Cross-email engagement (multi-email trends)
 *   ✅ Manual reply confirmations from user
 *
 * When a prospect's engagement crosses thresholds, their status
 * and email categorization are updated to surface them in the UI.
 */

async function handleCheckEngagement(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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

  // ── Phase 1: Find emails with engagement signals ─────────────

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch sent emails with any engagement in the last 30 days
  // that haven't been categorized yet OR were scored > 24 hours ago (re-score)
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: engagedEmails, error: fetchError } = await supabase
    .from("emails")
    .select(
      "id, prospect_id, user_id, subject, to_email, open_count, click_count, first_opened_at, last_opened_at, first_clicked_at, sent_at, scheduled_at, has_reply, reply_received_at, reply_category, status"
    )
    .eq("status", "sent")
    .gte("sent_at", thirtyDaysAgo)
    .or("open_count.gt.0,click_count.gt.0,has_reply.eq.true")
    .or(`reply_category.is.null,updated_at.lt.${twentyFourHoursAgo}`)
    .order("sent_at", { ascending: false })
    .limit(200);

  if (fetchError || !engagedEmails || engagedEmails.length === 0) {
    return NextResponse.json({
      message: "No engaged emails to process",
      emailsChecked: 0,
      hotLeads: 0,
      warmLeads: 0,
      timestamp: new Date().toISOString(),
    });
  }

  // ── Phase 2: Score individual emails ─────────────────────────

  let hotLeads = 0;
  let warmLeads = 0;
  let processed = 0;
  const prospectIds = new Set<string>();

  for (const email of engagedEmails) {
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

      // Only update emails with meaningful engagement (score >= 15)
      if (result.score < 15) continue;

      const { reply_category, reply_sentiment } = mapInterestToReplyFields(result);

      // Update email with interest-based categorization
      await supabase
        .from("emails")
        .update({
          reply_category,
          reply_sentiment,
          reply_body: formatInterestSummary(result),
        })
        .eq("id", email.id);

      // Track prospect for Phase 3 aggregate scoring
      if (email.prospect_id) {
        prospectIds.add(email.prospect_id);
      }

      if (result.level === "hot") hotLeads++;
      if (result.level === "warm") warmLeads++;

      processed++;

      console.log(
        `[Interest] Email ${email.id}: score=${result.score}, level=${result.level}, signals=[${result.signals.map(s => s.name).join(", ")}]`
      );
    } catch (err) {
      console.error(
        `[Interest] Error processing email ${email.id}:`,
        err
      );
    }
  }

  // ── Phase 3: Aggregate prospect-level scoring ────────────────

  let prospectsUpdated = 0;

  for (const prospectId of prospectIds) {
    try {
      // Fetch all emails for this prospect
      const { data: prospectEmails } = await supabase
        .from("emails")
        .select(
          "id, prospect_id, user_id, subject, to_email, open_count, click_count, first_opened_at, last_opened_at, first_clicked_at, sent_at, scheduled_at, has_reply, reply_received_at, reply_category, status"
        )
        .eq("prospect_id", prospectId)
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(20);

      if (!prospectEmails || prospectEmails.length === 0) continue;

      // Get prospect current status
      const { data: prospect } = await supabase
        .from("prospects")
        .select("status, total_opens, total_clicks")
        .eq("id", prospectId)
        .single();

      if (!prospect) continue;

      // Build engagement context
      const emails: EmailEngagementData[] = prospectEmails.map(e => ({
        id: e.id,
        prospect_id: e.prospect_id,
        user_id: e.user_id,
        subject: e.subject,
        to_email: e.to_email,
        open_count: e.open_count || 0,
        first_opened_at: e.first_opened_at,
        last_opened_at: e.last_opened_at,
        click_count: e.click_count || 0,
        first_clicked_at: e.first_clicked_at,
        sent_at: e.sent_at,
        scheduled_at: e.scheduled_at,
        has_reply: e.has_reply || false,
        reply_received_at: e.reply_received_at,
        reply_category: e.reply_category,
        status: e.status,
      }));

      const aggregateResult = scoreProspectEngagement({
        total_emails_sent: prospectEmails.length,
        total_opens: prospect.total_opens || 0,
        total_clicks: prospect.total_clicks || 0,
        emails,
      });

      // Update prospect status if needed
      const newStatus = mapInterestToProspectStatus(
        aggregateResult,
        prospect.status
      );

      if (newStatus) {
        await supabase
          .from("prospects")
          .update({ status: newStatus })
          .eq("id", prospectId);

        prospectsUpdated++;

        console.log(
          `[Interest] Prospect ${prospectId}: score=${aggregateResult.score}, ${prospect.status} → ${newStatus}`
        );
      }
    } catch (err) {
      console.error(`[Interest] Error scoring prospect ${prospectId}:`, err);
    }
  }

  return NextResponse.json({
    emailsChecked: engagedEmails.length,
    processed,
    hotLeads,
    warmLeads,
    prospectsScored: prospectIds.size,
    prospectsUpdated,
    timestamp: new Date().toISOString(),
  });
}

// POST: GitHub Actions cron
export async function POST(request: NextRequest) {
  return handleCheckEngagement(request);
}

// GET: Vercel cron
export async function GET(request: NextRequest) {
  return handleCheckEngagement(request);
}
