"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Clock,
  GitBranch,
  Sparkles,
  Plus,
  Trash2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SequenceStepNode {
  id?: string;
  sequence_id?: string;
  step_number: number;
  step_type: string;
  subject_template: string;
  body_template: string;
  delay_days: number;
  delay_hours: number;
  use_ai_generation: boolean;
  ai_prompt_instructions: string;
  ab_enabled?: boolean;
  ab_subject_b?: string;
  ab_body_b?: string;
  condition_type?: string;
  condition_value?: string;
}

export function validateSequenceForActivation(steps: SequenceStepNode[]): { valid: boolean; error?: string } {
  if (!steps || steps.length === 0) {
    return { valid: false, error: "Sequence must have at least one step" };
  }
  return { valid: true };
}

export function validateDelay(hours: number): boolean {
  return hours >= 0;
}

export function hasCycle(edges: [string, string][]): boolean {
  const adj = new Map<string, string[]>();
  edges.forEach(([from, to]) => {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();

  const dfs = (node: string): boolean => {
    visited.add(node);
    recStack.add(node);
    const neighbors = adj.get(node) || [];
    for (const n of neighbors) {
      if (!visited.has(n) && dfs(n)) return true;
      if (recStack.has(n)) return true;
    }
    recStack.delete(node);
    return false;
  };

  for (const node of adj.keys()) {
    if (!visited.has(node) && dfs(node)) return true;
  }
  return false;
}

interface VisualNodeGraphProps {
  steps: SequenceStepNode[];
  onSelectStep: (index: number) => void;
  selectedStepIndex: number | null;
  onAddStep: () => void;
  onDeleteStep: (index: number) => void;
  isActive?: boolean;
}

export function VisualNodeGraph({
  steps,
  onSelectStep,
  selectedStepIndex,
  onAddStep,
  onDeleteStep,
  isActive = false,
}: VisualNodeGraphProps) {
  return (
    <div className="relative w-full rounded-2xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)] p-6 md:p-10 overflow-x-auto min-h-[520px] flex flex-col items-center select-none shadow-2xl">
      {/* Background Grid Accent Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--pp-accent1) 1px, transparent 1px), radial-gradient(var(--pp-accent2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Top Trigger Node */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--pp-accent1)]/20 via-[var(--pp-accent2)]/15 to-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] shadow-[0_0_20px_rgba(95,93,240,0.15)] flex items-center gap-3 cursor-default"
        >
          <div className="w-7 h-7 rounded-xl bg-[var(--pp-accent1)]/30 text-white flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-[var(--pp-accent1-light)]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--pp-accent1-light)] block">
              CAMPAIGN TRIGGER
            </span>
            <span className="text-xs font-bold text-[var(--pp-text-primary)]">
              Prospect Enrolled / Segment Match
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />
        </motion.div>

        {/* Pulsing Connector from Trigger */}
        <div className="relative w-0.5 h-10 my-1 bg-[var(--pp-border-default)]">
          {isActive && (
            <span className="absolute left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full bg-[var(--pp-accent1)] shadow-[0_0_8px_#5d5cff] animate-bounce" />
          )}
        </div>
      </div>

      {/* Steps Pipeline */}
      {steps.length === 0 ? (
        <div className="relative z-10 my-8 text-center p-8 rounded-2xl border border-dashed border-[var(--pp-border-default)] max-w-md bg-[var(--pp-bg-surface)]/50">
          <Layers className="w-10 h-10 mx-auto text-[var(--pp-text-muted)] mb-3 opacity-40" />
          <h4 className="text-sm font-semibold text-[var(--pp-text-primary)]">No campaign steps yet</h4>
          <p className="text-xs text-[var(--pp-text-muted)] mt-1 mb-4">
            Add an email pitch, delay interval, or AI conditional branch to start this sequence.
          </p>
          <Button
            onClick={onAddStep}
            size="sm"
            className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add First Step
          </Button>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center w-full max-w-xl space-y-0">
          {steps.map((step, idx) => {
            const isSelected = selectedStepIndex === idx;
            const isCondition = step.step_type === "condition";

            return (
              <React.Fragment key={idx}>
                {/* Delay Node between steps */}
                {idx > 0 && (
                  <div className="flex flex-col items-center my-1.5">
                    <div className="relative w-0.5 h-4 bg-[var(--pp-border-default)]">
                      {isActive && (
                        <span className="absolute left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-[var(--pp-accent2-light)] animate-ping" />
                      )}
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] flex items-center gap-1.5 text-[10px] text-[var(--pp-text-secondary)] shadow-sm">
                      <Clock className="w-3 h-3 text-[var(--pp-accent3-light)]" />
                      <span>
                        Wait {step.delay_days}d {step.delay_hours > 0 ? `${step.delay_hours}h` : ""}
                      </span>
                    </div>
                    <div className="relative w-0.5 h-4 bg-[var(--pp-border-default)]" />
                  </div>
                )}

                {/* Step Node Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => onSelectStep(idx)}
                  className={`w-full p-4 rounded-2xl border transition-all cursor-pointer shadow-lg relative ${
                    isSelected
                      ? "bg-[var(--pp-bg-surface)] border-[var(--pp-accent1)] ring-1 ring-[var(--pp-accent1)] shadow-[0_0_20px_rgba(95,93,240,0.18)]"
                      : "bg-[var(--pp-bg-surface)]/80 hover:bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] hover:border-[var(--pp-border-accent)]"
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCondition
                            ? "bg-[var(--pp-accent3)]/15 text-[var(--pp-accent3-light)]"
                            : "bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)]"
                        }`}
                      >
                        {isCondition ? (
                          <GitBranch className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--pp-text-primary)]">
                            Step {step.step_number}: {isCondition ? "Condition Filter" : "Outreach Email"}
                          </span>
                          {step.use_ai_generation && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-[var(--pp-accent2)]/15 text-[var(--pp-accent2-light)] border border-[var(--pp-accent2)]/30">
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </span>
                          )}
                          {step.ab_enabled && (
                            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              A/B 50/50
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--pp-text-muted)] truncate max-w-sm">
                          {isCondition
                            ? `Rule: ${step.condition_type || "Opened previous email"}`
                            : step.subject_template || "AI Generated Subject"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStep(idx);
                        }}
                        className="h-7 w-7 text-[var(--pp-text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg"
                        title="Delete step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Branching preview if condition */}
                  {isCondition && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--pp-border-subtle)] grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <span className="font-semibold">TRUE PATH:</span> Continues to next step
                      </div>
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        <span className="font-semibold">FALSE PATH:</span> Skips or transitions
                      </div>
                    </div>
                  )}

                  {/* Active animated indicator on selected */}
                  {isSelected && (
                    <div className="absolute -left-1 top-4 bottom-4 w-1 bg-[var(--pp-accent1)] rounded-r-full shadow-[0_0_8px_rgba(95,93,240,0.8)]" />
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}

          {/* Add Step Connector & Button */}
          <div className="flex flex-col items-center pt-2">
            <div className="w-0.5 h-6 bg-[var(--pp-border-default)]" />
            <Button
              onClick={onAddStep}
              size="sm"
              variant="outline"
              disabled={steps.length >= 20}
              className="border-dashed border-[var(--pp-border-default)] hover:border-[var(--pp-accent1)] text-[var(--pp-text-secondary)] hover:text-[var(--pp-text-primary)] cursor-pointer text-xs rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Next Node {steps.length >= 20 ? "(Max 20)" : ""}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
