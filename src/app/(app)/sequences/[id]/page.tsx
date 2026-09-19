"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Save,
  Play,
  Pause,
  Wand2,
  GitBranch,
  LayoutGrid,
  Workflow,
} from "lucide-react";
import {
  VisualNodeGraph,
  type SequenceStepNode,
  validateSequenceForActivation,
} from "@/components/sequences/visual-node-graph";

type Sequence = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  total_steps: number;
  enrolled_count: number;
  created_at: string;
};

export default function SequenceEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [sequence, setSequence] = useState<Sequence | null>(null);
  const [steps, setSteps] = useState<SequenceStepNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<"graph" | "editor">("graph");

  const sequenceId = params.id as string;

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: seqData, error: seqError } = await supabase
      .from("sequences")
      .select("*")
      .eq("id", sequenceId)
      .eq("user_id", user.id)
      .single();

    if (seqError || !seqData) {
      toast.error("Sequence not found");
      router.push("/sequences");
      return;
    }
    setSequence(seqData as Sequence);

    const { data: stepsData } = await supabase
      .from("sequence_steps")
      .select("*")
      .eq("sequence_id", sequenceId)
      .order("step_number", { ascending: true });

    if (stepsData && stepsData.length > 0) {
      const mappedSteps: SequenceStepNode[] = stepsData.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        sequence_id: s.sequence_id as string,
        step_number: s.step_number as number,
        step_type: (s.step_type as string) || "email",
        subject_template: (s.subject_template as string) || "",
        body_template: (s.body_template as string) || "",
        delay_days: (s.delay_days as number) || 0,
        delay_hours: (s.delay_hours as number) || 0,
        use_ai_generation: Boolean(s.use_ai_generation),
        ai_prompt_instructions: (s.ai_prompt_instructions as string) || "",
        ab_enabled: Boolean((s.ab_test as Record<string, unknown>)?.enabled),
        ab_subject_b: ((s.ab_test as Record<string, unknown>)?.subject_b as string) || "",
        ab_body_b: ((s.ab_test as Record<string, unknown>)?.body_b as string) || "",
        condition_type: (s.condition_type as string) || "opened",
        condition_value: ((s.condition_value as Record<string, unknown>)?.value as string) || "",
      }));
      setSteps(mappedSteps);
      if (selectedStepIndex === null) setSelectedStepIndex(0);
    }
    setLoading(false);
  }, [sequenceId, router, selectedStepIndex]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addStep = () => {
    if (steps.length >= 20) {
      toast.error("Maximum 20 steps reached");
      return;
    }
    const newStep: SequenceStepNode = {
      sequence_id: sequenceId,
      step_number: steps.length + 1,
      step_type: "email",
      subject_template: "",
      body_template: "",
      delay_days: steps.length === 0 ? 0 : 2,
      delay_hours: 0,
      use_ai_generation: true,
      ai_prompt_instructions: "",
    };
    setSteps([...steps, newStep]);
    setSelectedStepIndex(steps.length);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      step_number: i + 1,
    }));
    setSteps(updated);
    if (selectedStepIndex === index) {
      setSelectedStepIndex(updated.length > 0 ? 0 : null);
    } else if (selectedStepIndex !== null && selectedStepIndex > index) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }
  };

  const updateStep = (
    index: number,
    field: keyof SequenceStepNode,
    value: unknown
  ) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSave = async () => {
    if (!sequence) return;
    setSaving(true);

    try {
      const supabase = createClient();
      if (!supabase) return;

      // Delete existing steps
      await supabase
        .from("sequence_steps")
        .delete()
        .eq("sequence_id", sequenceId);

      // Insert all steps
      if (steps.length > 0) {
        const stepsToInsert = steps.map((s) => ({
          sequence_id: sequenceId,
          step_number: s.step_number,
          step_type: s.step_type,
          subject_template: s.subject_template,
          body_template: s.body_template,
          delay_days: Math.max(0, s.delay_days),
          delay_hours: Math.max(0, s.delay_hours),
          use_ai_generation: s.use_ai_generation,
          ai_prompt_instructions: s.ai_prompt_instructions,
          ab_test: s.ab_enabled
            ? {
                enabled: true,
                subject_b: s.ab_subject_b || "",
                body_b: s.ab_body_b || "",
              }
            : null,
          condition_type: s.step_type === "condition" ? (s.condition_type || "opened") : null,
          condition_value: s.step_type === "condition" && s.condition_value
            ? { value: s.condition_value }
            : null,
        }));

        const { error: insertError } = await supabase
          .from("sequence_steps")
          .insert(stepsToInsert);

        if (insertError) throw insertError;
      }

      // Update sequence total_steps
      await supabase
        .from("sequences")
        .update({ total_steps: steps.length })
        .eq("id", sequenceId);

      toast.success("Sequence saved successfully!");
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save sequence");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!sequence) return;
    const targetStatus = sequence.status === "active" ? "paused" : "active";

    if (targetStatus === "active") {
      const check = validateSequenceForActivation(steps);
      if (!check.valid) {
        toast.error(check.error || "Cannot activate empty sequence");
        return;
      }
    }

    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("sequences")
      .update({ status: targetStatus })
      .eq("id", sequenceId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    setSequence({ ...sequence, status: targetStatus });
    toast.success(`Sequence ${targetStatus === "active" ? "activated" : "paused"}`);
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const { suggestSequenceEmails } = await import("@/lib/ai/engine");
      const supabase = createClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let valProp = "AI-powered cold outreach with verified deliverability";
      let audience = "B2B SaaS Founders and Growth Leads";
      let tone = "direct";

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("value_proposition, target_audience, tone_preset")
          .eq("id", user.id)
          .single();
        if (profile?.value_proposition) valProp = profile.value_proposition;
        if (profile?.target_audience) audience = profile.target_audience;
        if (profile?.tone_preset) tone = profile.tone_preset;
      }

      const suggestions = await suggestSequenceEmails({
        totalSteps: 4,
        value_proposition: valProp,
        target_audience: audience,
        tone: tone,
      });

      if (suggestions && suggestions.length > 0) {
        const newSteps: SequenceStepNode[] = suggestions.map((s) => ({
          sequence_id: sequenceId,
          step_number: s.step,
          step_type: "email",
          subject_template: s.subject_template,
          body_template: s.body_template,
          delay_days: s.delay_days,
          delay_hours: 0,
          use_ai_generation: true,
          ai_prompt_instructions: "",
        }));
        setSteps(newSteps);
        setSelectedStepIndex(0);
        toast.success("AI generated sequence pipeline! Review and save.");
      } else {
        toast.error("AI could not generate suggestions. Please check your API key.");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate AI sequence");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto animate-pulse">
        <Skeleton className="h-10 w-64 bg-zinc-800" />
        <Skeleton className="h-[480px] w-full bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  if (!sequence) return null;

  const currentStep = selectedStepIndex !== null ? steps[selectedStepIndex] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/sequences")}
            className="text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1
                className="text-xl sm:text-2xl font-bold text-[var(--pp-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {sequence.name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  sequence.status === "active"
                    ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                    : sequence.status === "paused"
                    ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
                    : "text-[var(--pp-text-muted)] bg-[var(--pp-bg-surface2)] border-[var(--pp-border-subtle)]"
                }`}
              >
                {sequence.status}
              </span>
            </div>
            <p className="text-xs text-[var(--pp-text-muted)] mt-0.5">
              {steps.length} steps · {sequence.enrolled_count || 0} enrolled prospects
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[var(--pp-bg-surface)] p-1 rounded-xl border border-[var(--pp-border-default)] text-xs">
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "graph"
                  ? "bg-[var(--pp-accent1)] text-white shadow-sm"
                  : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]"
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Node Graph</span>
            </button>
            <button
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "editor"
                  ? "bg-[var(--pp-accent1)] text-white shadow-sm"
                  : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Step List</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAIGenerate}
            disabled={generating}
            className="border-[var(--pp-border-accent)] text-[var(--pp-accent1-light)] hover:bg-[var(--pp-accent1)]/10 cursor-pointer text-xs rounded-xl"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1" />
            {generating ? "Generating..." : "AI Generate"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className="border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-xs rounded-xl"
          >
            {sequence.status === "active" ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Activate
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo text-xs rounded-xl"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {saving ? "Saving..." : "Save Sequence"}
          </Button>
        </div>
      </div>

      {/* Main Layout: Node Graph + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center View: Visual Node Graph or Step List */}
        <div className="lg:col-span-7 xl:col-span-8">
          {viewMode === "graph" ? (
            <VisualNodeGraph
              steps={steps}
              onSelectStep={(idx) => setSelectedStepIndex(idx)}
              selectedStepIndex={selectedStepIndex}
              onAddStep={addStep}
              onDeleteStep={removeStep}
              isActive={sequence.status === "active"}
            />
          ) : (
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedStepIndex === idx
                      ? "bg-[var(--pp-bg-surface)] border-[var(--pp-accent1)] ring-1 ring-[var(--pp-accent1)]"
                      : "bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] hover:border-[var(--pp-border-accent)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--pp-text-primary)]">
                      Step {step.step_number}: {step.step_type}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStep(idx);
                      }}
                      className="h-6 w-6 text-[var(--pp-text-muted)] hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--pp-text-muted)] mt-1 truncate">
                    {step.subject_template || "AI Generated"}
                  </p>
                </div>
              ))}
              <Button
                onClick={addStep}
                variant="outline"
                className="w-full border-dashed border-[var(--pp-border-default)] cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel: Step Inspector / Node Configuration */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] p-5 shadow-xl space-y-5">
          {currentStep && selectedStepIndex !== null ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--pp-border-subtle)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--pp-text-primary)]">
                    Configure Step {currentStep.step_number}
                  </h3>
                  <p className="text-[11px] text-[var(--pp-text-muted)]">
                    Node parameters & branch conditions
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] uppercase">
                  {currentStep.step_type}
                </span>
              </div>

              {/* Step Type Selection */}
              <div>
                <Label className="text-xs text-[var(--pp-text-secondary)] mb-1.5 block font-medium">
                  Node Action Type
                </Label>
                <Select
                  value={currentStep.step_type}
                  onValueChange={(val: string | null) =>
                    updateStep(selectedStepIndex, "step_type", val || "email")
                  }
                >
                  <SelectTrigger className="w-full bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs">
                    <SelectItem value="email">Outreach Email</SelectItem>
                    <SelectItem value="wait">Delay / Wait Interval</SelectItem>
                    <SelectItem value="condition">Conditional Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Delay Configuration */}
              {selectedStepIndex > 0 && (
                <div className="p-3 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)] space-y-2">
                  <Label className="text-xs text-[var(--pp-text-secondary)] flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[var(--pp-accent3-light)]" />
                    Wait Before Executing
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={currentStep.delay_days}
                        onChange={(e) =>
                          updateStep(
                            selectedStepIndex,
                            "delay_days",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs h-8"
                      />
                      <span className="text-[10px] text-[var(--pp-text-muted)] mt-0.5 block">Days</span>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min={0}
                        value={currentStep.delay_hours}
                        onChange={(e) =>
                          updateStep(
                            selectedStepIndex,
                            "delay_hours",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs h-8"
                      />
                      <span className="text-[10px] text-[var(--pp-text-muted)] mt-0.5 block">Hours</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Branch Settings */}
              {currentStep.step_type === "condition" && (
                <div className="p-3 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)] space-y-3">
                  <Label className="text-xs text-[var(--pp-text-secondary)] flex items-center gap-1.5 font-medium">
                    <GitBranch className="w-3.5 h-3.5 text-[var(--pp-accent2-light)]" />
                    Branch Rule
                  </Label>
                  <Select
                    value={currentStep.condition_type || "opened"}
                    onValueChange={(val: string | null) =>
                      updateStep(selectedStepIndex, "condition_type", val || "opened")
                    }
                  >
                    <SelectTrigger className="w-full bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs">
                      <SelectItem value="opened">Opened previous email</SelectItem>
                      <SelectItem value="clicked">Clicked link in previous email</SelectItem>
                      <SelectItem value="replied">Replied to sequence</SelectItem>
                      <SelectItem value="not_opened">Did not open email within 48h</SelectItem>
                      <SelectItem value="has_tag">Lead has tag</SelectItem>
                    </SelectContent>
                  </Select>

                  {currentStep.condition_type === "has_tag" && (
                    <Input
                      placeholder="e.g. Enterprise, High Priority"
                      value={currentStep.condition_value || ""}
                      onChange={(e) =>
                        updateStep(selectedStepIndex, "condition_value", e.target.value)
                      }
                      className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs h-8"
                    />
                  )}
                </div>
              )}

              {/* Email Content Configuration */}
              {currentStep.step_type === "email" && (
                <div className="space-y-4">
                  {/* AI Generation Switch */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                      <div>
                        <span className="text-xs font-semibold text-[var(--pp-text-primary)] block">
                          AI Personalization
                        </span>
                        <span className="text-[10px] text-[var(--pp-text-muted)] block">
                          Tailor copy per prospect
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={currentStep.use_ai_generation}
                      onCheckedChange={(checked) =>
                        updateStep(selectedStepIndex, "use_ai_generation", checked)
                      }
                    />
                  </div>

                  {currentStep.use_ai_generation ? (
                    <div>
                      <Label className="text-xs text-[var(--pp-text-secondary)] mb-1 block">
                        AI Directive / Focus Angle
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="Focus on their recent hiring, mention our 99% deliverability guarantee..."
                        value={currentStep.ai_prompt_instructions}
                        onChange={(e) =>
                          updateStep(selectedStepIndex, "ai_prompt_instructions", e.target.value)
                        }
                        className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-[var(--pp-text-secondary)] mb-1 block">
                          Subject Template (supports emojis 🚀 & merge tags)
                        </Label>
                        <Input
                          placeholder="Quick question for {{first_name}} 🎯"
                          value={currentStep.subject_template}
                          onChange={(e) =>
                            updateStep(selectedStepIndex, "subject_template", e.target.value)
                          }
                          className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs h-9 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[var(--pp-text-secondary)] mb-1 block">
                          Body Template
                        </Label>
                        <Textarea
                          rows={5}
                          placeholder="Hi {{first_name}}, saw your work at {{company_name}}..."
                          value={currentStep.body_template}
                          onChange={(e) =>
                            updateStep(selectedStepIndex, "body_template", e.target.value)
                          }
                          className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs rounded-xl font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* A/B Testing Toggle */}
                  <div className="pt-2 border-t border-[var(--pp-border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[var(--pp-text-secondary)] flex items-center gap-1.5 cursor-pointer">
                        <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                        Enable A/B Variant Test
                      </Label>
                      <Switch
                        checked={currentStep.ab_enabled || false}
                        onCheckedChange={(checked) =>
                          updateStep(selectedStepIndex, "ab_enabled", checked)
                        }
                      />
                    </div>

                    {currentStep.ab_enabled && (
                      <div className="p-3 rounded-xl bg-[var(--pp-bg-deepest)] border border-amber-500/20 space-y-2">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                          Variant B (50% Traffic)
                        </span>
                        <Input
                          placeholder="Alternative subject line..."
                          value={currentStep.ab_subject_b || ""}
                          onChange={(e) =>
                            updateStep(selectedStepIndex, "ab_subject_b", e.target.value)
                          }
                          className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs h-8"
                        />
                        <Textarea
                          rows={3}
                          placeholder="Alternative body copy..."
                          value={currentStep.ab_body_b || ""}
                          onChange={(e) =>
                            updateStep(selectedStepIndex, "ab_body_b", e.target.value)
                          }
                          className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs rounded-lg font-mono text-[11px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-xs text-[var(--pp-text-muted)] space-y-2">
              <Workflow className="w-8 h-8 mx-auto opacity-30 text-[var(--pp-accent1)]" />
              <p className="font-medium text-[var(--pp-text-primary)]">No node selected</p>
              <p>Click any node in the graph to configure its parameters and copy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
