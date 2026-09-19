"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardTilt } from "@/components/canvas/card-tilt";
import {
  Sparkles,
  Clock,
  MessageSquareCheck,
  Play,
  Pause,
  CheckCircle2,
  Cpu,
  MailCheck,
  Building,
} from "lucide-react";

interface SequenceStep {
  step: number;
  label: string;
  tag: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
  prospect: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    insight: string;
  };
  emailSubject: string;
  emailBody: string;
  statusBadge: string;
  statusColor: string;
}

const DEMO_STEPS: SequenceStep[] = [
  {
    step: 1,
    label: "AI Research",
    tag: "Autonomous Intel",
    icon: Cpu,
    accent: "var(--pp-accent1)",
    prospect: {
      name: "Marcus Vance",
      role: "VP of Revenue Operations",
      company: "AetherScale Cloud",
      avatar: "MV",
      insight: "Recently expanded SDR team from 8 to 24 reps; announced Series B round on TechCrunch 3 weeks ago.",
    },
    emailSubject: "Synthesizing prospect telemetry...",
    emailBody: `Scanning AetherScale's recent press releases, LinkedIn job postings, and tech stack dependencies (HubSpot + Snowflake). Identifying key friction in pipeline velocity.`,
    statusBadge: "Intelligence Verified",
    statusColor: "text-[var(--pp-accent1-light)] bg-[var(--pp-accent1)]/10 border-[var(--pp-accent1)]/20",
  },
  {
    step: 2,
    label: "AI Personalization",
    tag: "Tailored Touch #1",
    icon: Sparkles,
    accent: "var(--pp-accent4)",
    prospect: {
      name: "Marcus Vance",
      role: "VP of Revenue Operations",
      company: "AetherScale Cloud",
      avatar: "MV",
      insight: "Pain point: Rep ramp time and uneven email personalization across new hires.",
    },
    emailSubject: "Scaling AetherScale's 16 new SDRs without pipeline decay",
    emailBody: `Hi Marcus, congrats on AetherScale's Series B. Noticed you recently added 16 outbound reps. When SDR headcount triples, maintaining high-converting personalization usually breaks down. We helped CloudScale cut rep prep time by 75% while lifting positive replies to 12.4%. Worth a quick 7-min look?`,
    statusBadge: "Dispatched via Gmail",
    statusColor: "text-[var(--pp-accent4-light)] bg-[var(--pp-accent4)]/10 border-[var(--pp-accent4)]/20",
  },
  {
    step: 3,
    label: "Multi-Touch Delay",
    tag: "Smart Follow-up (Day 3)",
    icon: Clock,
    accent: "var(--pp-accent3)",
    prospect: {
      name: "Marcus Vance",
      role: "VP of Revenue Operations",
      company: "AetherScale Cloud",
      avatar: "MV",
      insight: "Email opened twice in San Francisco; no reply within 72 hours. Triggering consultative case study.",
    },
    emailSubject: "Re: Scaling AetherScale's 16 new SDRs without pipeline decay",
    emailBody: `Marcus — thought you might find this relevant: here is the 1-page breakdown of how we automated lead enrichment directly into sequences for similar high-growth teams. No pitch, just the framework. Let me know if you want the Notion template.`,
    statusBadge: "Condition Met • Follow-up Sent",
    statusColor: "text-[var(--pp-accent3-light)] bg-[var(--pp-accent3)]/10 border-[var(--pp-accent3)]/20",
  },
  {
    step: 4,
    label: "Intent & Reply",
    tag: "Meeting Booked",
    icon: MessageSquareCheck,
    accent: "var(--pp-accent2)",
    prospect: {
      name: "Marcus Vance",
      role: "VP of Revenue Operations",
      company: "AetherScale Cloud",
      avatar: "MV",
      insight: "Reply received 42 mins after follow-up. AI classified intent as 'Interested / Demo Request'.",
    },
    emailSubject: "Reply: Re: Scaling AetherScale's 16 new SDRs",
    emailBody: `Hey team, this timing is spot on — we are evaluating tooling for our new cohort next week. Do you have 15 minutes this Thursday at 2 PM PST to walk me through the live workflow?`,
    statusBadge: "Sequence Completed • Calendar Booked",
    statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
];

export function SequenceDemoCard() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto progression timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStep = DEMO_STEPS[activeStepIndex];

  return (
    <CardTilt maxTilt={8} glare={true} className="w-full max-w-4xl mx-auto">
      <div className="glass-strong rounded-3xl border border-[var(--pp-border-default)] p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-[var(--pp-bg-surface)]/95">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: `radial-gradient(circle, ${activeStep.accent} 0%, transparent 70%)` }}
        />

        {/* Card Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--pp-border-subtle)] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--pp-accent1)]/15 border border-[var(--pp-border-default)] flex items-center justify-center">
              <MailCheck className="w-5 h-5 text-[var(--pp-accent1-light)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Live Autonomous Sequence Engine
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--pp-accent3)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--pp-accent3)]" />
                </span>
              </div>
              <p className="text-xs text-[var(--pp-text-muted)]">
                Watch how PitchMint moves a cold lead from zero intel to a booked calendar meeting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-[var(--pp-text-secondary)] hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              aria-label={isPlaying ? "Pause demo" : "Play demo"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
          </div>
        </div>

        {/* Step Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          {DEMO_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setActiveStepIndex(idx);
                  setIsPlaying(false);
                }}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? "bg-[var(--pp-bg-surface2)] border-[var(--pp-border-accent)] shadow-lg shadow-[var(--pp-accent1)]/10"
                    : "bg-[var(--pp-bg-surface)]/60 border-[var(--pp-border-subtle)] hover:border-[var(--pp-border-default)] opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--pp-text-muted)]">
                    Stage 0{s.step}
                  </span>
                  <span style={{ color: isCurrent ? s.accent : "var(--pp-text-muted)" }}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-xs font-semibold text-white truncate">{s.label}</div>
                {/* Active bottom line indicator */}
                {isCurrent && (
                  <motion.div
                    layoutId="step-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent3)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Step Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-[var(--pp-bg-surface2)]/80 border border-[var(--pp-border-default)] p-5 sm:p-6"
          >
            {/* Prospect Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--pp-border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pp-accent1)] to-[var(--pp-accent2)] text-white text-xs font-bold flex items-center justify-center shadow-md flex-shrink-0">
                  {activeStep.prospect.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    {activeStep.prospect.name}
                    <span className="text-xs text-[var(--pp-text-muted)] font-normal">
                      • {activeStep.prospect.role}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--pp-text-muted)] flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3 h-3 text-[var(--pp-accent1-light)]" />
                    <span>{activeStep.prospect.company}</span>
                  </div>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${activeStep.statusColor}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeStep.statusBadge}</span>
              </div>
            </div>

            {/* AI Insight Pill */}
            <div className="rounded-xl bg-[var(--pp-bg-deepest)]/70 border border-[var(--pp-border-subtle)] p-3 mb-4 text-xs text-[var(--pp-text-secondary)]">
              <span className="text-[var(--pp-accent3)] font-semibold uppercase font-mono mr-2">
                [Telemetry Insight]:
              </span>
              {activeStep.prospect.insight}
            </div>

            {/* Email Message Mockup */}
            <div className="rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-default)] p-4 sm:p-5">
              <div className="text-xs text-[var(--pp-text-muted)] pb-2 mb-3 border-b border-[var(--pp-border-subtle)] flex items-center justify-between">
                <span className="font-semibold text-[var(--pp-text-secondary)]">
                  Subject: <span className="text-white font-medium">{activeStep.emailSubject}</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--pp-accent1-light)]">PitchMint AI Agent</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)] leading-relaxed font-sans">
                {activeStep.emailBody}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </CardTilt>
  );
}

export default SequenceDemoCard;
