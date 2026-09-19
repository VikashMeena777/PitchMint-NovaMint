"use client";

import React from "react";
import { Check, Building2, Target, Sparkles, Mail } from "lucide-react";

export interface StepDef {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ONBOARDING_STEPS: StepDef[] = [
  { id: 1, label: "Workspace", sublabel: "Company Profile", icon: Building2 },
  { id: 2, label: "ICP Target", sublabel: "Ideal Persona", icon: Target },
  { id: 3, label: "Voice Tone", sublabel: "AI Messaging", icon: Sparkles },
  { id: 4, label: "Email Sync", sublabel: "Inbox Dispatch", icon: Mail },
];

interface StepIndicatorProps {
  currentStep: number;
  highestCompletedStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepIndicator({
  currentStep,
  highestCompletedStep,
  onStepClick,
}: StepIndicatorProps) {
  const canNavigate = (stepId: number) => stepId <= highestCompletedStep + 1;

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = step.id <= highestCompletedStep;
          const isCurrent = step.id === currentStep;
          const isClickable = canNavigate(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`flex flex-col items-center text-center p-2 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              }`}
            >
              {/* Step Circle / Badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 shadow-sm ${
                  isCurrent
                    ? "bg-gradient-to-br from-[var(--pp-accent1)] to-[var(--pp-accent2)] text-white shadow-[0_0_20px_rgba(93,92,255,0.4)] ring-2 ring-[var(--pp-accent1-light)]"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-[var(--pp-bg-surface2)] text-[var(--pp-text-muted)] border border-[var(--pp-border-subtle)]"
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold block leading-tight ${
                  isCurrent ? "text-white" : isCompleted ? "text-[var(--pp-text-secondary)]" : "text-[var(--pp-text-muted)]"
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-[var(--pp-text-muted)] hidden sm:block mt-0.5">
                {step.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
