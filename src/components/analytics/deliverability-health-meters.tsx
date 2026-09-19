"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export type HealthStatus = "excellent" | "warning" | "critical";

export function evaluateHealth(bounceRate: number): HealthStatus {
  if (bounceRate <= 2.0) return "excellent";
  if (bounceRate <= 5.0) return "warning";
  return "critical";
}

export function clampRate(rate: number, min = 0, max = 100): number {
  return Math.min(Math.max(rate, min), max);
}

interface DeliverabilityHealthMetersProps {
  score?: number; // e.g., 98.4
  bounceRate?: number; // e.g., 1.2
  spamRate?: number; // e.g., 0.02
  inboxPlacement?: number; // e.g., 96.5
  spfValid?: boolean;
  dkimValid?: boolean;
  dmarcValid?: boolean;
}

export function DeliverabilityHealthMeters({
  score = 98.4,
  bounceRate = 1.2,
  spamRate = 0.02,
  inboxPlacement = 97.2,
  spfValid = true,
  dkimValid = true,
  dmarcValid = true,
}: DeliverabilityHealthMetersProps) {
  const clampedBounce = clampRate(bounceRate);
  const healthStatus = evaluateHealth(clampedBounce);

  const statusConfig = {
    excellent: {
      color: "var(--pp-accent4)",
      bgColor: "rgba(16, 185, 129, 0.12)",
      borderColor: "rgba(16, 185, 129, 0.25)",
      badge: "Excellent",
      icon: CheckCircle2,
      textColor: "text-emerald-400",
    },
    warning: {
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.12)",
      borderColor: "rgba(245, 158, 11, 0.25)",
      badge: "Needs Attention",
      icon: AlertTriangle,
      textColor: "text-amber-400",
    },
    critical: {
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.12)",
      borderColor: "rgba(239, 68, 68, 0.25)",
      badge: "Critical Risk",
      icon: ShieldAlert,
      textColor: "text-rose-400",
    },
  }[healthStatus];

  const StatusIcon = statusConfig.icon;

  // SVG Radial Gauge calculation for overall score
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--pp-accent4)]/15 text-[var(--pp-accent4)] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3
              className="text-base font-bold text-[var(--pp-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Deliverability & Domain Health
            </h3>
            <p className="text-xs text-[var(--pp-text-muted)]">
              Mailbox reputation, SPF/DKIM validation, and bounce monitoring
            </p>
          </div>
        </div>

        {/* Global Status Pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: statusConfig.bgColor,
            borderColor: statusConfig.borderColor,
            color: statusConfig.color,
            borderWidth: 1,
          }}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusConfig.badge}</span>
        </div>
      </div>

      {/* Main Grid: Radial Gauge + Metrics + DNS Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Deliverability Score Gauge */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--pp-bg-surface2)]/50 border border-[var(--pp-border-subtle)]">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[var(--pp-border-subtle)] fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className="fill-none"
                stroke={statusConfig.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span
                className="text-2xl font-black text-[var(--pp-text-primary)] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {score}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--pp-text-muted)] font-medium">
                Health
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--pp-text-secondary)] mt-3 font-medium text-center">
            Domain Sender Score
          </p>
        </div>

        {/* Deliverability Metrics Meters */}
        <div className="space-y-3.5 md:col-span-2">
          {/* Bounce Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--pp-text-secondary)] font-medium flex items-center gap-1.5">
                Bounce Rate
                <span className="text-[10px] text-[var(--pp-text-muted)]">(&lt;2.0% target)</span>
              </span>
              <span className={`font-semibold ${statusConfig.textColor}`}>
                {clampedBounce.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--pp-bg-deepest)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, clampedBounce * 10)}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: statusConfig.color }}
              />
            </div>
          </div>

          {/* Spam Complaint Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--pp-text-secondary)] font-medium flex items-center gap-1.5">
                Spam Complaint Rate
                <span className="text-[10px] text-[var(--pp-text-muted)]">(&lt;0.1% target)</span>
              </span>
              <span className="font-semibold text-emerald-400">
                {spamRate.toFixed(2)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--pp-bg-deepest)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, spamRate * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="h-full rounded-full bg-emerald-400"
              />
            </div>
          </div>

          {/* Inbox Placement */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--pp-text-secondary)] font-medium flex items-center gap-1.5">
                Inbox Placement
                <span className="text-[10px] text-[var(--pp-text-muted)]">(&gt;95% target)</span>
              </span>
              <span className="font-semibold text-[var(--pp-accent3)]">
                {inboxPlacement.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--pp-bg-deepest)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${inboxPlacement}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full rounded-full bg-[var(--pp-accent3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Records Status Footer */}
      <div className="pt-4 border-t border-[var(--pp-border-subtle)] flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-medium text-[var(--pp-text-muted)]">
          Protocol Verification:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "SPF", valid: spfValid },
            { label: "DKIM", valid: dkimValid },
            { label: "DMARC", valid: dmarcValid },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                item.valid
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {item.valid ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
