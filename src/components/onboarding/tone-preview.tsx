"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Flame, Briefcase, Smile, MessageSquare, Award } from "lucide-react";

export type TonePresetId =
  | "friendly"
  | "direct"
  | "formal"
  | "persuasive"
  | "casual"
  | "bold"
  | "consultative";

export interface ToneOption {
  id: TonePresetId;
  label: string;
  tagline: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  sampleSubject: (vars: { company: string; role: string }) => string;
  sampleBody: (vars: { company: string; role: string; industry: string }) => string;
}

export const TONE_PRESETS: ToneOption[] = [
  {
    id: "direct",
    label: "Direct",
    tagline: "Concise, metrics-first, zero fluff",
    emoji: "⚡",
    icon: Flame,
    accent: "var(--pp-accent1)",
    sampleSubject: ({ company }) => `Scaling outbound pipeline at ${company}`,
    sampleBody: ({ company, role }) =>
      `Hi {{firstName}}, noticing inefficiencies at ${company}? We streamline ${role} workflows at high-growth companies by 40%. Our autonomous outreach engine helped similar teams book 14 qualified demos in week 1. Do you have 8 minutes Thursday at 2 PM PST to compare benchmarks?`,
  },
  {
    id: "friendly",
    label: "Friendly",
    tagline: "Warm, empathetic, relationship-building",
    emoji: "👋",
    icon: Smile,
    accent: "var(--pp-accent3)",
    sampleSubject: ({ company }) => `Quick thought on ${company}'s outbound growth`,
    sampleBody: ({ company, role }) =>
      `Hi {{firstName}}! Hope your week is off to a great start. I've been following ${company}'s expansion and love what you are building. Leading ${role} initiatives is a huge undertaking — we built PitchMint to take the repetitive lead research and follow-ups off your plate so you can focus on conversations. Would love to share a few ideas if you're open to it!`,
  },
  {
    id: "formal",
    label: "Formal",
    tagline: "Polished, executive-level enterprise tone",
    emoji: "💼",
    icon: Briefcase,
    accent: "var(--pp-accent2)",
    sampleSubject: ({ company }) => `Strategic Partnership & Outbound Efficiency — ${company}`,
    sampleBody: ({ company, role, industry }) =>
      `Dear {{firstName}},\n\nI am contacting you regarding ${company}'s ongoing initiatives within the ${industry} sector. As ${role}, optimizing revenue team productivity while safeguarding corporate email deliverability is undoubtedly paramount. PitchMint provides enterprise-grade AI research dossiers and multi-touch sequence orchestration. I welcome the opportunity to arrange an introductory briefing at your convenience.`,
  },
  {
    id: "persuasive",
    label: "Persuasive",
    tagline: "Value-centric, strong social proof & urgency",
    emoji: "🎯",
    icon: Award,
    accent: "var(--pp-accent4)",
    sampleSubject: ({ company }) => `Why ${company}'s SDRs are spending 15 hrs on manual research`,
    sampleBody: ({ company, role }) =>
      `Hi {{firstName}}, most ${role} leaders we speak with tell us their reps spend 65% of their time researching prospects instead of closing meetings. We helped CloudScale flip that ratio, lifting outbound reply rates from 3.2% to 12.8% in 30 days. Here's the 2-minute video breakdown of how it works at ${company}. Open to exploring?`,
  },
  {
    id: "casual",
    label: "Casual",
    tagline: "Conversational, startup-native, peer-to-peer",
    emoji: "☕",
    icon: MessageSquare,
    accent: "var(--pp-accent3-light)",
    sampleSubject: ({ company }) => `Quick question re: ${company}`,
    sampleBody: ({ company, role }) =>
      `Hey {{firstName}} — saw what you're doing leading ${role} initiatives at ${company}, super cool stuff. Curious if you guys are still writing outbound emails manually or using autonomous agents? We built a lightweight tool that handles prospect research and drafts 1-to-1 notes automatically. Happy to send over a 60-second Loom if relevant!`,
  },
];

interface TonePreviewProps {
  selectedTone: TonePresetId;
  onSelectTone: (tone: TonePresetId) => void;
  companyName?: string;
  targetRole?: string;
  targetIndustry?: string;
}

export function TonePreview({
  selectedTone,
  onSelectTone,
  companyName = "NovaMint Logistics",
  targetRole = "VP of Operations",
  targetIndustry = "Supply Chain",
}: TonePreviewProps) {
  const currentPreset = TONE_PRESETS.find((t) => t.id === selectedTone) || TONE_PRESETS[0];

  const vars = {
    company: companyName.trim() || "Your Company",
    role: targetRole.trim() || "Outbound Leader",
    industry: targetIndustry.trim() || "Technology",
  };

  const subject = currentPreset.sampleSubject(vars);
  const body = currentPreset.sampleBody(vars);

  return (
    <div className="space-y-6">
      {/* Tone Selectable Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TONE_PRESETS.map((preset) => {
          const isSelected = selectedTone === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectTone(preset.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-[var(--pp-bg-surface2)] border-[var(--pp-accent1)] shadow-lg shadow-[var(--pp-accent1)]/10"
                  : "bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] hover:border-[var(--pp-border-default)] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{preset.emoji}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-[var(--pp-accent1)] text-white flex items-center justify-center text-xs shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{preset.label}</h4>
                <p className="text-xs text-[var(--pp-text-muted)] mt-0.5 leading-snug">
                  {preset.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Email Preview Card */}
      <div className="rounded-2xl bg-[var(--pp-bg-surface2)]/80 border border-[var(--pp-border-default)] p-6 shadow-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${currentPreset.accent} 0%, transparent 70%)` }}
        />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--pp-border-subtle)] text-xs">
          <div className="flex items-center gap-2 text-[var(--pp-text-muted)] font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[var(--pp-accent1-light)]" />
            <span>LIVE TONE DRAFT PREVIEW</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] text-[var(--pp-accent1-light)] font-mono text-[11px]">
            Tone: {currentPreset.label}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTone}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="text-xs text-[var(--pp-text-muted)]">
              <span className="font-semibold text-white">Subject: </span>
              <span className="text-[var(--pp-text-secondary)]">{subject}</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)] text-xs sm:text-sm text-[var(--pp-text-secondary)] whitespace-pre-line leading-relaxed font-sans">
              {body}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--pp-text-muted)] font-mono">
              <span>Personalization tags: {'{{firstName}}'}, {'{{company}}'}</span>
              <span className="text-emerald-400">Estimated Reply Index: High</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TonePreview;
