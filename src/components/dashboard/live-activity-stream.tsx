"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Send,
  Eye,
  MessageSquare,
  Sparkles,
  UserPlus,
  Zap,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export function clampFeed<T>(events: T[], max = 50): T[] {
  return events.slice(0, max);
}

export interface ActivityItem {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  display?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    action: "email.replied",
    resource_type: "email",
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    display: "Reply received from John Reynolds (VP Sales at Nexa)",
  },
  {
    id: "act-2",
    action: "email.opened",
    resource_type: "email",
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    display: "Email opened: 'Quick question regarding Q4 pipeline'",
  },
  {
    id: "act-3",
    action: "prospect.enriched",
    resource_type: "prospect",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    display: "Enriched prospect with LinkedIn company intelligence",
  },
  {
    id: "act-4",
    action: "sequence.activated",
    resource_type: "sequence",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    display: "Activated sequence 'SaaS Series-A Decision Makers'",
  },
  {
    id: "act-5",
    action: "email.sent",
    resource_type: "email",
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    display: "Sent personalized pitch to Elena Rostova",
  },
  {
    id: "act-6",
    action: "prospect.created",
    resource_type: "prospect",
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    display: "Added new prospect Marcus Vance",
  },
];

function getActivityIcon(action: string) {
  if (action.includes("reply") || action.includes("replied")) {
    return { icon: MessageSquare, color: "var(--pp-accent2)", bg: "var(--pp-accent2)" };
  }
  if (action.includes("opened")) {
    return { icon: Eye, color: "var(--pp-accent3)", bg: "var(--pp-accent3)" };
  }
  if (action.includes("enriched")) {
    return { icon: Sparkles, color: "var(--pp-accent4)", bg: "var(--pp-accent4)" };
  }
  if (action.includes("sequence")) {
    return { icon: Zap, color: "var(--pp-accent1)", bg: "var(--pp-accent1)" };
  }
  if (action.includes("prospect")) {
    return { icon: UserPlus, color: "#22c55e", bg: "#22c55e" };
  }
  return { icon: Send, color: "var(--pp-accent1-light)", bg: "var(--pp-accent1)" };
}

function formatRelativeTime(dateString: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "Recently";
  }
}

export function LiveActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES);
  const [filter, setFilter] = useState<"all" | "email" | "prospect" | "sequence">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchActivities = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/activity?limit=50");
      if (res.ok) {
        const data = await res.json();
        if (data.activities && data.activities.length > 0) {
          setActivities(clampFeed(data.activities, 50));
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredActivities = useMemo(() => {
    const clamped = clampFeed(activities, 50);
    if (filter === "all") return clamped;
    return clamped.filter(
      (a) =>
        a.resource_type === filter ||
        a.action.startsWith(filter)
    );
  }, [activities, filter]);

  return (
    <div className="rounded-2xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] overflow-hidden flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--pp-border-subtle)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h3
              className="text-base font-semibold text-[var(--pp-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Real-Time Activity Stream
            </h3>
            <p className="text-xs text-[var(--pp-text-muted)]">
              Live audit feed of outreach and prospect events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={fetchActivities}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] transition-colors cursor-pointer"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[var(--pp-bg-surface2)]/80 p-1 rounded-xl border border-[var(--pp-border-subtle)] text-[11px]">
            {(["all", "email", "prospect", "sequence"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? "bg-[var(--pp-accent1)] text-white shadow-sm"
                    : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-[var(--pp-border-subtle)] overflow-y-auto max-h-[380px] scroll-smooth">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="w-8 h-8 mx-auto text-[var(--pp-text-muted)] mb-2 opacity-30" />
            <p className="text-xs text-[var(--pp-text-muted)]">
              No recent activities found for this filter
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const { icon: Icon, color, bg } = getActivityIcon(act.action);
            return (
              <div
                key={act.id}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--pp-bg-surface2)]/50 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-sm"
                    style={{ background: `${bg}18`, color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--pp-text-primary)] truncate">
                      {act.display || act.action.replace(".", " ")}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--pp-text-muted)]">
                      <span className="capitalize">{act.resource_type}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(act.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider"
                    style={{
                      color,
                      backgroundColor: `${color}10`,
                      borderColor: `${color}25`,
                    }}
                  >
                    {act.action.split(".")[1] || act.action}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="px-6 py-3 border-t border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/20 mt-auto flex items-center justify-between text-xs text-[var(--pp-text-muted)]">
        <span>Showing latest {filteredActivities.length} events</span>
        <Link
          href="/analytics"
          className="text-[var(--pp-accent1-light)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          View full analytics <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
