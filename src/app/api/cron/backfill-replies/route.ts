import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * One-time backfill: Re-fetch reply bodies from Gmail for emails
 * that have has_reply=true but reply_body is NULL.
 * 
 * GET /api/cron/backfill-replies
 * Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Find emails with has_reply=true but no reply_body
  const { data: repliedEmails, error } = await supabase
    .from("emails")
    .select("id, to_email, subject, user_id, reply_received_at")
    .eq("has_reply", true)
    .is("reply_body", null)
    .limit(50);

  if (error || !repliedEmails || repliedEmails.length === 0) {
    return NextResponse.json({
      message: "No emails need backfilling",
      count: 0,
    });
  }

  // Group by user_id to avoid redundant token fetches
  const byUser: Record<string, typeof repliedEmails> = {};
  for (const email of repliedEmails) {
    if (!byUser[email.user_id]) byUser[email.user_id] = [];
    byUser[email.user_id].push(email);
  }

  let updated = 0;
  let errors = 0;

  for (const [userId, emails] of Object.entries(byUser)) {
    // Get the user's Gmail token
    const { data: userRow } = await supabase
      .from("users")
      .select("gmail_access_token, gmail_refresh_token, gmail_token_expiry")
      .eq("id", userId)
      .single();

    if (!userRow?.gmail_access_token) {
      errors += emails.length;
      continue;
    }

    let accessToken = userRow.gmail_access_token;

    // Refresh token if expired
    const expiry = userRow.gmail_token_expiry
      ? new Date(userRow.gmail_token_expiry).getTime()
      : 0;
    if (Date.now() > expiry - 60000 && userRow.gmail_refresh_token) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: userRow.gmail_refresh_token,
            client_id: process.env.GMAIL_OAUTH_CLIENT_ID || "",
            client_secret: process.env.GMAIL_OAUTH_CLIENT_SECRET || "",
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          accessToken = tokenData.access_token;
          await supabase
            .from("users")
            .update({
              gmail_access_token: accessToken,
              gmail_token_expiry: new Date(
                Date.now() + (tokenData.expires_in || 3600) * 1000
              ).toISOString(),
            })
            .eq("id", userId);
        }
      } catch {
        errors += emails.length;
        continue;
      }
    }

    for (const email of emails) {
      try {
        // Search Gmail for the reply
        const searchQuery = encodeURIComponent(
          `from:${email.to_email} subject:Re: ${(email.subject || "").replace(
            /^Re:\s*/i,
            ""
          )} newer_than:60d`
        );

        const searchRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${searchQuery}&maxResults=1`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!searchRes.ok) {
          errors++;
          continue;
        }

        const searchData = (await searchRes.json()) as {
          messages?: { id: string }[];
        };

        if (!searchData.messages || searchData.messages.length === 0) {
          // No reply found in Gmail, set a placeholder
          await supabase
            .from("emails")
            .update({ reply_body: "(Reply detected but content unavailable)" })
            .eq("id", email.id);
          updated++;
          continue;
        }

        // Fetch the full message
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${searchData.messages[0].id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!msgRes.ok) {
          errors++;
          continue;
        }

        const msgData = (await msgRes.json()) as {
          snippet: string;
          internalDate: string;
          payload?: {
            body?: { data?: string };
            parts?: { mimeType: string; body?: { data?: string } }[];
          };
        };

        let replyBody = msgData.snippet || "";

        if (msgData.payload?.parts) {
          const textPart = msgData.payload.parts.find(
            (p) => p.mimeType === "text/plain"
          );
          if (textPart?.body?.data) {
            replyBody = Buffer.from(textPart.body.data, "base64").toString(
              "utf-8"
            );
          }
        } else if (msgData.payload?.body?.data) {
          replyBody = Buffer.from(
            msgData.payload.body.data,
            "base64"
          ).toString("utf-8");
        }

        const replyDate = msgData.internalDate
          ? new Date(parseInt(msgData.internalDate)).toISOString()
          : null;

        await supabase
          .from("emails")
          .update({
            reply_body: replyBody.substring(0, 5000),
            ...(replyDate && !email.reply_received_at
              ? { reply_received_at: replyDate }
              : {}),
          } as Record<string, unknown>)
          .eq("id", email.id);

        updated++;
        console.log(`[Backfill] Updated reply body for email ${email.id}`);
      } catch (err) {
        console.error(`[Backfill] Error for email ${email.id}:`, err);
        errors++;
      }
    }
  }

  return NextResponse.json({
    message: "Backfill complete",
    updated,
    errors,
    total: repliedEmails.length,
  });
}
