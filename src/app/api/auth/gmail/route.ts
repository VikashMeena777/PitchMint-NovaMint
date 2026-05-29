import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * GET /api/auth/gmail
 * Initiates Gmail OAuth2 flow to connect user's Gmail for sending.
 * Redirects to Google consent screen.
 */
export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Gmail OAuth not configured. Set GMAIL_OAUTH_CLIENT_ID in environment." },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/gmail/callback`;

  // Generate a state token for CSRF protection
  const state = crypto.randomUUID();

  // Store state in user's metadata for verification
  await supabase.from("users").update({
    gmail_oauth_state: state,
  }).eq("id", user.id);

  // Gmail OAuth scopes — Sensitive only (no Restricted scopes = no CASA assessment needed)
  // gmail.send = Sensitive (send emails from user's Gmail)
  // userinfo.email = Non-sensitive (identify connected account)
  // NOTE: gmail.readonly was removed to avoid Restricted scope CASA requirement
  const scopes = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline", // Get refresh token
    prompt: "consent", // Force consent to always get refresh token
    state,
    login_hint: user.email || "",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  return NextResponse.redirect(googleAuthUrl);
}
