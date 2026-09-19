"use client";

import React from "react";
import { SpotlightCard } from "@/components/ui/card-spotlight";
import { MetricSparkline } from "./metric-sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

export function formatNumberCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(num);
}

export function clampRate(rate: number): number {
  return Math.max(0, Math.min(100, rate));
}

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  deltaPercent?: number;
  deltaPeriod?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
  sparklineData: number[];
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  suffix = "",
  deltaPercent = 8.4,
  deltaPeriod = "vs last week",
  icon: Icon,
  accent,
  sparklineData,
  isLoading = false,
}: MetricCardProps) {
  const isPositive = deltaPercent >= 0;

  return (
    <SpotlightCard
      className="p-5 flex flex-col justify-between"
      topAccent
      accentColor={`color-mix(in srgb, ${accent} 16%, transparent)`}
      style={{
        "--accent-gradient": `linear-gradient(90deg, ${accent}, transparent)`,
      } as React.CSSProperties}
    >
      {/* Top row: Icon + Delta badge */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--pp-border-subtle)]"
          style={{
            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>

        {!isLoading && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              isPositive
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {deltaPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Middle: Metric value & Sparkline */}
      <div className="flex items-end justify-between gap-2 mt-1">
        <div>
          <div
            className="text-2xl sm:text-3xl font-bold text-[var(--pp-text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isLoading ? (
              <span className="inline-block w-20 h-8 bg-[var(--pp-bg-surface2)] rounded-lg animate-pulse" />
            ) : (
              <>
                {suffix === "%"
                  ? `${clampRate(value)}%`
                  : formatNumberCompact(value)}
              </>
            )}
          </div>
          <p className="text-xs text-[var(--pp-text-muted)] font-medium mt-1">
            {label}
          </p>
        </div>

        {/* Sparkline chart */}
        <div className="flex-shrink-0 pb-1">
          <MetricSparkline
            data={sparklineData}
            color={accent}
            width={84}
            height={28}
          />
        </div>
      </div>

      {/* Bottom context line */}
      <div className="mt-3 pt-2.5 border-t border-[var(--pp-border-subtle)] flex items-center justify-between text-[10px] text-[var(--pp-text-muted)]">
        <span>{deltaPeriod}</span>
        <span className="flex items-center gap-1 text-[var(--pp-accent1-light)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--pp-accent1-light)] animate-pulse" />
          Active
        </span>
      </div>
    </SpotlightCard>
  );
}
