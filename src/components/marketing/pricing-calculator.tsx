"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, TrendingUp, Clock, Users, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PricingTierConfig {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxProspects: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const TIERS: PricingTierConfig[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    maxProspects: 25,
    description: "Try PitchMint with essential features for solo founders",
    features: [
      "25 prospects / month",
      "1 active sequence",
      "AI email personalization",
      "Basic deliverability engine",
      "Standard email tracking",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 29,
    annualPrice: 23,
    maxProspects: 200,
    description: "Ideal for growing early-stage startups and boutique agencies",
    features: [
      "200 prospects / month",
      "3 active sequences",
      "Deep AI prospect research",
      "Automated follow-up delays",
      "Real-time open & click tracking",
      "Smart reply sentiment detection",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 79,
    annualPrice: 63,
    maxProspects: 500,
    description: "Full-scale outreach engine for high-velocity sales teams",
    popular: true,
    features: [
      "500 prospects / month",
      "Unlimited active sequences",
      "Multi-provider AI generation (Groq + Gemini)",
      "Smart inbox warm-up & health monitor",
      "A/B test subject lines & body copy",
      "CSV lead enrichment drawer",
      "Priority customer support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    monthlyPrice: 199,
    annualPrice: 159,
    maxProspects: 100000,
    description: "Enterprise scale with white-glove onboarding and custom limits",
    features: [
      "Unlimited prospects & accounts",
      "Multi-client team workspaces",
      "Dedicated sending IPs & deliverability SLA",
      "Custom AI tone prompt engineering",
      "White-label PDF reporting & webhooks",
      "Dedicated Slack account manager",
    ],
  },
];

export function PricingCalculator() {
  const [prospects, setProspects] = useState<number>(250);
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  // Determine tier based on prospect volume
  const currentTier = useMemo(() => {
    if (prospects <= 25) return TIERS[0];
    if (prospects <= 200) return TIERS[1];
    if (prospects <= 500) return TIERS[2];
    return TIERS[3];
  }, [prospects]);

  // Dynamic calculations for ROI
  const metrics = useMemo(() => {
    const safeCount = Math.max(0, prospects);
    const estimatedReplies = Math.round(safeCount * 0.095); // ~9.5%
    const estimatedMeetings = Math.max(0, Math.round(safeCount * 0.038)); // ~3.8%
    const hoursSaved = Math.round(safeCount * 0.18); // ~11 min saved per manual research & draft
    const pipelineValue = estimatedMeetings * 1500; // $1500 average deal size

    return {
      replies: estimatedReplies,
      meetings: estimatedMeetings,
      hoursSaved,
      pipelineValue: pipelineValue.toLocaleString(),
    };
  }, [prospects]);

  const priceDisplay = isAnnual ? currentTier.annualPrice : currentTier.monthlyPrice;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Monthly / Annual Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span
          className={`text-sm font-medium transition-colors cursor-pointer ${
            !isAnnual ? "text-white" : "text-[var(--pp-text-muted)]"
          }`}
          onClick={() => setIsAnnual(false)}
        >
          Monthly billing
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setIsAnnual(!isAnnual)}
          aria-label="Toggle annual billing discount"
          className="relative inline-flex h-7 w-14 items-center rounded-full bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-default)] p-1 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--pp-accent1)]"
        >
          <motion.div
            animate={{ x: isAnnual ? 26 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="h-5 w-5 rounded-full bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent2)] shadow-md"
          />
        </button>
        <span
          className={`text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            isAnnual ? "text-white" : "text-[var(--pp-text-muted)]"
          }`}
          onClick={() => setIsAnnual(true)}
        >
          Annual billing
          <span className="px-2 py-0.5 rounded-full bg-[var(--pp-accent3)]/15 text-[var(--pp-accent3-light)] border border-[var(--pp-accent3)]/30 text-xs font-semibold">
            Save 20%
          </span>
        </span>
      </div>

      {/* Main Calculator Card */}
      <div className="glass-strong rounded-3xl border border-[var(--pp-border-default)] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, var(--pp-accent1) 0%, transparent 70%)" }}
        />

        {/* Slider Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <label htmlFor="prospect-slider" className="text-sm font-medium text-[var(--pp-text-secondary)] block">
                Target Prospect Volume per Month
              </label>
              <p className="text-xs text-[var(--pp-text-muted)] mt-0.5">
                Slide to calculate your team&apos;s tailored tier and projected outbound returns
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-extrabold text-[var(--pp-text-primary)] stat-number"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {prospects.toLocaleString()}
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--pp-text-muted)] font-semibold">
                leads/mo
              </span>
            </div>
          </div>

          <div className="relative pt-2 pb-2">
            <input
              id="prospect-slider"
              type="range"
              min={0}
              max={1000}
              step={25}
              value={prospects}
              onChange={(e) => setProspects(Number(e.target.value))}
              className="w-full h-2.5 bg-[var(--pp-bg-surface2)] rounded-lg appearance-none cursor-pointer accent-[var(--pp-accent1)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-accent1)]"
            />
            {/* Range markers */}
            <div className="flex justify-between text-xs text-[var(--pp-text-muted)] mt-2 font-mono">
              <span>0 (Free)</span>
              <span>200 (Starter)</span>
              <span>500 (Growth)</span>
              <span>1,000+ (Agency)</span>
            </div>
          </div>
        </div>

        {/* Tier & ROI Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-[var(--pp-border-subtle)] pt-8">
          {/* Left: Matched Plan Card */}
          <div className="lg:col-span-6 rounded-2xl bg-[var(--pp-bg-surface)]/80 border border-[var(--pp-border-default)] p-6 relative">
            {currentTier.popular && (
              <div className="absolute -top-3 right-6">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent2)] text-white text-xs font-semibold shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Recommended Tier
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--pp-accent1-light)]">
                  Matched Plan
                </span>
                <h3
                  className="text-2xl font-bold text-white mt-0.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {currentTier.name} Plan
                </h3>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span
                    className="text-4xl font-extrabold text-white stat-number"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    ${priceDisplay}
                  </span>
                  <span className="text-xs text-[var(--pp-text-muted)]">/mo</span>
                </div>
                {isAnnual && priceDisplay > 0 && (
                  <span className="text-[11px] text-[var(--pp-accent3)]">Billed annually</span>
                )}
              </div>
            </div>

            <p className="text-xs text-[var(--pp-text-secondary)] mb-5">
              {currentTier.description}
            </p>

            <ul className="space-y-2 mb-6">
              {currentTier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-xs text-[var(--pp-text-secondary)]">
                  <div className="w-4 h-4 rounded-full bg-[var(--pp-accent1)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-[var(--pp-accent1-light)]" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="w-full bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo"
            >
              <Link href={`/signup?plan=${currentTier.id}&cycle=${isAnnual ? "annual" : "monthly"}`}>
                {currentTier.monthlyPrice === 0 ? "Get Started Free" : `Choose ${currentTier.name} Plan`}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Right: Projected Outreach ROI Metrics */}
          <div className="lg:col-span-6 space-y-4">
            <h4
              className="text-sm font-semibold uppercase tracking-wider text-[var(--pp-text-muted)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Projected Monthly Return
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Replies Card */}
              <div className="rounded-xl bg-[var(--pp-bg-surface2)]/60 border border-[var(--pp-border-subtle)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--pp-text-muted)] mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--pp-accent3)]" />
                  <span>Est. Warm Replies</span>
                </div>
                <div
                  className="text-2xl font-bold text-white stat-number"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ~{metrics.replies}
                </div>
                <p className="text-[11px] text-[var(--pp-text-muted)] mt-1">Based on 9.5% benchmark</p>
              </div>

              {/* Meetings Card */}
              <div className="rounded-xl bg-[var(--pp-bg-surface2)]/60 border border-[var(--pp-border-subtle)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--pp-text-muted)] mb-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-[var(--pp-accent4-light)]" />
                  <span>Expected Meetings</span>
                </div>
                <div
                  className="text-2xl font-bold text-white stat-number"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ~{metrics.meetings}
                </div>
                <p className="text-[11px] text-[var(--pp-text-muted)] mt-1">High-intent bookings</p>
              </div>

              {/* Hours Saved Card */}
              <div className="rounded-xl bg-[var(--pp-bg-surface2)]/60 border border-[var(--pp-border-subtle)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--pp-text-muted)] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--pp-accent1-light)]" />
                  <span>SDR Hours Saved</span>
                </div>
                <div
                  className="text-2xl font-bold text-white stat-number"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ~{metrics.hoursSaved} hrs
                </div>
                <p className="text-[11px] text-[var(--pp-text-muted)] mt-1">Autonomous research</p>
              </div>

              {/* Pipeline Value Card */}
              <div className="rounded-xl bg-[var(--pp-bg-surface2)]/60 border border-[var(--pp-border-subtle)] p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--pp-text-muted)] mb-1">
                  <Users className="w-3.5 h-3.5 text-[var(--pp-accent2-light)]" />
                  <span>Pipeline Added</span>
                </div>
                <div
                  className="text-2xl font-bold text-[var(--pp-accent3)] stat-number"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ${metrics.pipelineValue}
                </div>
                <p className="text-[11px] text-[var(--pp-text-muted)] mt-1">Estimated contract value</p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] p-3 text-xs text-[var(--pp-text-secondary)] flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[var(--pp-accent3)] flex-shrink-0 animate-pulse" />
              <span>
                All tiers include automated MX/SPF verification, bounce protection, and instant unsubscribe compliance.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingCalculator;
