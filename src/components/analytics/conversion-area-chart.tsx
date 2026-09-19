"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

export function validateDateRange(start: string, end: string): boolean {
  return new Date(start).getTime() <= new Date(end).getTime();
}

export function generateHourlyBuckets(dateStr?: string) {
  const prefix = dateStr ? `${dateStr} ` : "";
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: 0,
    time: `${prefix}${String(h).padStart(2, "0")}:00`,
  }));
}

export function isChartEmpty(data: { value?: number; sent?: number; opened?: number; replied?: number }[]): boolean {
  return data.every((d) => (d.sent || 0) === 0 && (d.opened || 0) === 0 && (d.replied || 0) === 0);
}

export interface VelocityTrendPoint {
  date: string;
  sent: number;
  opened: number;
  replied: number;
}

interface ConversionAreaChartProps {
  baseSent?: number;
  baseOpened?: number;
  baseReplied?: number;
}

export function ConversionAreaChart({
  baseSent = 120,
  baseOpened = 54,
  baseReplied = 12,
}: ConversionAreaChartProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30 | 90>(14);

  // Generate realistic time-series points based on the active range
  const chartData = useMemo(() => {
    const points: VelocityTrendPoint[] = [];
    const now = new Date();

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const variance = 0.7 + Math.sin(i * 0.8) * 0.3;

      const dailySent = Math.round((baseSent / rangeDays) * 1.5 * variance);
      const dailyOpened = Math.round(dailySent * (baseOpened / Math.max(1, baseSent)));
      const dailyReplied = Math.round(dailyOpened * (baseReplied / Math.max(1, baseOpened)));

      points.push({
        date: dateLabel,
        sent: dailySent,
        opened: dailyOpened,
        replied: dailyReplied,
      });
    }
    return points;
  }, [rangeDays, baseSent, baseOpened, baseReplied]);

  const isEmpty = isChartEmpty(chartData);

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] shadow-xl space-y-5">
      {/* Chart Header + Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--pp-accent2)]/15 text-[var(--pp-accent2-light)] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3
              className="text-base font-bold text-[var(--pp-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Outreach Velocity & Conversions
            </h3>
            <p className="text-xs text-[var(--pp-text-muted)]">
              Daily send volumes, opens, and prospect replies over time
            </p>
          </div>
        </div>

        {/* Date range filter pills */}
        <div className="flex items-center gap-1 bg-[var(--pp-bg-deepest)] p-1 rounded-xl border border-[var(--pp-border-subtle)] self-start sm:self-auto text-xs">
          {([7, 14, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setRangeDays(days)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                rangeDays === days
                  ? "bg-[var(--pp-accent1)] text-white shadow-sm"
                  : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="py-20 text-center text-xs text-[var(--pp-text-muted)]">
          No outreach activity in the selected date range
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="var(--pp-accent1)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--pp-accent1)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="var(--pp-accent3)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--pp-accent3)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorReplied" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="var(--pp-accent4)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--pp-accent4)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--pp-text-muted)", fontSize: 10 }}
                axisLine={{ stroke: "var(--pp-border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--pp-text-muted)", fontSize: 10 }}
                axisLine={{ stroke: "var(--pp-border-subtle)" }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-default)] p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-[var(--pp-text-primary)] mb-1.5">{label}</p>
                        <p className="text-[var(--pp-accent1-light)] flex items-center justify-between gap-4">
                          <span>Sent:</span>
                          <span className="font-mono font-semibold">{payload[0]?.value}</span>
                        </p>
                        <p className="text-[var(--pp-accent3-light)] flex items-center justify-between gap-4">
                          <span>Opened:</span>
                          <span className="font-mono font-semibold">{payload[1]?.value}</span>
                        </p>
                        <p className="text-[var(--pp-accent4-light)] flex items-center justify-between gap-4">
                          <span>Replied:</span>
                          <span className="font-mono font-semibold">{payload[2]?.value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="sent"
                stroke="var(--pp-accent1)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSent)"
              />
              <Area
                type="monotone"
                dataKey="opened"
                stroke="var(--pp-accent3)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOpened)"
              />
              <Area
                type="monotone"
                dataKey="replied"
                stroke="var(--pp-accent4)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReplied)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-[var(--pp-border-subtle)] text-xs text-[var(--pp-text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--pp-accent1)]" />
          <span>Sent Emails</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--pp-accent3)]" />
          <span>Opened</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--pp-accent4)]" />
          <span>Replies</span>
        </div>
      </div>
    </div>
  );
}
