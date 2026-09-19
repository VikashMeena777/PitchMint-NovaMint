"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Target,
  CheckCircle2,
  Loader2,
  Globe,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { TonePreview, TonePresetId } from "./tone-preview";
import { toast } from "sonner";

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [highestCompletedStep, setHighestCompletedStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  // Step 1: Workspace
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Supply Chain");
  const [website, setWebsite] = useState("");
  const [teamSize, setTeamSize] = useState("11-50");

  // Step 2: ICP
  const [targetRole, setTargetRole] = useState("VP of Operations");
  const [targetIndustry, setTargetIndustry] = useState("Logistics & Supply Chain");
  const [targetCompanySize, setTargetCompanySize] = useState("50-200");
  const [primaryPainPoint, setPrimaryPainPoint] = useState("Rep research ramp lag");

  // Step 3: Tone
  const [selectedTone, setSelectedTone] = useState<TonePresetId>("direct");

  // Step 4: Sender
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  // Validation
  const isStep1Valid = companyName.trim().length > 0;
  const isStep2Valid = targetRole.trim().length > 0;
  const isStep3Valid = Boolean(selectedTone);
  const isStep4Valid = true; // Email setup can be skipped

  const canProceedCurrent = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedCurrent()) return;

    if (currentStep > highestCompletedStep) {
      setHighestCompletedStep(currentStep);
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Update profile metadata and database flags
          await supabase.from("users").upsert({
            id: user.id,
            company_name: companyName.trim(),
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          });

          await supabase.auth.updateUser({
            data: {
              company_name: companyName.trim(),
              onboarding_completed: true,
              tone: selectedTone,
            },
          });
        }
      }

      toast.success("Workspace configured successfully! Welcome to PitchMint.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Failed to save workspace settings. Proceeding to dashboard.");
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* 4-Step Progressive Stepper */}
      <StepIndicator
        currentStep={currentStep}
        highestCompletedStep={highestCompletedStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Main Wizard Card */}
      <div className="glass-strong rounded-3xl p-6 sm:p-10 border border-[var(--pp-border-default)] shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, var(--pp-accent1) 0%, transparent 70%)" }}
        />

        <AnimatePresence mode="wait">
          {/* STEP 1: Workspace Profile */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase font-mono font-semibold text-[var(--pp-accent1-light)] tracking-wider block mb-1">
                  Step 01 / 04
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Set up your Workspace
                </h2>
                <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)]">
                  PitchMint uses your company info to contextualize AI research angles and personalize customer pitches.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="company-name" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                    Company / Organization Name *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                    <Input
                      id="company-name"
                      placeholder="e.g. NovaMint Logistics"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="pl-10 h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-website" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Company Website URL
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                      <Input
                        id="company-website"
                        placeholder="https://novamint.io"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="pl-10 h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company-industry" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Primary Industry
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                      <Input
                        id="company-industry"
                        placeholder="e.g. Supply Chain / B2B SaaS"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="pl-10 h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-2 block">
                    Team Size
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["1-10", "11-50", "51-200", "200+"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          teamSize === size
                            ? "bg-[var(--pp-accent1)]/15 border-[var(--pp-accent1)] text-white shadow-sm"
                            : "bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] text-[var(--pp-text-secondary)] hover:border-[var(--pp-border-default)]"
                        }`}
                      >
                        {size} members
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ICP / Target Audience */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase font-mono font-semibold text-[var(--pp-accent3)] tracking-wider block mb-1">
                  Step 02 / 04
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Define your Ideal Customer (ICP)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)]">
                  Teach our AI models who your high-value decision-makers are to pinpoint authentic outbound hooks.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="target-role" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                    Target Job Roles &amp; Titles *
                  </Label>
                  <div className="relative">
                    <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                    <Input
                      id="target-role"
                      placeholder="e.g. VP of Operations, Head of Sales, CTO"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      required
                      className="pl-10 h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-industry" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Target Sector
                    </Label>
                    <Input
                      id="target-industry"
                      placeholder="e.g. Fintech, Healthcare, Cloud Infra"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      className="h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="target-company-size" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Target Company Size
                    </Label>
                    <Input
                      id="target-company-size"
                      placeholder="e.g. 50-200 employees"
                      value={targetCompanySize}
                      onChange={(e) => setTargetCompanySize(e.target.value)}
                      className="h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="target-pain-point" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                    Core Business Pain Point Solved
                  </Label>
                  <Input
                    id="target-pain-point"
                    placeholder="e.g. Inefficiencies in rep outbound prep time and low inbox deliverability"
                    value={primaryPainPoint}
                    onChange={(e) => setPrimaryPainPoint(e.target.value)}
                    className="h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Tone Preset with Live Preview */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase font-mono font-semibold text-[var(--pp-accent2-light)] tracking-wider block mb-1">
                  Step 03 / 04
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Choose your Brand Voice &amp; Tone
                </h2>
                <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)]">
                  Pick your campaign tone preset and observe the live preview adapting in real time to your workspace settings.
                </p>
              </div>

              {/* Live Tone Preview Component */}
              <TonePreview
                selectedTone={selectedTone}
                onSelectTone={(t) => setSelectedTone(t)}
                companyName={companyName || "NovaMint Logistics"}
                targetRole={targetRole || "VP of Operations"}
                targetIndustry={industry || "Supply Chain"}
              />
            </motion.div>
          )}

          {/* STEP 4: Email Connection */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase font-mono font-semibold text-emerald-400 tracking-wider block mb-1">
                  Step 04 / 04
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Connect your Sending Identity
                </h2>
                <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)]">
                  PitchMint dispatches emails directly from your verified domain to protect authority. You can connect now or skip to dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sender-name" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Default Sender Name
                    </Label>
                    <Input
                      id="sender-name"
                      placeholder="e.g. Alex Mercer"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sender-email" className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Sender Email Address
                    </Label>
                    <Input
                      id="sender-email"
                      type="email"
                      placeholder="alex@novamint.io"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl p-5 bg-[var(--pp-bg-surface2)]/80 border border-[var(--pp-border-default)] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Sending Accounts &amp; Encryption Guarantee</span>
                  </div>
                  <p className="text-xs text-[var(--pp-text-secondary)] leading-relaxed">
                    OAuth tokens and SMTP passwords are encrypted using AES-256-GCM. We never read incoming inbox emails and only dispatch outbound messages you approve.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Navigation Footer Buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--pp-border-subtle)]">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1 || isSubmitting}
            onClick={handleBack}
            className={`border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:text-white cursor-pointer ${
              currentStep === 1 ? "invisible" : ""
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>

          <Button
            type="button"
            disabled={!canProceedCurrent() || isSubmitting}
            onClick={handleNext}
            className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo px-7 h-11 text-sm shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Finalizing Workspace...
              </span>
            ) : currentStep === 4 ? (
              <span className="flex items-center gap-2">
                Launch Outreach Engine
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
