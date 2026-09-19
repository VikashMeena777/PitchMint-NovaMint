"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AddProspectModal } from "@/components/add-prospect-modal";
import { CsvImportModal } from "@/components/csv-import-modal";
import { BulkActionsToolbar } from "@/components/bulk-actions-toolbar";
import { AIComposeModal } from "@/components/ai-compose-modal";
import { getProspects } from "@/lib/actions/prospects";
import { createClient } from "@/lib/supabase/client";
import {
  ProspectsTable,
  sanitizeSearch,
} from "@/components/prospects/prospects-table";
import {
  ProspectAiDrawer,
  type ProspectDrawerData,
} from "@/components/prospects/prospect-ai-drawer";
import { UserPlus, Upload } from "lucide-react";

const PAGE_SIZE = 20;

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<ProspectDrawerData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [page, setPage] = useState(0);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inspectTarget, setInspectTarget] = useState<ProspectDrawerData | null>(null);
  const [composeTarget, setComposeTarget] = useState<ProspectDrawerData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const [supabaseReady] = useState(() => !!createClient());
  const [isLoading, setIsLoading] = useState(() => !!createClient());

  const loadProspects = useCallback(async () => {
    if (!supabaseReady) return;
    setIsLoading(true);
    const sanitized = search ? sanitizeSearch(search.trim()) : undefined;
    const result = await getProspects({
      search: sanitized,
      status: statusFilter !== "all" ? statusFilter : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    let dataList = (result.data || []) as ProspectDrawerData[];
    if (tagFilter !== "all") {
      dataList = dataList.filter((p) => p.tags && p.tags.includes(tagFilter));
    }
    setProspects(dataList);
    setTotalCount(result.count || 0);
    setIsLoading(false);
  }, [search, statusFilter, tagFilter, page, supabaseReady]);

  useEffect(() => {
    if (!supabaseReady) return;
    let ignore = false;
    void (async () => {
      await Promise.resolve();
      if (!ignore) {
        await loadProspects();
      }
    })();
    return () => {
      ignore = true;
    };
  }, [loadProspects, supabaseReady]);

  const handleSelectAll = () => {
    if (selectedIds.size === prospects.length && prospects.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(prospects.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-7xl"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--pp-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Prospects
          </h1>
          <p className="text-xs sm:text-sm text-[var(--pp-text-secondary)] mt-1">
            Manage leads, inspect AI enrichment, and orchestrate cold outreach campaigns
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setShowCsvModal(true)}
            variant="outline"
            className="bg-transparent border-[var(--pp-border-default)] text-[var(--pp-text-secondary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-xs rounded-xl"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import CSV
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo text-xs rounded-xl"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Prospect
          </Button>
        </div>
      </div>

      {/* Main Prospects Table View */}
      <ProspectsTable
        prospects={prospects}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={handleSelectAll}
        onInspectProspect={(p) => setInspectTarget(p)}
        onComposeAi={(p) => setComposeTarget(p)}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(0);
        }}
        searchQuery={search}
        onSearchQueryChange={(q) => {
          setSearch(q);
          setPage(0);
        }}
        tagFilter={tagFilter}
        onTagFilterChange={(t) => {
          setTagFilter(t);
          setPage(0);
        }}
        isLoading={isLoading}
      />

      {/* Floating Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedIds={Array.from(selectedIds)}
        onClearSelection={() => setSelectedIds(new Set())}
        onRefresh={loadProspects}
      />

      {/* Slide-out AI Enrichment Drawer (Sheet) */}
      <ProspectAiDrawer
        isOpen={!!inspectTarget}
        onClose={() => setInspectTarget(null)}
        prospect={inspectTarget}
        onOpenCompose={(p) => setComposeTarget(p)}
      />

      {/* Modals */}
      <AddProspectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadProspects}
      />
      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onSuccess={loadProspects}
      />
      {composeTarget && (
        <AIComposeModal
          isOpen={!!composeTarget}
          onClose={() => setComposeTarget(null)}
          prospect={composeTarget}
        />
      )}
    </motion.div>
  );
}
