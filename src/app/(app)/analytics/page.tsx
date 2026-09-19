"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/lib/actions/user";
import { createClient } from "@/lib/supabase/client";
import { OutreachFunnelChart } from "@/components/analytics/outreach-funnel-chart";
import { ConversionAreaChart } from "@/components/analytics/conversion-area-chart";
import { DeliverabilityHealthMeters } from "@/components/analytics/deliverability-health-meters";
import {
  Users,
  Send,
  Eye,
  MessageSquare,
  TrendingUp,
  Target,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Stats = {
  totalProspects: number;
  emailsSent: number;
  openRate: number;
  replyRate: number;
  activeSequences: number;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(() => {
    if (!createClient()) {
      return {
        totalProspects: 348,
        emailsSent: 684,
        openRate: 52,
        replyRate: 14,
        activeSequences: 4,
      };
    }
    return null;
  });
  const [supabaseReady] = useState(() => !!createClient());
  const [isLoading, setIsLoading] = useState(() => !!createClient());

  useEffect(() => {
    if (!supabaseReady) return;

    let ignore = false;
    (async () => {
      try {
        const data = await getDashboardStats();
        if (!ignore) {
          setStats(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load analytics stats:", err);
        if (!ignore) {
          setStats({
            totalProspects: 0,
            emailsSent: 0,
            openRate: 0,
            replyRate: 0,
            activeSequences: 0,
          });
          setIsLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabaseReady]);

  const emailsSent = stats?.emailsSent ?? 0;
  const totalProspects = stats?.totalProspects ?? 0;
  const openRate = stats?.openRate ?? 0;
  const replyRate = stats?.replyRate ?? 0;

  // Derived counts for outreach funnel stages
  const deliveredCount = Math.round(emailsSent * 0.985);
  const openedCount = Math.round((openRate / 100) * emailsSent);
  const clickedCount = Math.round(openedCount * 0.38);
  const repliedCount = Math.round((replyRate / 100) * emailsSent);

  const kpiCards = [
    {
      label: "Total Prospects",
      value: totalProspects,
      format: "number" as const,
      icon: Users,
      color: "var(--pp-accent1)",
      description: "Pipeline contacts",
      delta: "+18%",
    },
    {
      label: "Emails Sent",
      value: emailsSent,
      format: "number" as const,
      icon: Send,
      color: "var(--pp-accent2)",
      description: "Dispatched outreach",
      delta: "+24%",
    },
    {
      label: "Avg. Open Rate",
      value: openRate,
      format: "percent" as const,
      icon: Eye,
      color: "var(--pp-accent3)",
      description: "Industry avg: 28%",
      delta: "+8.4%",
    },
    {
      label: "Avg. Reply Rate",
      value: replyRate,
      format: "percent" as const,
      icon: MessageSquare,
      color: "var(--pp-accent4)",
      description: "Industry avg: 5%",
      delta: "+4.1%",
    },
    {
      label: "Active Sequences",
      value: stats?.activeSequences ?? 0,
      format: "number" as const,
      icon: TrendingUp,
      color: "var(--pp-accent2)",
      description: "Flows running",
      delta: "+2",
    },
    {
      label: "Funnel Conversion",
      value:
        emailsSent > 0
          ? Math.min(100, Math.round((repliedCount / Math.max(1, emailsSent)) * 100))
          : 0,
      format: "percent" as const,
      icon: Target,
      color: "var(--pp-accent1)",
      description: "Sends → Replies",
      delta: "+3.2%",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-7xl pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-bold text-[var(--pp-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Analytics & Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] border border-[var(--pp-accent1)]/30">
              Live
            </span>
          </div>
          <p className="text-sm text-[var(--pp-text-muted)] mt-1">
            Real-time outreach funnel conversion, delivery velocity, and domain sender health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface)] text-[var(--pp-text-secondary)] hover:text-white"
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                `Stage,Count\nSent,${emailsSent}\nDelivered,${deliveredCount}\nOpened,${openedCount}\nClicked,${clickedCount}\nReplied,${repliedCount}`;
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `pitchpilot-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group rounded-2xl p-4 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] card-hover relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: kpi.color }}
              />

              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {kpi.delta}
                </span>
              </div>

              <div>
                <p
                  className="text-xl sm:text-2xl font-black text-[var(--pp-text-primary)] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isLoading ? (
                    <span className="inline-block w-14 h-6 bg-[var(--pp-bg-surface2)] rounded animate-pulse" />
                  ) : kpi.format === "percent" ? (
                    `${kpi.value}%`
                  ) : (
                    kpi.value.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-[var(--pp-text-muted)] font-medium mt-1 truncate">
                  {kpi.label}
                </p>
                <p className="text-[10px] text-[var(--pp-text-muted)] mt-0.5 opacity-60 truncate">
                  {kpi.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outreach Funnel Chart */}
        <OutreachFunnelChart
          totalSent={emailsSent}
          deliveredCount={deliveredCount}
          openedCount={openedCount}
          clickedCount={clickedCount}
          repliedCount={repliedCount}
          isLoading={isLoading}
        />

        {/* Velocity Trend Area Chart */}
        <ConversionAreaChart
          baseSent={emailsSent || 120}
          baseOpened={openedCount || 54}
          baseReplied={repliedCount || 12}
        />
      </div>

      {/* Deliverability & Sender Reputation Section */}
      <DeliverabilityHealthMeters
        score={98.4}
        bounceRate={1.2}
        spamRate={0.02}
        inboxPlacement={97.2}
        spfValid={true}
        dkimValid={true}
        dmarcValid={true}
      />
    </motion.div>
  );
}
