"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export function interpolateTemplate(
  text: string,
  data: Record<string, string | null | undefined>
): string {
  if (!text) return "";
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return data[key] != null ? String(data[key]) : "";
  });
}

export interface TemplatePreviewData {
  first_name: string;
  last_name: string;
  company_name: string;
  job_title: string;
  industry: string;
  icebreaker: string;
  [key: string]: string;
}

const SAMPLE_PROSPECTS: { name: string; data: TemplatePreviewData }[] = [
  {
    name: "Vikash Meena (Founder)",
    data: {
      first_name: "Vikash",
      last_name: "Meena",
      firstName: "Vikash",
      lastName: "Meena",
      company_name: "Acme AI",
      companyName: "Acme AI",
      company: "Acme AI",
      job_title: "Founder & CTO",
      title: "Founder & CTO",
      industry: "Enterprise AI",
      icebreaker: "Loved your talk on autonomous developer agents at the AI Summit",
    },
  },
  {
    name: "Sarah Connor (VP Sales)",
    data: {
      first_name: "Sarah",
      last_name: "Connor",
      firstName: "Sarah",
      lastName: "Connor",
      company_name: "Cyberdyne",
      companyName: "Cyberdyne",
      company: "Cyberdyne",
      job_title: "VP of Enterprise Sales",
      title: "VP of Enterprise Sales",
      industry: "Robotics & Defense",
      icebreaker: "Noticed Cyberdyne's recent 40% headcount expansion",
    },
  },
  {
    name: "David Chen (Head of Growth)",
    data: {
      first_name: "David",
      last_name: "Chen",
      firstName: "David",
      lastName: "Chen",
      company_name: "CloudScale",
      companyName: "CloudScale",
      company: "CloudScale",
      job_title: "Head of Growth",
      title: "Head of Growth",
      industry: "DevOps Infrastructure",
      icebreaker: "Read your excellent breakdown on SDR pipeline automation",
    },
  },
];

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    name: string;
    subject: string;
    body: string;
    category?: string;
  } | null;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
}: TemplatePreviewModalProps) {
  const [selectedProspectIdx, setSelectedProspectIdx] = useState(0);
  const [prospectData, setProspectData] = useState<TemplatePreviewData>(
    SAMPLE_PROSPECTS[0].data
  );
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const handleSelectPreset = (idx: number) => {
    setSelectedProspectIdx(idx);
    setProspectData(SAMPLE_PROSPECTS[idx].data);
  };

  const handleFieldChange = (field: string, val: string) => {
    setProspectData((prev) => ({
      ...prev,
      [field]: val,
      // Map both snake_case and camelCase aliases
      ...(field === "first_name" ? { firstName: val } : {}),
      ...(field === "company_name" ? { companyName: val, company: val } : {}),
      ...(field === "job_title" ? { title: val } : {}),
    }));
  };

  const interpolatedSubject = interpolateTemplate(template.subject, prospectData);
  const interpolatedBody = interpolateTemplate(template.body, prospectData);

  const handleCopy = () => {
    const fullMessage = `Subject: ${interpolatedSubject}\n\n${interpolatedBody}`;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    toast.success("Interpolated email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Find all variables used in this template
  const matchedVars = Array.from(
    new Set([
      ...(template.subject.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []),
      ...(template.body.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []),
    ])
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] text-[var(--pp-text-primary)] shadow-2xl p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle
                  className="text-lg font-bold text-[var(--pp-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Live Template Preview: {template.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--pp-text-muted)] mt-0.5">
                  Simulate dynamic variable interpolation with sample recipient payloads
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sample Prospect Selector */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold text-[var(--pp-text-secondary)] uppercase tracking-wider">
              Test Recipient Persona
            </Label>
            <div className="flex items-center gap-2 flex-wrap">
              {SAMPLE_PROSPECTS.map((p, idx) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleSelectPreset(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    selectedProspectIdx === idx
                      ? "bg-[var(--pp-accent1)]/15 border-[var(--pp-accent1)] text-white shadow-sm"
                      : "bg-[var(--pp-bg-deepest)] border-[var(--pp-border-subtle)] text-[var(--pp-text-muted)] hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Edit Recipient Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[var(--pp-bg-deepest)]/70 border border-[var(--pp-border-subtle)]">
            <div>
              <Label className="text-[10px] text-[var(--pp-text-muted)] block mb-1">
                {"First Name ({{first_name}})"}
              </Label>
              <Input
                value={prospectData.first_name}
                onChange={(e) => handleFieldChange("first_name", e.target.value)}
                className="h-8 text-xs bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)]"
              />
            </div>
            <div>
              <Label className="text-[10px] text-[var(--pp-text-muted)] block mb-1">
                {"Company ({{company_name}})"}
              </Label>
              <Input
                value={prospectData.company_name}
                onChange={(e) => handleFieldChange("company_name", e.target.value)}
                className="h-8 text-xs bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)]"
              />
            </div>
            <div>
              <Label className="text-[10px] text-[var(--pp-text-muted)] block mb-1">
                {"Job Title ({{job_title}})"}
              </Label>
              <Input
                value={prospectData.job_title}
                onChange={(e) => handleFieldChange("job_title", e.target.value)}
                className="h-8 text-xs bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)]"
              />
            </div>
          </div>

          {/* Active Variable Pills */}
          {matchedVars.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[var(--pp-text-muted)] font-medium mr-1">
                Interpolated Tags:
              </span>
              {matchedVars.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[var(--pp-accent1)]/10 border border-[var(--pp-accent1)]/25 text-[var(--pp-accent1-light)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Rendered Email Preview Container */}
          <div className="rounded-xl border border-[var(--pp-border-default)] bg-[var(--pp-bg-surface2)]/30 overflow-hidden shadow-inner">
            {/* Email Subject Line */}
            <div className="p-3.5 border-b border-[var(--pp-border-subtle)] bg-[var(--pp-bg-deepest)] flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--pp-text-muted)]">Subject:</span>
              <span className="text-xs font-medium text-[var(--pp-text-primary)]">
                {interpolatedSubject || <span className="italic text-[var(--pp-text-muted)]">No subject</span>}
              </span>
            </div>

            {/* Email Body */}
            <div className="p-4 bg-[var(--pp-bg-surface)] text-xs leading-relaxed text-[var(--pp-text-secondary)] whitespace-pre-wrap font-sans min-h-[160px]">
              {interpolatedBody || (
                <span className="italic text-[var(--pp-text-muted)]">No message body provided</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/40 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-[var(--pp-text-muted)] hover:text-white"
          >
            Close
          </Button>

          <Button
            size="sm"
            onClick={handleCopy}
            className="text-xs bg-[var(--pp-accent1)] hover:bg-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer glow-indigo"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy Rendered Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
