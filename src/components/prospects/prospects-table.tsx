"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  Tag,
  CheckSquare,
  Square,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProspectDrawerData } from "./prospect-ai-drawer";

export function sanitizeSearch(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

export type SortField = "name" | "company" | "status" | "emails" | "opens" | "created";
export type SortOrder = "asc" | "desc";

export interface ProspectsTableProps {
  prospects: ProspectDrawerData[];
  totalCount: number;
  pageSize: number;
  page: number;
  onPageChange: (newPage: number) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onInspectProspect: (prospect: ProspectDrawerData) => void;
  onComposeAi?: (prospect: ProspectDrawerData) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  tagFilter: string;
  onTagFilterChange: (tag: string) => void;
  availableTags?: string[];
  isLoading?: boolean;
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "var(--pp-accent1)" },
  contacted: { label: "Contacted", color: "var(--pp-accent4)" },
  opened: { label: "Opened", color: "var(--pp-accent3)" },
  replied: { label: "Replied", color: "var(--pp-accent2)" },
  interested: { label: "Interested", color: "#22c55e" },
  not_interested: { label: "Not Interested", color: "#ef4444" },
  meeting_booked: { label: "Meeting Booked", color: "#f59e0b" },
  unsubscribed: { label: "Unsubscribed", color: "#6b7280" },
};

export function ProspectsTable({
  prospects,
  totalCount,
  pageSize,
  page,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onInspectProspect,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  tagFilter,
  onTagFilterChange,
  availableTags = ["High Priority", "Enterprise", "Outbound Q4", "Inbound", "SaaS"],
  isLoading = false,
}: ProspectsTableProps) {
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedProspects = useMemo(() => {
    const list = [...prospects];
    list.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortField) {
        case "name":
          valA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
          valB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
          break;
        case "company":
          valA = (a.company_name || "").toLowerCase();
          valB = (b.company_name || "").toLowerCase();
          break;
        case "status":
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
          break;
        case "emails":
          valA = a.total_emails_sent || 0;
          valB = b.total_emails_sent || 0;
          break;
        case "opens":
          valA = a.total_opens || 0;
          valB = b.total_opens || 0;
          break;
        case "created":
        default:
          valA = new Date(a.created_at || 0).getTime();
          valB = new Date(b.created_at || 0).getTime();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [prospects, sortField, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const allSelected = selectedIds.size === prospects.length && prospects.length > 0;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[var(--pp-text-muted)] opacity-60 ml-1 inline" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[var(--pp-accent1-light)] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[var(--pp-accent1-light)] ml-1 inline" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
          <Input
            placeholder="Search leads by name, email, or company..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9 h-9 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-xs sm:text-sm text-[var(--pp-text-primary)] placeholder:text-[var(--pp-text-muted)] rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-[var(--pp-text-muted)]" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-xs text-[var(--pp-text-primary)] outline-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--pp-bg-surface2)] text-white">All Statuses</option>
              {Object.entries(STATUS_BADGES).map(([k, v]) => (
                <option key={k} value={k} className="bg-[var(--pp-bg-surface2)] text-white">
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] rounded-xl px-2.5 py-1">
            <Tag className="w-3.5 h-3.5 text-[var(--pp-text-muted)]" />
            <select
              value={tagFilter}
              onChange={(e) => onTagFilterChange(e.target.value)}
              className="bg-transparent text-xs text-[var(--pp-text-primary)] outline-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--pp-bg-surface2)] text-white">All Tags</option>
              {availableTags.map((t) => (
                <option key={t} value={t} className="bg-[var(--pp-bg-surface2)] text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface)] overflow-hidden shadow-xl">
        {/* Desktop & Tablet Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/40 text-[11px] font-semibold text-[var(--pp-text-muted)] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <button
                    onClick={onSelectAll}
                    className="cursor-pointer text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]"
                    title={allSelected ? "Deselect all" : "Select all"}
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--pp-text-primary)] transition-colors select-none"
                >
                  Prospect {renderSortIcon("name")}
                </th>
                <th
                  onClick={() => handleSort("company")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--pp-text-primary)] transition-colors select-none"
                >
                  Company & Role {renderSortIcon("company")}
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-4 cursor-pointer hover:text-[var(--pp-text-primary)] transition-colors select-none"
                >
                  Status {renderSortIcon("status")}
                </th>
                <th
                  onClick={() => handleSort("emails")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-[var(--pp-text-primary)] transition-colors select-none"
                >
                  Sent {renderSortIcon("emails")}
                </th>
                <th
                  onClick={() => handleSort("opens")}
                  className="py-3 px-4 text-center cursor-pointer hover:text-[var(--pp-text-primary)] transition-colors select-none"
                >
                  Opens {renderSortIcon("opens")}
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pp-border-subtle)] text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-4 h-4 bg-[var(--pp-bg-surface2)] rounded" /></td>
                    <td className="p-4"><div className="w-32 h-4 bg-[var(--pp-bg-surface2)] rounded" /></td>
                    <td className="p-4"><div className="w-24 h-4 bg-[var(--pp-bg-surface2)] rounded" /></td>
                    <td className="p-4"><div className="w-16 h-4 bg-[var(--pp-bg-surface2)] rounded-full" /></td>
                    <td className="p-4"><div className="w-8 h-4 bg-[var(--pp-bg-surface2)] rounded mx-auto" /></td>
                    <td className="p-4"><div className="w-8 h-4 bg-[var(--pp-bg-surface2)] rounded mx-auto" /></td>
                    <td className="p-4"><div className="w-20 h-4 bg-[var(--pp-bg-surface2)] rounded ml-auto" /></td>
                  </tr>
                ))
              ) : sortedProspects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[var(--pp-text-muted)]">
                    <Users className="w-8 h-8 mx-auto text-[var(--pp-text-muted)] mb-2 opacity-40" />
                    <p className="text-sm font-medium text-[var(--pp-text-primary)]">No leads found</p>
                    <p className="text-xs mt-1">Try tweaking your search term or active filters.</p>
                  </td>
                </tr>
              ) : (
                sortedProspects.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  const badge = STATUS_BADGES[p.status] || STATUS_BADGES.new;
                  const fullName =
                    [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                    p.email.split("@")[0];

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[var(--pp-bg-surface2)]/50 transition-colors ${
                        isSelected ? "bg-[var(--pp-accent1)]/8" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleSelect(p.id)}
                          className="cursor-pointer text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Prospect name + email */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <button
                            onClick={() => onInspectProspect(p)}
                            className="text-left font-medium text-[var(--pp-text-primary)] hover:text-[var(--pp-accent1-light)] hover:underline cursor-pointer transition-colors block truncate"
                          >
                            {fullName}
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--pp-text-muted)] mt-0.5">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{p.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Company & Role */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--pp-text-secondary)] truncate">
                            {p.company_name || "—"}
                          </p>
                          <p className="text-[11px] text-[var(--pp-text-muted)] truncate">
                            {p.job_title || "Lead"}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider"
                          style={{
                            color: badge.color,
                            backgroundColor: `${badge.color}14`,
                            borderColor: `${badge.color}28`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Sent */}
                      <td className="py-3 px-4 text-center font-mono text-[var(--pp-text-secondary)]">
                        {p.total_emails_sent || 0}
                      </td>

                      {/* Opens */}
                      <td className="py-3 px-4 text-center font-mono text-[var(--pp-text-secondary)]">
                        {p.total_opens || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Slide-out AI Drawer button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onInspectProspect(p)}
                            className="h-7 px-2 text-xs text-[var(--pp-accent1-light)] hover:bg-[var(--pp-accent1)]/15 cursor-pointer rounded-lg font-medium"
                            title="Slide-out AI preview"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Enrich
                          </Button>

                          {/* Detail page link */}
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer rounded-lg"
                            title="View prospect page"
                          >
                            <Link href={`/prospects/${p.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Fallback (<640px) */}
        <div className="sm:hidden divide-y divide-[var(--pp-border-subtle)]">
          {sortedProspects.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--pp-text-muted)]">
              No prospects found
            </div>
          ) : (
            sortedProspects.map((p) => {
              const isSelected = selectedIds.has(p.id);
              const badge = STATUS_BADGES[p.status] || STATUS_BADGES.new;
              const fullName =
                [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                p.email.split("@")[0];

              return (
                <div
                  key={p.id}
                  className={`p-4 space-y-3 ${
                    isSelected ? "bg-[var(--pp-accent1)]/8" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => onToggleSelect(p.id)}
                        className="cursor-pointer text-[var(--pp-text-muted)] mt-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <button
                          onClick={() => onInspectProspect(p)}
                          className="text-sm font-semibold text-[var(--pp-text-primary)] hover:underline truncate block"
                        >
                          {fullName}
                        </button>
                        <p className="text-xs text-[var(--pp-text-muted)] truncate">
                          {p.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider flex-shrink-0"
                      style={{
                        color: badge.color,
                        backgroundColor: `${badge.color}14`,
                        borderColor: `${badge.color}28`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--pp-text-secondary)] pt-1 border-t border-[var(--pp-border-subtle)]">
                    <span className="truncate">{p.company_name || "No company"}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onInspectProspect(p)}
                        className="h-7 text-xs border-[var(--pp-border-default)] cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 mr-1 text-[var(--pp-accent1-light)]" />
                        AI Preview
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs cursor-pointer"
                      >
                        <Link href={`/prospects/${p.id}`}>
                          <Eye className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/20">
            <p className="text-xs text-[var(--pp-text-muted)]">
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} of{" "}
              {totalCount}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="h-8 px-2 text-xs text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] cursor-pointer disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-[var(--pp-text-secondary)] px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="h-8 px-2 text-xs text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] cursor-pointer disabled:opacity-30"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
