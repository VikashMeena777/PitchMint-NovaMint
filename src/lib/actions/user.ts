"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UserProfileSafe = {
  id: string;
  name: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  plan: string;
  role: string;
  company_name: string;
  onboarding_completed: boolean;
  created_at: string;
  credits: number;
  billing_cycle: string;
  gmail_connected: boolean;
  gmail_email: string | null;
  value_proposition: string;
  target_audience: string;
  tone_preset: string;
  sending_email: string;
  sending_name: string;
  timezone: string;
  daily_send_limit: number;
  mailing_address: string;
  notify_replies: boolean;
  notify_daily_digest: boolean;
  notify_weekly_report: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_secure?: boolean;
  api_key?: string;
};

export type UserProfileResult =
  | { data: UserProfileSafe; error: null }
  | { data: null; error: string };

export async function getUserProfile(): Promise<UserProfileResult> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  // SEC-03: Eliminate select("*") to prevent sensitive token/credential leakage (smtp_password, OAuth tokens, api_key omitted)
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, full_name, email, company_name, value_proposition, target_audience, tone_preset, plan, role, onboarding_completed, created_at, monthly_prospect_limit, monthly_prospect_count, gmail_connected, gmail_email, sending_email, sending_name, timezone, daily_send_limit, mailing_address, notify_replies, notify_daily_digest, notify_weekly_report, smtp_host, smtp_port, smtp_user, smtp_secure"
    )
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || "User profile not found" };
  }

  // Explicitly return safe, non-sensitive fields
  const safeProfile: UserProfileSafe = {
    id: data.id,
    name: data.full_name || "",
    full_name: data.full_name || "",
    email: data.email,
    avatar_url: null,
    plan: data.plan || "free",
    role: data.role || "owner",
    company_name: data.company_name || "",
    onboarding_completed: Boolean(data.onboarding_completed),
    created_at: data.created_at,
    credits: Math.max(0, (data.monthly_prospect_limit ?? 25) - (data.monthly_prospect_count ?? 0)),
    billing_cycle: "monthly",
    gmail_connected: Boolean(data.gmail_connected),
    gmail_email: data.gmail_email || null,
    value_proposition: data.value_proposition || "",
    target_audience: data.target_audience || "",
    tone_preset: data.tone_preset || "professional",
    sending_email: data.sending_email || "",
    sending_name: data.sending_name || "",
    timezone: data.timezone || "UTC",
    daily_send_limit: data.daily_send_limit || 20,
    mailing_address: data.mailing_address || "",
    notify_replies: data.notify_replies ?? true,
    notify_daily_digest: data.notify_daily_digest ?? false,
    notify_weekly_report: data.notify_weekly_report ?? true,
    smtp_host: typeof (data as Record<string, unknown>).smtp_host === "string" ? ((data as Record<string, unknown>).smtp_host as string) : "",
    smtp_port: typeof (data as Record<string, unknown>).smtp_port === "number" ? ((data as Record<string, unknown>).smtp_port as number) : 587,
    smtp_user: typeof (data as Record<string, unknown>).smtp_user === "string" ? ((data as Record<string, unknown>).smtp_user as string) : "",
    smtp_secure: typeof (data as Record<string, unknown>).smtp_secure === "boolean" ? ((data as Record<string, unknown>).smtp_secure as boolean) : true,
  };

  return { data: safeProfile, error: null };
}

export async function updateUserProfile(updates: {
  full_name?: string;
  company_name?: string;
  value_proposition?: string;
  target_audience?: string;
  tone_preset?: string;
  sending_email?: string;
  sending_name?: string;
  timezone?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  daily_send_limit?: number;
  mailing_address?: string;
  notify_replies?: boolean;
  notify_daily_digest?: boolean;
  notify_weekly_report?: boolean;
  api_key?: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Prevent privilege escalation: only allow safe mutable fields
  const safeUpdates: Record<string, unknown> = {};
  const allowedKeys = [
    "full_name",
    "company_name",
    "value_proposition",
    "target_audience",
    "tone_preset",
    "sending_email",
    "sending_name",
    "timezone",
    "smtp_host",
    "smtp_port",
    "smtp_username",
    "daily_send_limit",
    "mailing_address",
    "notify_replies",
    "notify_daily_digest",
    "notify_weekly_report",
  ] as const;

  for (const key of allowedKeys) {
    if (key in updates && updates[key] !== undefined) {
      safeUpdates[key] = updates[key];
    }
  }

  const { data, error } = await supabase
    .from("users")
    .update(safeUpdates)
    .eq("id", user.id)
    .select(
      "id, full_name, email, company_name, value_proposition, target_audience, tone_preset, plan, role, onboarding_completed, created_at, gmail_connected, gmail_email, sending_email, sending_name, timezone"
    )
    .single();

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { data };
}

export async function getDashboardStats() {
  const supabase = await createClient();
  if (!supabase) {
    return {
      totalProspects: 0,
      emailsSent: 0,
      openRate: 0,
      replyRate: 0,
      activeSequences: 0,
      recentActivity: [],
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      totalProspects: 0,
      emailsSent: 0,
      openRate: 0,
      replyRate: 0,
      activeSequences: 0,
      recentActivity: [],
    };
  }

  // Get prospect count
  const { count: totalProspects } = await supabase
    .from("prospects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get email stats
  const { data: emailStats } = await supabase
    .from("emails")
    .select("status, open_count, has_reply")
    .eq("user_id", user.id);

  const sent = emailStats?.filter((e) => e.status === "sent").length || 0;
  const opened = emailStats?.filter((e) => e.open_count > 0).length || 0;
  const replied = emailStats?.filter((e) => e.has_reply).length || 0;

  // Get active sequences
  const { count: activeSequences } = await supabase
    .from("sequences")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  // Get recent prospects
  const { data: recentActivity } = await supabase
    .from("prospects")
    .select("id, email, first_name, last_name, company_name, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalProspects: totalProspects || 0,
    emailsSent: sent,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
    activeSequences: activeSequences || 0,
    recentActivity: recentActivity || [],
  };
}
