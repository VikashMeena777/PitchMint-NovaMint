"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Send, GitFork, Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";
import { getPlanById } from "@/lib/billing/plans";
import { Button } from "@/components/ui/button";

interface UsageMetersProps {
  currentPlan: string;
  prospectsCount?: number;
  dailyEmailsSent?: number;
  activeSequencesCount?: number;
  aiCreditsUsed?: number;
  onUpgradeClick?: () => void;
}

export function UsageMeters({
  currentPlan,
  prospectsCount = 18,
  dailyEmailsSent = 12,
  activeSequencesCount = 1,
  aiCreditsUsed = 32,
  onUpgradeClick,
}: UsageMetersProps) {
  const plan = getPlanById(currentPlan);
  const limits = plan.limits;

  const meters = [
    {
      label: "Monthly Prospects",
      current: prospectsCount,
      limit: limits.monthlyProspects,
      unit: "leads",
      icon: Users,
      color: "var(--pp-accent1)",
      isUnlimited: false,
    },
    {
      label: "Daily Send Limit",
      current: dailyEmailsSent,
      limit: limits.dailySendLimit,
      unit: "emails/day",
      icon: Send,
      color: "var(--pp-accent2)",
      isUnlimited: false,
    },
    {
      label: "Active Sequences",
      current: activeSequencesCount,
      limit: limits.activeSequences,
      unit: "flows",
      icon: GitFork,
      color: "var(--pp-accent3)",
      isUnlimited: limits.activeSequences === -1,
    },
    {
      label: "AI Generation Credits",
      current: aiCreditsUsed,
      limit: plan.id === "free" ? 50 : plan.id === "starter" ? 250 : 1000,
      unit: "generations",
      icon: Sparkles,
      color: "var(--pp-accent4)",
      isUnlimited: false,
    },
  ];

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3
            className="text-base font-bold text-[var(--pp-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Current Plan Quotas & Usage
          </h3>
          <p className="text-xs text-[var(--pp-text-muted)]">
            Resource consumption for your current {plan.name} billing cycle
          </p>
        </div>
        {plan.id !== "agency" && onUpgradeClick && (
          <Button
            size="sm"
            onClick={onUpgradeClick}
            className="text-xs bg-[var(--pp-accent1)]/10 text-[var(--pp-accent1-light)] hover:bg-[var(--pp-accent1)]/20 border border-[var(--pp-accent1)]/30 cursor-pointer"
          >
            Expand Limits
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meters.map((meter) => {
          const Icon = meter.icon;
          const percentage = meter.isUnlimited
            ? 0
            : Math.min(100, Math.round((meter.current / Math.max(1, meter.limit)) * 100));
          const isNearLimit = percentage >= 80;
          const isAtLimit = percentage >= 100;

          return (
            <div
              key={meter.label}
              className="p-4 rounded-xl bg-[var(--pp-bg-surface2)]/40 border border-[var(--pp-border-subtle)] space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${meter.color}15`, color: meter.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--pp-text-primary)]">
                      {meter.label}
                    </span>
                    <p className="text-[10px] text-[var(--pp-text-muted)]">
                      {meter.isUnlimited ? "Unlimited on this tier" : meter.unit}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--pp-text-primary)]">
                    {meter.current}
                    {!meter.isUnlimited && (
                      <span className="text-[var(--pp-text-muted)] font-normal"> / {meter.limit}</span>
                    )}
                  </span>
                  {!meter.isUnlimited && (
                    <span
                      className={`ml-1.5 text-[10px] font-semibold ${
                        isAtLimit
                          ? "text-rose-400"
                          : isNearLimit
                          ? "text-amber-400"
                          : "text-[var(--pp-text-muted)]"
                      }`}
                    >
                      ({percentage}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[var(--pp-bg-deepest)] overflow-hidden">
                {meter.isUnlimited ? (
                  <div className="h-full w-full bg-emerald-500/30 rounded-full" />
                ) : (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isAtLimit
                        ? "#ef4444"
                        : isNearLimit
                        ? "#f59e0b"
                        : meter.color,
                    }}
                  />
                )}
              </div>

              {isNearLimit && !meter.isUnlimited && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium pt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>Approaching plan quota. Upgrade to prevent campaign pauses.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
