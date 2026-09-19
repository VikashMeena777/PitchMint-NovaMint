"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Send,
  Eye,
  MessageSquare,
  ArrowUpRight,
  Zap,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/card-spotlight";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/user";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QuickOutreachBar } from "@/components/dashboard/quick-outreach-bar";
import { LiveActivityStream } from "@/components/dashboard/live-activity-stream";
import { AddProspectModal } from "@/components/add-prospect-modal";
import { CsvImportModal } from "@/components/csv-import-modal";
import { AIComposeModal } from "@/components/ai-compose-modal";

type DashboardData = {
  totalProspects: number;
  emailsSent: number;
  openRate: number;
  replyRate: number;
  activeSequences: number;
  recentActivity: Array<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    status: string;
    created_at: string;
  }>;
};

const STATUS_COLORS: Record<string, string> = {
  new: "var(--pp-accent1)",
  contacted: "var(--pp-accent4)",
  opened: "var(--pp-accent3)",
  replied: "var(--pp-accent2)",
  interested: "#22c55e",
  not_interested: "#ef4444",
  meeting_booked: "var(--pp-accent3)",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const loadStats = useCallback(async () => {
    const stats = await getDashboardStats();
    setData(stats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const stats = await getDashboardStats();
      if (!ignore) {
        setData(stats);
        setIsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Synthetic 7-day sparkline trends based on real stats
  const total = data?.totalProspects ?? 0;
  const sent = data?.emailsSent ?? 0;
  const openRate = data?.openRate ?? 0;
  const replyRate = data?.replyRate ?? 0;

  const prospectsSparkline = [
    Math.max(0, total - 12),
    Math.max(0, total - 8),
    Math.max(0, total - 6),
    Math.max(0, total - 4),
    Math.max(0, total - 2),
    Math.max(0, total - 1),
    total,
  ];

  const sentSparkline = [
    Math.max(0, Math.round(sent * 0.4)),
    Math.max(0, Math.round(sent * 0.55)),
    Math.max(0, Math.round(sent * 0.68)),
    Math.max(0, Math.round(sent * 0.75)),
    Math.max(0, Math.round(sent * 0.84)),
    Math.max(0, Math.round(sent * 0.92)),
    sent,
  ];

  const openRateSparkline = [
    Math.max(0, openRate - 8),
    Math.max(0, openRate - 4),
    Math.max(0, openRate - 2),
    Math.max(0, openRate + 3),
    Math.max(0, openRate + 1),
    Math.max(0, openRate - 1),
    openRate,
  ];

  const replyRateSparkline = [
    Math.max(0, replyRate - 3),
    Math.max(0, replyRate - 1),
    Math.max(0, replyRate + 2),
    Math.max(0, replyRate - 1),
    Math.max(0, replyRate + 1),
    Math.max(0, replyRate),
    replyRate,
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--pp-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dashboard
          </h1>
          <p className="text-[var(--pp-text-secondary)] text-xs sm:text-sm mt-1">
            Real-time pipeline metrics and automated outreach intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo shadow-lg transition-all duration-200 text-xs sm:text-sm rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Prospects
          </Button>
        </div>
      </div>

      {/* Quick Outreach Action Bar */}
      <QuickOutreachBar
        onAddProspect={() => setShowAddModal(true)}
        onImportCsv={() => setShowCsvModal(true)}
        onQuickAiPitch={() => setShowAiModal(true)}
      />

      {/* Metric KPI Cards with Sparklines & Delta Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Prospects"
          value={total}
          deltaPercent={14.2}
          deltaPeriod="vs last week"
          icon={Users}
          accent="var(--pp-accent1)"
          sparklineData={prospectsSparkline}
          isLoading={isLoading}
        />
        <MetricCard
          label="Emails Sent"
          value={sent}
          deltaPercent={22.8}
          deltaPeriod="vs last week"
          icon={Send}
          accent="var(--pp-accent2)"
          sparklineData={sentSparkline}
          isLoading={isLoading}
        />
        <MetricCard
          label="Open Rate"
          value={openRate}
          suffix="%"
          deltaPercent={5.6}
          deltaPeriod="vs benchmark"
          icon={Eye}
          accent="var(--pp-accent3)"
          sparklineData={openRateSparkline}
          isLoading={isLoading}
        />
        <MetricCard
          label="Reply Rate"
          value={replyRate}
          suffix="%"
          deltaPercent={3.1}
          deltaPeriod="vs benchmark"
          icon={MessageSquare}
          accent="var(--pp-accent4)"
          sparklineData={replyRateSparkline}
          isLoading={isLoading}
        />
      </div>

      {/* Main Grid: Real-Time Stream & Recent Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Stream */}
        <div className="lg:col-span-2">
          <LiveActivityStream />
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Active Sequences Card */}
          <SpotlightCard
            className="p-5"
            topAccent
            accentColor="rgba(140, 61, 252, 0.2)"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--pp-accent2)]/15 text-[var(--pp-accent2-light)] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--pp-text-primary)]">
                    Active Sequences
                  </h4>
                  <p className="text-[11px] text-[var(--pp-text-muted)]">
                    Automated outreach flows
                  </p>
                </div>
              </div>
              <Link
                href="/sequences"
                className="text-xs text-[var(--pp-accent2-light)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="h-6 bg-[var(--pp-bg-surface2)] rounded-md animate-pulse" />
            ) : data && data.activeSequences > 0 ? (
              <div className="p-3.5 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--pp-text-secondary)]">Running campaigns</span>
                  <span className="text-base font-bold text-emerald-400">
                    {data.activeSequences} Active
                  </span>
                </div>
                <div className="w-full bg-[var(--pp-bg-surface2)] h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent2)] h-full w-3/4 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)] text-center">
                <p className="text-xs text-[var(--pp-text-muted)]">
                  No active sequences running right now.
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-3 text-xs border-[var(--pp-border-default)] cursor-pointer"
                >
                  <Link href="/sequences">Build Sequence</Link>
                </Button>
              </div>
            )}
          </SpotlightCard>

          {/* Recent Prospects mini list */}
          <div className="rounded-2xl p-5 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-[var(--pp-text-primary)]">
                  Recent Leads
                </h4>
                <p className="text-[11px] text-[var(--pp-text-muted)]">
                  Newest additions to pipeline
                </p>
              </div>
              <Link
                href="/prospects"
                className="text-xs text-[var(--pp-accent1-light)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-[var(--pp-bg-surface2)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentActivity.slice(0, 4).map((p) => {
                  const initials =
                    [p.first_name?.[0], p.last_name?.[0]].filter(Boolean).join("").toUpperCase() ||
                    p.email[0].toUpperCase();
                  const name =
                    [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
                  const statusColor = STATUS_COLORS[p.status] || "var(--pp-text-muted)";

                  return (
                    <Link
                      key={p.id}
                      href={`/prospects/${p.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--pp-bg-surface2)] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: `${statusColor}18`, color: statusColor }}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--pp-text-primary)] group-hover:text-[var(--pp-accent1-light)] transition-colors truncate">
                            {name}
                          </p>
                          <p className="text-[10px] text-[var(--pp-text-muted)] truncate">
                            {p.company_name || p.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 text-[9px] rounded-full font-semibold border flex-shrink-0 capitalize"
                        style={{
                          color: statusColor,
                          backgroundColor: `${statusColor}10`,
                          borderColor: `${statusColor}25`,
                        }}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--pp-text-muted)]">
                No prospects yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProspectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadStats}
      />
      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onSuccess={loadStats}
      />
      {showAiModal && (
        <AIComposeModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          prospect={{
            id: "demo",
            email: "founder@example.com",
            first_name: "Alex",
            last_name: "Rivers",
            company_name: "HyperScale AI",
            job_title: "CEO & Co-founder",
          }}
        />
      )}
    </div>
  );
}
