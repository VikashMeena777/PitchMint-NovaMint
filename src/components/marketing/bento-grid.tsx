"use client";

import { CardTilt } from "@/components/canvas/card-tilt";
import {
  AnimatedNodes,
  AnimatedSparkles,
  AnimatedShield,
  AnimatedChart,
  AnimatedZap,
  AnimatedMail,
} from "@/components/icons";
import { ShieldCheck, Flame } from "lucide-react";

export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* ━━━ BENTO 1 (WIDE: 2 COLS): Autonomous Prospect Intelligence ━━━ */}
      <div className="lg:col-span-2">
        <CardTilt maxTilt={6} glare={true} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] p-8 relative overflow-hidden shadow-xl hover:border-[var(--pp-border-accent)] transition-colors duration-300 flex flex-col justify-between">
            {/* Ambient Background Gradient */}
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: "radial-gradient(circle, var(--pp-accent1) 0%, transparent 70%)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pp-accent1)]/15 border border-[var(--pp-border-default)] flex items-center justify-center">
                  <AnimatedSparkles size={24} className="text-[var(--pp-accent1-light)]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--pp-accent1)]/10 text-[var(--pp-accent1-light)] border border-[var(--pp-accent1)]/20 text-xs font-semibold">
                  Autonomous Web Intel
                </span>
              </div>

              <h3
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Deep Multi-Source AI Prospect Research
              </h3>
              <p className="text-sm text-[var(--pp-text-secondary)] leading-relaxed max-w-xl mb-6">
                Before writing a single word, PitchMint scans prospect company telemetry, executive LinkedIn posts, recent funding press, and tech stack fingerprints. Every outbound touchpoint is grounded in real, verifiable context.
              </p>
            </div>

            {/* Visual Micro-Card in Bento */}
            <div className="rounded-2xl bg-[var(--pp-bg-surface2)]/80 border border-[var(--pp-border-subtle)] p-4 sm:p-5 mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--pp-text-muted)] pb-3 mb-3 border-b border-[var(--pp-border-subtle)] font-mono">
                <span>RESEARCH TELEMETRY RUNNER</span>
                <span className="text-[var(--pp-accent3)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--pp-accent3)] animate-pulse" />
                  LIVE EXTRACT
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)]">
                  <span className="text-[var(--pp-text-muted)] block text-[11px]">Recent Trigger</span>
                  <span className="text-white font-medium mt-0.5 block">Hiring 12 AEs &amp; SDRs</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)]">
                  <span className="text-[var(--pp-text-muted)] block text-[11px]">Tech Stack Detected</span>
                  <span className="text-[var(--pp-accent1-light)] font-medium mt-0.5 block">Salesforce + Apollo</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)]">
                  <span className="text-[var(--pp-text-muted)] block text-[11px]">Primary Pain Point</span>
                  <span className="text-[var(--pp-accent3)] font-medium mt-0.5 block">Pipeline Ramp Lag</span>
                </div>
              </div>
            </div>
          </div>
        </CardTilt>
      </div>

      {/* ━━━ BENTO 2 (1 COL): Deliverability & Domain Protection ━━━ */}
      <div className="lg:col-span-1">
        <CardTilt maxTilt={8} glare={true} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] p-8 relative overflow-hidden shadow-xl hover:border-[var(--pp-border-accent)] transition-colors duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <AnimatedShield size={24} className="text-emerald-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 98.4% Inbox
                </span>
              </div>

              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Zero-Spam Deliverability Guard
              </h3>
              <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)] leading-relaxed mb-6">
                Intelligent sending throttles, automated warm-up ramping, and real-time SPF/DKIM/DMARC health verification to ensure primary inbox placement.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { label: "SPF & DKIM Verified", status: "Active" },
                { label: "DMARC Policy Enforced", status: "Pass" },
                { label: "Bounce Shield Rate", status: "< 1.2%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-xs"
                >
                  <span className="text-[var(--pp-text-secondary)]">{item.label}</span>
                  <span className="text-emerald-400 font-semibold font-mono">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </CardTilt>
      </div>

      {/* ━━━ BENTO 3 (1 COL): Smart Reply Intent Classifier ━━━ */}
      <div className="lg:col-span-1">
        <CardTilt maxTilt={8} glare={true} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] p-8 relative overflow-hidden shadow-xl hover:border-[var(--pp-border-accent)] transition-colors duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pp-accent4)]/15 border border-[var(--pp-accent4)]/30 flex items-center justify-center">
                  <AnimatedZap size={24} className="text-[var(--pp-accent4-light)]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--pp-accent4)]/10 text-[var(--pp-accent4-light)] border border-[var(--pp-accent4)]/20 text-xs font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> AI Intent
                </span>
              </div>

              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Instant Sentiment Routing
              </h3>
              <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)] leading-relaxed mb-6">
                AI categorizes replies the second they arrive into Interested, Out of Office, or Referral. Sequences auto-pause and reps get instant notifications.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                <span>&quot;Let&apos;s chat next Tuesday&quot;</span>
                <span className="font-bold uppercase text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Interested</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <span>&quot;Contact our CTO instead&quot;</span>
                <span className="font-bold uppercase text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">Referral</span>
              </div>
            </div>
          </div>
        </CardTilt>
      </div>

      {/* ━━━ BENTO 4 (WIDE: 2 COLS): Visual Multi-Touch Sequences ━━━ */}
      <div className="lg:col-span-2">
        <CardTilt maxTilt={6} glare={true} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] p-8 relative overflow-hidden shadow-xl hover:border-[var(--pp-border-accent)] transition-colors duration-300 flex flex-col justify-between">
            {/* Ambient background glow */}
            <div
              className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: "radial-gradient(circle, var(--pp-accent2) 0%, transparent 70%)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pp-accent2)]/15 border border-[var(--pp-border-default)] flex items-center justify-center">
                  <AnimatedNodes size={24} className="text-[var(--pp-accent2-light)]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--pp-accent2)]/10 text-[var(--pp-accent2-light)] border border-[var(--pp-accent2)]/20 text-xs font-semibold">
                  Dynamic Step Branching
                </span>
              </div>

              <h3
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Visual Multi-Touch Sequence Graph
              </h3>
              <p className="text-sm text-[var(--pp-text-secondary)] leading-relaxed max-w-xl mb-6">
                Orchestrate sophisticated follow-up paths with intelligent delays, automated A/B variations, and conditional branching based on prospect engagement triggers.
              </p>
            </div>

            {/* Sequence Graph Visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] relative">
                <span className="text-[10px] font-mono text-[var(--pp-accent1-light)] font-bold uppercase block mb-1">
                  Touch 01
                </span>
                <h4 className="text-xs font-semibold text-white mb-0.5">Hyper-Personalized Opener</h4>
                <p className="text-[11px] text-[var(--pp-text-muted)]">Research hook + value prop</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] relative">
                <span className="text-[10px] font-mono text-[var(--pp-accent3)] font-bold uppercase block mb-1">
                  Touch 02 • +3 Days
                </span>
                <h4 className="text-xs font-semibold text-white mb-0.5">Case Study Proof</h4>
                <p className="text-[11px] text-[var(--pp-text-muted)]">Conditional if unopened/no reply</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] relative">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                  Touch 03 • +4 Days
                </span>
                <h4 className="text-xs font-semibold text-white mb-0.5">Low-Friction Close</h4>
                <p className="text-[11px] text-[var(--pp-text-muted)]">Direct calendar booking link</p>
              </div>
            </div>
          </div>
        </CardTilt>
      </div>

      {/* ━━━ BENTO 5 (1 COL): Real-Time Recharts Analytics ━━━ */}
      <div className="lg:col-span-1">
        <CardTilt maxTilt={8} glare={true} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] p-8 relative overflow-hidden shadow-xl hover:border-[var(--pp-border-accent)] transition-colors duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pp-accent3)]/15 border border-[var(--pp-accent3)]/30 flex items-center justify-center">
                  <AnimatedChart size={24} className="text-[var(--pp-accent3)]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--pp-accent3)]/10 text-[var(--pp-accent3-light)] border border-[var(--pp-accent3)]/20 text-xs font-semibold">
                  Real-Time
                </span>
              </div>

              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Outreach Telemetry
              </h3>
              <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)] leading-relaxed mb-6">
                Full-funnel attribution from first email dispatch to booked demo. Track open velocities, click patterns, and conversion rates live.
              </p>
            </div>

            <div className="rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--pp-text-muted)]">Dispatched</span>
                <span className="text-white font-mono font-semibold">1,240</span>
              </div>
              <div className="w-full bg-[var(--pp-bg-deepest)] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[var(--pp-accent1)] h-full w-[85%]" />
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-[var(--pp-text-muted)]">Replies</span>
                <span className="text-[var(--pp-accent3)] font-mono font-semibold">124 (10%)</span>
              </div>
              <div className="w-full bg-[var(--pp-bg-deepest)] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[var(--pp-accent3)] h-full w-[45%]" />
              </div>
            </div>
          </div>
        </CardTilt>
      </div>

      {/* ━━━ BENTO 6 (1 COL): Multi-Provider AI Resilience ━━━ */}
      <div className="lg:col-span-2">
        <CardTilt maxTilt={6} glare={true} className="h-full">
          <div className="h-full rounded-3xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] p-8 relative overflow-hidden shadow-xl hover:border-[var(--pp-border-accent)] transition-colors duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--pp-accent1)]/20 to-[var(--pp-accent3)]/20 border border-[var(--pp-border-default)] flex items-center justify-center">
                  <AnimatedMail size={24} className="text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[var(--pp-accent3)]/10 text-[var(--pp-accent3-light)] border border-[var(--pp-accent3)]/20 text-xs font-semibold">
                  99.99% Model Uptime
                </span>
              </div>

              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Multi-Provider AI Fallback Mesh
              </h3>
              <p className="text-sm text-[var(--pp-text-secondary)] leading-relaxed max-w-xl mb-4">
                PitchMint pairs Groq&apos;s lightning-fast inference with Google Gemini Pro. If one upstream provider experiences latency or rate-limiting, requests failover instantly without failing your scheduled campaign.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3.5 py-2 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-xs font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Primary: Groq Llama-3.3-70b (Fast Inference)</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-xs font-medium text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--pp-accent3)]" />
                <span>Backup: Google Gemini 1.5 Flash</span>
              </div>
            </div>
          </div>
        </CardTilt>
      </div>
    </div>
  );
}

export default BentoGrid;
