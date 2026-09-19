"use client";

import React from "react";
import {
  UserPlus,
  Upload,
  Zap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickOutreachBarProps {
  onAddProspect?: () => void;
  onImportCsv?: () => void;
  onQuickAiPitch?: () => void;
}

export function QuickOutreachBar({
  onAddProspect,
  onImportCsv,
  onQuickAiPitch,
}: QuickOutreachBarProps) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[var(--pp-bg-surface)] via-[var(--pp-bg-surface2)]/70 to-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] shadow-xl relative overflow-hidden">
      {/* Subtle ambient accent glow */}
      <div className="absolute top-0 right-1/4 w-72 h-20 bg-[var(--pp-accent1)]/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--pp-accent1)] to-[var(--pp-accent2)] flex items-center justify-center text-white shadow-[0_0_15px_rgba(95,93,240,0.35)] flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3
              className="text-sm sm:text-base font-bold text-[var(--pp-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quick Outreach Launchpad
            </h3>
            <p className="text-xs text-[var(--pp-text-secondary)]">
              Initiate personalized cold outreach or ingest new pipeline leads
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {onAddProspect && (
            <Button
              onClick={onAddProspect}
              size="sm"
              className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-medium cursor-pointer shadow-md hover:shadow-indigo-500/20 text-xs rounded-xl"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Add Lead
            </Button>
          )}

          {onImportCsv && (
            <Button
              onClick={onImportCsv}
              variant="outline"
              size="sm"
              className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:bg-[var(--pp-bg-surface2)] hover:text-[var(--pp-text-primary)] cursor-pointer text-xs rounded-xl"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Import CSV
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:bg-[var(--pp-bg-surface2)] hover:text-[var(--pp-text-primary)] cursor-pointer text-xs rounded-xl"
          >
            <Link href="/sequences">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-[var(--pp-accent2-light)]" />
              New Sequence
            </Link>
          </Button>

          {onQuickAiPitch && (
            <Button
              onClick={onQuickAiPitch}
              variant="ghost"
              size="sm"
              className="text-[var(--pp-accent3-light)] hover:bg-[var(--pp-accent3)]/10 hover:text-[var(--pp-accent3-light)] border border-[var(--pp-accent3)]/20 cursor-pointer text-xs rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI Pitch
            </Button>
          )}

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-xs rounded-xl"
          >
            <Link href="/analytics">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
