"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getTemplates,
  createTemplate,
  deleteTemplate,
  type EmailTemplate,
} from "@/lib/actions/templates";
import { STARTER_TEMPLATES } from "@/lib/constants/starter-templates";
import {
  TemplatePreviewModal,
  interpolateTemplate,
} from "@/components/templates/template-preview-modal";
import {
  Plus,
  Trash2,
  Copy,
  FileText,
  Sparkles,
  Search,
  LayoutGrid,
  FolderOpen,
  X,
  Save,
  BarChart2,
  Eye,
} from "lucide-react";

export { interpolateTemplate };

const CATEGORIES = [
  { value: "all", label: "All Templates" },
  { value: "outreach", label: "Outreach" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "meeting", label: "Meeting" },
  { value: "general", label: "General" },
];

const VARIABLE_PILLS = [
  { tag: "{{first_name}}", label: "First Name" },
  { tag: "{{company_name}}", label: "Company" },
  { tag: "{{job_title}}", label: "Job Title" },
  { tag: "{{industry}}", label: "Industry" },
  { tag: "{{icebreaker}}", label: "AI Icebreaker" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Preview modal state
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Create form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    body: "",
    category: "general",
  });

  const loadTemplates = useCallback(async () => {
    try {
      const result = await getTemplates(category !== "all" ? category : undefined);
      setTemplates((result.data || []) as EmailTemplate[]);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCreating(true);
    try {
      const result = await createTemplate(newTemplate);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Template created successfully!");
        setNewTemplate({ name: "", subject: "", body: "", category: "general" });
        setShowCreate(false);
        loadTemplates();
      }
    } catch (err) {
      console.error("Create template error:", err);
      toast.error("Failed to save template. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleSeedStarters = async () => {
    try {
      let count = 0;
      for (const template of STARTER_TEMPLATES) {
        const result = await createTemplate(template);
        if (!result.error) count++;
      }
      toast.success(`Added ${count} starter templates!`);
      loadTemplates();
    } catch (err) {
      console.error("Seed starters error:", err);
      toast.error("Failed to add starter templates.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTemplate(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Template deleted");
        loadTemplates();
      }
    } catch (err) {
      console.error("Delete template error:", err);
      toast.error("Failed to delete template.");
    }
  };

  const handleCopy = (template: EmailTemplate) => {
    const text = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(text);
    toast.success("Template copied to clipboard!");
  };

  const handleOpenPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const insertVariable = (tag: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      body: prev.body + (prev.body && !prev.body.endsWith(" ") ? " " : "") + tag,
    }));
  };

  const filtered = templates.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-[var(--pp-text-primary)] flex items-center gap-2.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <FileText className="h-6 w-6 text-[var(--pp-accent1)]" />
            Outreach Templates
          </h1>
          <p className="text-sm text-[var(--pp-text-muted)] mt-1">
            Build, test, and personalize dynamic cold pitch and follow-up templates
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {templates.length === 0 && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedStarters}
              className="text-xs border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface)] text-[var(--pp-text-secondary)] hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[var(--pp-accent3)]" />
              Add Starters
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="text-xs bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer glow-indigo"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--pp-text-muted)]" />
          <Input
            placeholder="Search templates by subject or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] text-[var(--pp-text-primary)]"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                category === cat.value
                  ? "bg-[var(--pp-accent1)]/15 text-white border border-[var(--pp-accent1)]/40 shadow-sm"
                  : "text-[var(--pp-text-muted)] hover:text-white hover:bg-[var(--pp-bg-surface)] border border-transparent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Template Drawer/Card */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-[var(--pp-bg-surface)] border-[var(--pp-accent1)]/40 shadow-xl rounded-2xl">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--pp-border-subtle)] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                    <h3
                      className="text-sm font-bold text-[var(--pp-text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Compose Outreach Template
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-1 rounded-lg text-[var(--pp-text-muted)] hover:text-white hover:bg-[var(--pp-bg-surface2)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--pp-text-secondary)] block mb-1">
                      Template Name
                    </label>
                    <Input
                      placeholder="e.g., Cold SaaS Founder Pitch"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, name: e.target.value })
                      }
                      className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--pp-text-secondary)] block mb-1">
                      Category
                    </label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(v: string | null) =>
                        setNewTemplate({ ...newTemplate, category: v || "general" })
                      }
                    >
                      <SelectTrigger className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] text-xs">
                        <SelectItem value="outreach">Outreach</SelectItem>
                        <SelectItem value="follow_up">Follow-Up</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--pp-text-secondary)] block mb-1">
                    Subject Line
                  </label>
                  <Input
                    placeholder="Quick question regarding {{company_name}}'s pipeline"
                    value={newTemplate.subject}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, subject: e.target.value })
                    }
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-[11px] font-semibold text-[var(--pp-text-secondary)]">
                      Email Body (Supports Mustache Tags)
                    </label>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-[var(--pp-text-muted)] mr-1">Insert tag:</span>
                      {VARIABLE_PILLS.map((p) => (
                        <button
                          type="button"
                          key={p.tag}
                          onClick={() => insertVariable(p.tag)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--pp-bg-deepest)] hover:bg-[var(--pp-accent1)]/20 border border-[var(--pp-border-subtle)] text-[var(--pp-accent1-light)] cursor-pointer transition-colors"
                        >
                          {p.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Hi {{first_name}},&#10;&#10;I noticed your work at {{company_name}} and wanted to reach out..."
                    value={newTemplate.body}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, body: e.target.value })
                    }
                    rows={6}
                    className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-xs font-sans resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--pp-border-subtle)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreate(false)}
                    className="text-xs text-[var(--pp-text-muted)] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={creating}
                    className="text-xs bg-[var(--pp-accent1)] hover:bg-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    {creating ? "Saving..." : "Save Template"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] animate-pulse rounded-2xl">
              <CardContent className="p-5 space-y-3">
                <div className="h-4 bg-[var(--pp-bg-surface2)] rounded w-3/4" />
                <div className="h-3 bg-[var(--pp-bg-surface2)] rounded w-1/2" />
                <div className="h-20 bg-[var(--pp-bg-surface2)] rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] rounded-2xl">
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-[var(--pp-text-muted)]/40 mb-4" />
            <h3 className="text-base font-bold text-[var(--pp-text-primary)] mb-1">
              No templates found
            </h3>
            <p className="text-xs text-[var(--pp-text-muted)] mb-5">
              Create your custom cold pitch or initialize the starter template library
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedStarters}
                className="text-xs border-[var(--pp-border-subtle)] text-[var(--pp-text-secondary)] hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[var(--pp-accent3)]" />
                Add 5 Starters
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCreate(true)}
                className="text-xs bg-[var(--pp-accent1)] hover:bg-[var(--pp-accent1-dark)] text-white font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Custom
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] hover:border-[var(--pp-accent1)]/40 transition-all group rounded-2xl card-hover relative overflow-hidden flex flex-col justify-between h-full">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-sm font-bold text-[var(--pp-text-primary)] truncate"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {template.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-[var(--pp-bg-surface2)] text-[var(--pp-text-secondary)] border-0 capitalize"
                          >
                            {template.category.replace("_", " ")}
                          </Badge>
                          {template.is_ai_generated && (
                            <Badge className="text-[10px] bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] border border-[var(--pp-accent1)]/30">
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                          <span className="text-[11px] text-[var(--pp-text-muted)] flex items-center gap-1">
                            <BarChart2 className="h-3 w-3" />
                            Used {template.use_count}×
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenPreview(template)}
                          className="h-7 w-7 text-[var(--pp-text-muted)] hover:text-[var(--pp-accent1-light)] hover:bg-[var(--pp-accent1)]/10"
                          title="Live Preview with Test Prospect"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(template)}
                          className="h-7 w-7 text-[var(--pp-text-muted)] hover:text-white hover:bg-[var(--pp-bg-surface2)]"
                          title="Copy Raw Template"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template.id)}
                          className="h-7 w-7 text-[var(--pp-text-muted)] hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Subject Line Pill */}
                    <div className="bg-[var(--pp-bg-deepest)] rounded-xl p-3 border border-[var(--pp-border-subtle)] space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--pp-text-muted)]">
                        Subject
                      </p>
                      <p className="text-xs text-[var(--pp-text-primary)] font-medium line-clamp-1">
                        {template.subject}
                      </p>
                    </div>

                    {/* Body snippet */}
                    <p className="text-xs text-[var(--pp-text-secondary)] mt-3 line-clamp-3 leading-relaxed">
                      {template.body}
                    </p>
                  </div>

                  {/* Card Bottom: Live Preview Trigger */}
                  <div className="pt-4 mt-4 border-t border-[var(--pp-border-subtle)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--pp-text-muted)]">
                      {template.body.match(/\{\{([a-zA-Z0-9_]+)\}\}/g)?.length || 0} variables
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPreview(template)}
                      className="text-xs h-7 border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/40 text-[var(--pp-text-primary)] hover:border-[var(--pp-accent1)] cursor-pointer"
                    >
                      <Eye className="w-3 h-3 mr-1.5 text-[var(--pp-accent1-light)]" />
                      Test Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {templates.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--pp-text-muted)] pt-6 border-t border-[var(--pp-border-subtle)]">
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            {templates.length} saved templates
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart2 className="h-3.5 w-3.5" />
            {templates.reduce((sum, t) => sum + (t.use_count || 0), 0)} total sends
          </span>
        </div>
      )}

      {/* Live Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={previewTemplate}
      />
    </div>
  );
}
