"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, updateUserProfile } from "@/lib/actions/user";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Save,
  Loader2,
  Bell,
  Send,
  CheckCircle2,
  MapPin,
  Key,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 24; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `pm_live_${hex}`;
}

type UserProfile = {
  full_name: string;
  company_name: string;
  value_proposition: string;
  target_audience: string;
  tone_preset: string;
  sending_email: string;
  sending_name: string;
  timezone: string;
  daily_send_limit: number;
  plan: string;
  email: string;
  onboarding_completed: boolean;
  mailing_address: string;
  notify_replies: boolean;
  notify_daily_digest: boolean;
  notify_weekly_report: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: boolean;
  api_key: string;
  gmail_connected: boolean;
  gmail_email: string;
};

type SettingsTab = "general" | "email" | "schedule" | "api" | "notifications";

export default function SettingsPage() {
  const [supabaseReady] = useState(() => !!createClient());
  const [isLoading, setIsLoading] = useState(() => !!createClient());
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isDisconnectingGmail, setIsDisconnectingGmail] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<string>("");
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    company_name: "",
    value_proposition: "",
    target_audience: "",
    tone_preset: "professional",
    sending_email: "",
    sending_name: "",
    timezone: "UTC",
    daily_send_limit: 50,
    plan: "free",
    email: "",
    onboarding_completed: false,
    mailing_address: "",
    notify_replies: true,
    notify_daily_digest: true,
    notify_weekly_report: false,
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    smtp_secure: true,
    api_key: "",
    gmail_connected: false,
    gmail_email: "",
  });

  useEffect(() => {
    // Handle Gmail OAuth callback messages
    const params = new URLSearchParams(window.location.search);
    const gmailStatus = params.get("gmail");
    if (gmailStatus === "success") {
      toast.success("Gmail connected successfully!");
      queueMicrotask(() => {
        setProfile((prev) => ({ ...prev, gmail_connected: true }));
      });
      window.history.replaceState({}, "", "/settings");
      setTimeout(async () => {
        const result = await getUserProfile();
        if (result.data) {
          setProfile((prev) => ({
            ...prev,
            gmail_connected: result.data.gmail_connected || false,
            gmail_email: result.data.gmail_email || "",
            sending_email: result.data.sending_email || prev.sending_email,
          }));
        }
      }, 500);
    } else if (gmailStatus === "error") {
      const reason = params.get("reason") || "unknown";
      toast.error(`Gmail connection failed: ${reason}`);
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  useEffect(() => {
    if (!supabaseReady) {
      // Mock profile for preview when Supabase is unconfigured
      const mock = {
        full_name: "Vikash Meena",
        company_name: "NovaMint Ventures",
        value_proposition: "Autonomous AI-powered outbound outreach with zero spam bounce",
        target_audience: "B2B SaaS Founders and Growth Leaders",
        tone_preset: "confident",
        sending_email: "vikash@pitchpilot.io",
        sending_name: "Vikash from PitchPilot",
        timezone: "Asia/Kolkata",
        daily_send_limit: 100,
        plan: "growth",
        email: "vikash@pitchpilot.io",
        onboarding_completed: true,
        mailing_address: "100 Innovation Blvd, Suite 400, Austin, TX 78701",
        notify_replies: true,
        notify_daily_digest: true,
        notify_weekly_report: true,
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_user: "vikash@pitchpilot.io",
        smtp_pass: "",
        smtp_secure: true,
        api_key: "pm_live_7a8f9c2d1b4e5f608192a3b4c5d6e7f8091a2b3c4d5e6f70",
        gmail_connected: true,
        gmail_email: "vikash@pitchpilot.io",
      };
      setProfile(mock);
      setOriginalProfile(JSON.stringify(mock));
      setIsLoading(false);
      return;
    }

    let ignore = false;
    (async () => {
      const result = await getUserProfile();
      if (result.data && !ignore) {
        setProfile({
          full_name: result.data.full_name || "",
          company_name: result.data.company_name || "",
          value_proposition: result.data.value_proposition || "",
          target_audience: result.data.target_audience || "",
          tone_preset: result.data.tone_preset || "professional",
          sending_email: result.data.sending_email || "",
          sending_name: result.data.sending_name || "",
          timezone: result.data.timezone || "UTC",
          daily_send_limit: result.data.daily_send_limit || 50,
          plan: result.data.plan || "free",
          email: result.data.email || "",
          onboarding_completed: result.data.onboarding_completed || false,
          mailing_address: result.data.mailing_address || "",
          notify_replies: result.data.notify_replies ?? true,
          notify_daily_digest: result.data.notify_daily_digest ?? true,
          notify_weekly_report: result.data.notify_weekly_report ?? false,
          smtp_host: result.data.smtp_host || "",
          smtp_port: result.data.smtp_port || 587,
          smtp_user: result.data.smtp_user || "",
          smtp_pass: "",
          smtp_secure: result.data.smtp_secure ?? true,
          api_key: result.data.api_key || "",
          gmail_connected: result.data.gmail_connected || false,
          gmail_email: result.data.gmail_email || "",
        });
        setOriginalProfile(
          JSON.stringify({
            full_name: result.data.full_name || "",
            company_name: result.data.company_name || "",
            value_proposition: result.data.value_proposition || "",
            target_audience: result.data.target_audience || "",
            tone_preset: result.data.tone_preset || "professional",
            sending_email: result.data.sending_email || "",
            sending_name: result.data.sending_name || "",
            timezone: result.data.timezone || "UTC",
            daily_send_limit: result.data.daily_send_limit || 50,
            mailing_address: result.data.mailing_address || "",
            notify_replies: result.data.notify_replies ?? true,
            notify_daily_digest: result.data.notify_daily_digest ?? true,
            notify_weekly_report: result.data.notify_weekly_report ?? false,
            api_key: result.data.api_key || "",
          })
        );
      }
      if (!ignore) {
        setIsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabaseReady]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateUserProfile({
      full_name: profile.full_name,
      company_name: profile.company_name,
      value_proposition: profile.value_proposition,
      target_audience: profile.target_audience,
      tone_preset: profile.tone_preset,
      sending_email: profile.sending_email || undefined,
      sending_name: profile.sending_name || undefined,
      timezone: profile.timezone,
      daily_send_limit: profile.daily_send_limit,
      mailing_address: profile.mailing_address || undefined,
      notify_replies: profile.notify_replies,
      notify_daily_digest: profile.notify_daily_digest,
      notify_weekly_report: profile.notify_weekly_report,
      api_key: profile.api_key || undefined,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Settings saved successfully");
      setOriginalProfile(
        JSON.stringify({
          full_name: profile.full_name,
          company_name: profile.company_name,
          value_proposition: profile.value_proposition,
          target_audience: profile.target_audience,
          tone_preset: profile.tone_preset,
          sending_email: profile.sending_email,
          sending_name: profile.sending_name,
          timezone: profile.timezone,
          daily_send_limit: profile.daily_send_limit,
          mailing_address: profile.mailing_address,
          notify_replies: profile.notify_replies,
          notify_daily_digest: profile.notify_daily_digest,
          notify_weekly_report: profile.notify_weekly_report,
          api_key: profile.api_key,
        })
      );
    }
    setIsSaving(false);
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: profile.email }),
      });
      if (res.ok) {
        setTestResult("success");
        toast.success("Test email sent! Check your inbox.");
      } else {
        setTestResult("error");
        const data = await res.json();
        toast.error(data.error || "Failed to send test email");
      }
    } catch {
      setTestResult("error");
      toast.error("Failed to send test email");
    }
    setIsTesting(false);
  };

  const handleDisconnectGmail = async () => {
    setIsDisconnectingGmail(true);
    try {
      const res = await fetch("/api/auth/gmail/disconnect", { method: "POST" });
      if (res.ok) {
        setProfile((prev) => ({
          ...prev,
          gmail_connected: false,
          gmail_email: "",
        }));
        toast.success("Gmail disconnected");
      } else {
        toast.error("Failed to disconnect Gmail");
      }
    } catch {
      toast.error("Failed to disconnect Gmail");
    } finally {
      setIsDisconnectingGmail(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: string | number | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const isDirty =
    originalProfile !== "" &&
    originalProfile !==
      JSON.stringify({
        full_name: profile.full_name,
        company_name: profile.company_name,
        value_proposition: profile.value_proposition,
        target_audience: profile.target_audience,
        tone_preset: profile.tone_preset,
        sending_email: profile.sending_email,
        sending_name: profile.sending_name,
        timezone: profile.timezone,
        daily_send_limit: profile.daily_send_limit,
        mailing_address: profile.mailing_address,
        notify_replies: profile.notify_replies,
        notify_daily_digest: profile.notify_daily_digest,
        notify_weekly_report: profile.notify_weekly_report,
        api_key: profile.api_key,
      });

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "general", label: "General Profile", icon: User },
    { id: "email", label: "Gmail & SMTP", icon: Mail },
    { id: "schedule", label: "Sending & Schedule", icon: Send },
    { id: "api", label: "API Keys & Security", icon: Key },
    { id: "notifications", label: "Notifications & Billing", icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-32 bg-zinc-800" />
            <Skeleton className="h-4 w-64 bg-zinc-800 mt-2" />
          </div>
        </div>
        <div className="bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] rounded-2xl p-6 space-y-4">
          <Skeleton className="h-10 w-full bg-zinc-800 rounded-lg" />
          <Skeleton className="h-40 w-full bg-zinc-800 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-4xl pb-16"
    >
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[var(--pp-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Settings & Preferences
          </h1>
          <p className="text-sm text-[var(--pp-text-muted)] mt-1">
            Configure your sender identity, AI tone, outbound schedules, and API access
          </p>
        </div>

        {isDirty && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo shadow-lg"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Save Changes
            </Button>
          </motion.div>
        )}
      </div>

      {/* Tabbed Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-white bg-[var(--pp-accent1)]/15 border border-[var(--pp-accent1)]/30 shadow-sm"
                  : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)]/50 border border-transparent"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--pp-accent1-light)]" : ""}`} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-settings-tab"
                  className="absolute inset-0 rounded-xl bg-[var(--pp-accent1)]/10 -z-10"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-[var(--pp-border-subtle)] pb-4">
                <h2
                  className="text-base font-bold text-[var(--pp-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  General Profile & Organization
                </h2>
                <p className="text-xs text-[var(--pp-text-muted)]">
                  Personal identity, company value propositions, and default AI cold pitch tone
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Full Name
                  </Label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)]"
                  />
                </div>
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Account Email
                  </Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-[var(--pp-bg-deepest)]/50 border-[var(--pp-border-subtle)] text-[var(--pp-text-muted)] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Company Name
                  </Label>
                  <Input
                    value={profile.company_name}
                    onChange={(e) => updateField("company_name", e.target.value)}
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)]"
                  />
                </div>

                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Value Proposition & Pitch Hook
                  </Label>
                  <Textarea
                    value={profile.value_proposition}
                    onChange={(e) => updateField("value_proposition", e.target.value)}
                    rows={3}
                    placeholder="We help engineering teams ship secure code 3x faster with autonomous code intelligence."
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] resize-none text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Target Audience Description
                  </Label>
                  <Textarea
                    value={profile.target_audience}
                    onChange={(e) => updateField("target_audience", e.target.value)}
                    rows={2}
                    placeholder="CTOs, Heads of Engineering, and Tech Leads at Series A-B B2B startups."
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] resize-none text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    AI Cold Outreach Tone Preset
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "professional", label: "Professional", desc: "Crisp & polite" },
                      { id: "casual", label: "Casual", desc: "Warm & conversational" },
                      { id: "confident", label: "Confident", desc: "Direct & value-first" },
                      { id: "urgent", label: "Urgent", desc: "Action-oriented" },
                    ].map((tone) => (
                      <button
                        type="button"
                        key={tone.id}
                        onClick={() => updateField("tone_preset", tone.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          profile.tone_preset === tone.id
                            ? "border-[var(--pp-accent1)] bg-[var(--pp-accent1)]/10 text-white"
                            : "border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/40 text-[var(--pp-text-secondary)] hover:border-[var(--pp-border-default)]"
                        }`}
                      >
                        <span className="text-xs font-semibold block">{tone.label}</span>
                        <span className="text-[10px] text-[var(--pp-text-muted)] block mt-0.5">
                          {tone.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-[var(--pp-border-subtle)] pb-4">
                <h2
                  className="text-base font-bold text-[var(--pp-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Email Account Integration
                </h2>
                <p className="text-xs text-[var(--pp-text-muted)]">
                  Connect your Google Workspace or custom SMTP inbox to dispatch sequences
                </p>
              </div>

              {/* Gmail OAuth Section */}
              <div className="p-5 rounded-2xl bg-[var(--pp-bg-surface2)]/50 border border-[var(--pp-border-subtle)] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--pp-text-primary)]">
                        Gmail / Google Workspace
                      </h3>
                      <p className="text-xs text-[var(--pp-text-muted)]">
                        High deliverability dispatch with automatic reply detection
                      </p>
                    </div>
                  </div>

                  {profile.gmail_connected ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected ({profile.gmail_email || profile.sending_email})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectGmail}
                        disabled={isDisconnectingGmail}
                        className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = "/api/auth/gmail")}
                      className="bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                      Connect Gmail
                    </Button>
                  )}
                </div>
              </div>

              {/* SMTP Credentials Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--pp-text-muted)]">
                  Or Custom SMTP Server
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                      SMTP Host
                    </Label>
                    <Input
                      value={profile.smtp_host}
                      onChange={(e) => updateField("smtp_host", e.target.value)}
                      placeholder="smtp.mailgun.org"
                      className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                      SMTP Port
                    </Label>
                    <Input
                      type="number"
                      value={profile.smtp_port}
                      onChange={(e) => updateField("smtp_port", parseInt(e.target.value) || 587)}
                      className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                      SMTP User
                    </Label>
                    <Input
                      value={profile.smtp_user}
                      onChange={(e) => updateField("smtp_user", e.target.value)}
                      placeholder="user@domain.com"
                      className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                      SMTP Password
                    </Label>
                    <Input
                      type="password"
                      value={profile.smtp_pass}
                      onChange={(e) => updateField("smtp_pass", e.target.value)}
                      placeholder="••••••••"
                      className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={profile.smtp_secure}
                      onCheckedChange={(checked) => updateField("smtp_secure", checked)}
                    />
                    <Label className="text-[var(--pp-text-secondary)] text-xs cursor-pointer">
                      Use TLS/SSL Encryption
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    {testResult === "success" && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sent!
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestEmail}
                      disabled={isTesting}
                      className="text-xs border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:text-white cursor-pointer"
                    >
                      {isTesting ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Send Test Email
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-[var(--pp-border-subtle)] pb-4">
                <h2
                  className="text-base font-bold text-[var(--pp-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sending Constraints & CAN-SPAM Compliance
                </h2>
                <p className="text-xs text-[var(--pp-text-muted)]">
                  Control daily throttling velocity, sender timezones, and physical mailing address
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Sending Display Name
                  </Label>
                  <Input
                    value={profile.sending_name}
                    onChange={(e) => updateField("sending_name", e.target.value)}
                    placeholder="Vikash from PitchPilot"
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Reply-To / From Email Address
                  </Label>
                  <Input
                    value={profile.sending_email}
                    onChange={(e) => updateField("sending_email", e.target.value)}
                    placeholder="vikash@pitchpilot.io"
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Daily Send Limit (Emails per Day)
                  </Label>
                  <Input
                    type="number"
                    min={5}
                    max={500}
                    value={profile.daily_send_limit}
                    onChange={(e) =>
                      updateField("daily_send_limit", parseInt(e.target.value) || 50)
                    }
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                  />
                  <p className="text-[10px] text-[var(--pp-text-muted)] mt-1">
                    Prevents domain burn by pacing outreach evenly across business hours.
                  </p>
                </div>
                <div>
                  <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block">
                    Default Timezone
                  </Label>
                  <Input
                    value={profile.timezone}
                    onChange={(e) => updateField("timezone", e.target.value)}
                    placeholder="America/New_York or Asia/Kolkata"
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[var(--pp-text-secondary)] text-xs mb-1.5 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Physical Mailing Address (CAN-SPAM Required)
                </Label>
                <Textarea
                  value={profile.mailing_address}
                  onChange={(e) => updateField("mailing_address", e.target.value)}
                  rows={2}
                  placeholder="100 Innovation Blvd, Suite 400, Austin, TX 78701"
                  className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] focus:border-[var(--pp-accent1)] text-xs resize-none"
                />
                <p className="text-[10px] text-[var(--pp-text-muted)] mt-1">
                  Required by federal anti-spam legislation. Rendered automatically in all email sequence footers.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "api" && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-[var(--pp-border-subtle)] pb-4">
                <h2
                  className="text-base font-bold text-[var(--pp-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  API Keys & Integrations
                </h2>
                <p className="text-xs text-[var(--pp-text-muted)]">
                  Automate PitchPilot from Zapier, Make, n8n, Python scripts, or custom CRMs
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-[var(--pp-text-secondary)] text-xs block">
                  Production Secret API Key
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={profile.api_key || ""}
                    readOnly
                    placeholder="No API key generated yet"
                    className="font-mono text-xs bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-accent1-light)]"
                  />
                  {profile.api_key && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:text-white cursor-pointer flex-shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.api_key);
                        toast.success("API key copied to clipboard!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:text-white cursor-pointer"
                    onClick={() => {
                      const newKey = generateApiKey();
                      setProfile({ ...profile, api_key: newKey });
                      toast.success("Generated new API key (pm_live_...). Click 'Save Changes' to apply.");
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    {profile.api_key ? "Regenerate Key" : "Generate API Key"}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--pp-bg-surface2)]/40 border border-[var(--pp-border-subtle)] space-y-2 text-xs">
                <p className="font-semibold text-[var(--pp-text-primary)]">Inbound Webhook Endpoint</p>
                <code className="text-[var(--pp-accent1-light)] bg-[var(--pp-bg-deepest)] px-2 py-1 rounded block w-fit">
                  POST /api/webhooks/inbound
                </code>
                <p className="text-[var(--pp-text-muted)] text-[11px]">
                  Pass header <code className="text-[var(--pp-accent1-light)]">X-API-Key: {profile.api_key || "YOUR_KEY"}</code> with JSON payload.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="border-b border-[var(--pp-border-subtle)] pb-4">
                <h2
                  className="text-base font-bold text-[var(--pp-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Notification Preferences & Plan Summary
                </h2>
                <p className="text-xs text-[var(--pp-text-muted)]">
                  Set real-time alerts for lead replies and daily executive digests
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--pp-text-primary)]">
                      Instant Reply Notifications
                    </p>
                    <p className="text-xs text-[var(--pp-text-muted)]">
                      Notify me via email immediately when a prospect sends an inbound response
                    </p>
                  </div>
                  <Switch
                    checked={profile.notify_replies}
                    onCheckedChange={(checked) => updateField("notify_replies", checked)}
                  />
                </div>

                <div className="border-t border-[var(--pp-border-subtle)]" />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--pp-text-primary)]">
                      Daily Send Digest
                    </p>
                    <p className="text-xs text-[var(--pp-text-muted)]">
                      A morning summary of emails sent, bounces caught, and opens logged
                    </p>
                  </div>
                  <Switch
                    checked={profile.notify_daily_digest}
                    onCheckedChange={(checked) => updateField("notify_daily_digest", checked)}
                  />
                </div>

                <div className="border-t border-[var(--pp-border-subtle)]" />

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--pp-text-primary)]">
                      Weekly Executive Performance Report
                    </p>
                    <p className="text-xs text-[var(--pp-text-muted)]">
                      Weekly conversion analysis and reply rate benchmarks every Monday
                    </p>
                  </div>
                  <Switch
                    checked={profile.notify_weekly_report}
                    onCheckedChange={(checked) => updateField("notify_weekly_report", checked)}
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[var(--pp-accent1)]/10 to-transparent border border-[var(--pp-accent1)]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--pp-accent1-light)]">
                    Active Plan
                  </span>
                  <p
                    className="text-lg font-bold text-[var(--pp-text-primary)] capitalize"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {profile.plan} Tier
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => (window.location.href = "/billing")}
                  className="bg-[var(--pp-accent1)] hover:bg-[var(--pp-accent1-dark)] text-white text-xs font-semibold cursor-pointer"
                >
                  Manage Subscription
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
