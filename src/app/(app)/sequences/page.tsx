"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getSequences,
  createSequence,
  deleteSequence,
  updateSequence,
} from "@/lib/actions/sequences";
import { SequenceBuilderModal } from "@/components/sequence-builder-modal";
import { createClient } from "@/lib/supabase/client";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  X,
  Loader2,
  Mail,
  Users,
  Clock,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { AnimatedZap } from "@/components/icons";

type SequenceRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  sequence_steps: Array<{ count: number }>;
  sequence_enrollments: Array<{ count: number }>;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Play }> = {
  draft: { label: "Draft", color: "var(--pp-text-muted)", icon: Clock },
  active: { label: "Active", color: "var(--pp-accent2)", icon: Play },
  paused: { label: "Paused", color: "var(--pp-accent3)", icon: Pause },
  completed: { label: "Completed", color: "var(--pp-accent1)", icon: Check },
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<SequenceRow[]>([]);
  const [supabaseReady] = useState(() => !!createClient());
  const [isLoading, setIsLoading] = useState(() => !!createClient());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [builderTarget, setBuilderTarget] = useState<{ id: string; name: string } | null>(null);

  const loadSequences = useCallback(async () => {
    if (!supabaseReady) return;
    setIsLoading(true);
    const result = await getSequences();
    setSequences((result.data || []) as SequenceRow[]);
    setIsLoading(false);
  }, [supabaseReady]);

  useEffect(() => {
    if (!supabaseReady) return;
    let ignore = false;
    void (async () => {
      await Promise.resolve();
      if (!ignore) {
        await loadSequences();
      }
    })();
    return () => {
      ignore = true;
    };
  }, [loadSequences, supabaseReady]);

  const handleToggleStatus = async (seq: SequenceRow) => {
    const newStatus = seq.status === "active" ? "paused" : "active";
    await updateSequence(seq.id, { status: newStatus });
    loadSequences();
  };

  const handleDelete = async (id: string) => {
    await deleteSequence(id);
    loadSequences();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-7xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--pp-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sequences
          </h1>
          <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)] mt-1">
            Automated multi-step outreach pipelines with conditional branching and AI personalization
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo text-xs sm:text-sm rounded-xl"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Sequence
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] animate-pulse space-y-3"
            >
              <div className="h-5 bg-[var(--pp-bg-surface2)] rounded w-2/3" />
              <div className="h-3 bg-[var(--pp-bg-surface2)] rounded w-full" />
              <div className="h-3 bg-[var(--pp-bg-surface2)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : sequences.length === 0 ? (
        <div className="rounded-2xl p-16 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[var(--pp-accent1)]/10 text-[var(--pp-accent1-light)] flex items-center justify-center mx-auto mb-4">
            <AnimatedZap className="w-8 h-8" animated />
          </div>
          <h3
            className="text-lg font-bold text-[var(--pp-text-primary)] mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No sequences yet
          </h3>
          <p className="text-xs sm:text-sm text-[var(--pp-text-muted)] max-w-md mx-auto mb-6">
            Build your first automated multi-step email campaign with conditional delays, open tracking, and AI-personalized pitches.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo text-xs sm:text-sm rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Build Your First Sequence
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sequences.map((seq, i) => {
            const statusInfo = STATUS_MAP[seq.status] || STATUS_MAP.draft;
            const StatusIcon = statusInfo.icon;
            const stepCount = seq.sequence_steps?.[0]?.count || 0;
            const enrollCount = seq.sequence_enrollments?.[0]?.count || 0;

            return (
              <motion.div
                key={seq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl p-5 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-subtle)] hover:border-[var(--pp-border-accent)] transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Top Status & Controls */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      style={{
                        color: statusInfo.color,
                        backgroundColor: `${statusInfo.color}14`,
                        borderColor: `${statusInfo.color}28`,
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleStatus(seq)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--pp-bg-surface2)] text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] transition-colors cursor-pointer"
                        title={seq.status === "active" ? "Pause sequence" : "Activate sequence"}
                      >
                        {seq.status === "active" ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                      <button
                        onClick={() => handleDelete(seq.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[var(--pp-text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete sequence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <Link href={`/sequences/${seq.id}`} className="block group/link cursor-pointer">
                    <h3
                      className="text-base font-bold text-[var(--pp-text-primary)] group-hover/link:text-[var(--pp-accent1-light)] transition-colors truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {seq.name}
                    </h3>
                    <p className="text-xs text-[var(--pp-text-muted)] mt-1 line-clamp-2 min-h-[32px]">
                      {seq.description || "Automated outreach pipeline targeting qualified B2B leads."}
                    </p>
                  </Link>

                  {/* Mini Visual Flow Pipeline */}
                  <div className="my-4 p-2.5 rounded-xl bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-subtle)] flex items-center gap-2 overflow-x-auto">
                    <div className="w-5 h-5 rounded-md bg-[var(--pp-accent1)]/20 text-[var(--pp-accent1-light)] flex items-center justify-center text-[10px] font-mono flex-shrink-0">
                      T
                    </div>
                    <div className="w-3 h-0.5 bg-[var(--pp-border-default)] flex-shrink-0" />
                    <div className="w-5 h-5 rounded-md bg-[var(--pp-accent2)]/20 text-[var(--pp-accent2-light)] flex items-center justify-center text-[10px] font-mono flex-shrink-0">
                      1
                    </div>
                    {stepCount > 1 && (
                      <>
                        <div className="w-3 h-0.5 bg-[var(--pp-border-default)] flex-shrink-0" />
                        <div className="w-5 h-5 rounded-md bg-[var(--pp-accent3)]/20 text-[var(--pp-accent3-light)] flex items-center justify-center text-[10px] font-mono flex-shrink-0">
                          {stepCount}
                        </div>
                      </>
                    )}
                    <span className="text-[10px] text-[var(--pp-text-muted)] ml-auto flex-shrink-0 font-medium">
                      {stepCount} node{stepCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Bottom Stats & Visual Builder CTA */}
                <div className="flex items-center justify-between text-xs text-[var(--pp-text-muted)] pt-3 border-t border-[var(--pp-border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[var(--pp-accent1-light)]" />
                      {stepCount} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      {enrollCount} enrolled
                    </span>
                  </div>

                  <Link
                    href={`/sequences/${seq.id}`}
                    className="flex items-center gap-1 text-[var(--pp-accent1-light)] hover:underline font-semibold cursor-pointer"
                  >
                    <span>Open Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Sequence Modal */}
      <CreateSequenceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadSequences}
      />

      {/* Legacy Builder Modal fallback */}
      {builderTarget && (
        <SequenceBuilderModal
          isOpen={!!builderTarget}
          onClose={() => {
            setBuilderTarget(null);
            loadSequences();
          }}
          sequenceId={builderTarget.id}
          sequenceName={builderTarget.name}
        />
      )}
    </motion.div>
  );
}

function CreateSequenceModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await createSequence({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setName("");
      setDescription("");
      onSuccess();
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2
                      className="text-base font-bold text-[var(--pp-text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      New Outreach Sequence
                    </h2>
                    <p className="text-xs text-[var(--pp-text-muted)]">
                      Set up automated campaign flow
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--pp-bg-surface2)] text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <Label className="text-xs text-[var(--pp-text-secondary)] mb-1.5 block font-medium">
                    Sequence Name *
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. Q4 Series-A Founders Outreach"
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs h-9 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs text-[var(--pp-text-secondary)] mb-1.5 block font-medium">
                    Campaign Description (optional)
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Targeting YC/Techstars founders looking to scale outbound pipeline..."
                    rows={3}
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs rounded-xl resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-xs text-[var(--pp-text-muted)] cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo text-xs rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create & Configure"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
