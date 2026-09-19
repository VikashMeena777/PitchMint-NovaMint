"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";
import {
  AnimatedZap,
  AnimatedMail,
  AnimatedChart,
  AnimatedSparkles,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavBadgeCounters {
  prospects?: number;
  sequences?: number;
  emails?: number;
}

export function getSidebarWidth(collapsed: boolean): number {
  return collapsed ? 64 : 256;
}

interface AppSidebarProps {
  onNavigate?: () => void;
  isMobileDrawer?: boolean;
}

export function AppSidebar({ onNavigate, isMobileDrawer = false }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  const [counters, setCounters] = useState<NavBadgeCounters>({
    prospects: 0,
    sequences: 0,
    emails: 0,
  });

  useEffect(() => {
    // Fetch quick live counts from Supabase or dashboard stats
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Prospects count
      supabase
        .from("prospects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => {
          if (count != null) {
            setCounters((prev) => ({ ...prev, prospects: count }));
          }
        });

      // Sequences count
      supabase
        .from("sequences")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active")
        .then(({ count }) => {
          if (count != null) {
            setCounters((prev) => ({ ...prev, sequences: count }));
          }
        });
    });
  }, []);

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    try {
      localStorage.setItem("sidebar-collapsed", String(nextState));
    } catch {
      // Storage unavailable
    }
  };

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (onNavigate) onNavigate();
    router.push("/login");
    router.refresh();
  }

  const effectiveCollapsed = isMobileDrawer ? false : collapsed;
  const currentWidth = isMobileDrawer ? 280 : getSidebarWidth(collapsed);

  const mainNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      renderIcon: (active: boolean) => (
        <LayoutDashboard className={`w-4 h-4 ${active ? "text-[var(--pp-accent1-light)]" : ""}`} />
      ),
    },
    {
      label: "Prospects",
      href: "/prospects",
      badge: counters.prospects && counters.prospects > 0 ? counters.prospects : undefined,
      renderIcon: (active: boolean) => (
        <Users className={`w-4 h-4 ${active ? "text-[var(--pp-accent1-light)]" : ""}`} />
      ),
    },
    {
      label: "Sequences",
      href: "/sequences",
      badge: counters.sequences && counters.sequences > 0 ? counters.sequences : undefined,
      renderIcon: (active: boolean) => (
        <AnimatedZap className="w-4 h-4" animated={active} />
      ),
    },
    {
      label: "Emails",
      href: "/emails",
      renderIcon: (active: boolean) => (
        <AnimatedMail className="w-4 h-4" animated={active} />
      ),
    },
    {
      label: "Templates",
      href: "/templates",
      renderIcon: (active: boolean) => (
        <FileText className={`w-4 h-4 ${active ? "text-[var(--pp-accent1-light)]" : ""}`} />
      ),
    },
    {
      label: "Analytics",
      href: "/analytics",
      renderIcon: (active: boolean) => (
        <AnimatedChart className="w-4 h-4" animated={active} />
      ),
    },
  ];

  const bottomNavItems = [
    {
      label: "Billing",
      href: "/billing",
      icon: CreditCard,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: currentWidth }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`h-[100dvh] sticky top-0 flex flex-col border-r border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface)]/90 backdrop-blur-2xl z-40 select-none ${
        isMobileDrawer ? "w-full max-w-[280px]" : ""
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 border-b border-[var(--pp-border-subtle)] px-4 flex-shrink-0">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 cursor-pointer group w-full"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Image
              src="/PitchMint Logo.jpg"
              alt="PitchMint"
              width={32}
              height={32}
              className="rounded-xl shadow-[0_0_12px_rgba(95,93,240,0.3)] border border-[var(--pp-border-default)] transition-all"
            />
          </motion.div>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 min-w-0"
              >
                <span
                  className="text-base font-bold tracking-tight text-[var(--pp-text-primary)] whitespace-nowrap"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  PitchMint
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] border border-[var(--pp-accent1)]/30 font-mono">
                  PRO
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* AI Personalization Indicator */}
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <AnimatePresence>
          {!effectiveCollapsed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative overflow-hidden rounded-xl p-2.5 bg-gradient-to-r from-[var(--pp-accent1)]/10 via-[var(--pp-accent2)]/10 to-transparent border border-[var(--pp-border-accent)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <AnimatedSparkles className="w-4 h-4 text-[var(--pp-accent1-light)] flex-shrink-0" animated />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--pp-accent1-light)] truncate">
                      AI Engine Ready
                    </p>
                    <p className="text-[9px] text-[var(--pp-text-muted)] truncate">
                      Personalization online
                    </p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 ml-1" />
              </div>
            </motion.div>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center bg-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] cursor-pointer">
                  <AnimatedSparkles className="w-4 h-4 text-[var(--pp-accent1-light)]" animated />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                AI Engine Online
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          if (effectiveCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`
                      relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl
                      transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? "bg-[var(--pp-accent1)]/20 text-white shadow-[0_0_12px_rgba(95,93,240,0.2)] border border-[var(--pp-accent1)]/30"
                          : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)]"
                      }
                    `}
                  >
                    {item.renderIcon(isActive)}
                    {item.badge != null && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--pp-accent1)]" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  {item.label} {item.badge != null ? `(${item.badge})` : ""}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                group relative flex items-center justify-between px-3 py-2.5 rounded-xl
                transition-all duration-200 cursor-pointer text-xs font-medium
                ${
                  isActive
                    ? "bg-[var(--pp-accent1)]/15 text-[var(--pp-text-primary)] border border-[var(--pp-accent1)]/25 shadow-[0_0_15px_rgba(95,93,240,0.08)]"
                    : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)]/60"
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0">{item.renderIcon(isActive)}</span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge != null && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--pp-bg-surface2)] text-[var(--pp-text-secondary)] border border-[var(--pp-border-subtle)] group-hover:border-[var(--pp-border-accent)] transition-colors">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--pp-accent1)] shadow-[0_0_8px_rgba(95,93,240,0.8)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section (Billing, Settings, Logout, Collapse toggle) */}
      <div className="px-3 pb-3 pt-2 space-y-1 border-t border-[var(--pp-border-subtle)] flex-shrink-0 bg-[var(--pp-bg-surface)]/50">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (effectiveCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`
                      flex items-center justify-center w-10 h-10 mx-auto rounded-xl
                      transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? "bg-[var(--pp-accent1)]/20 text-white border border-[var(--pp-accent1)]/30"
                          : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)]"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-xl
                transition-all duration-200 cursor-pointer text-xs font-medium
                ${
                  isActive
                    ? "bg-[var(--pp-accent1)]/15 text-[var(--pp-text-primary)] border border-[var(--pp-accent1)]/25"
                    : "text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)]/60"
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Sign Out */}
        {effectiveCollapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-10 h-10 mx-auto text-[var(--pp-text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-xl"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              Sign out
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-xs text-[var(--pp-text-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer rounded-xl font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign out</span>
          </Button>
        )}

        {/* Collapse toggle (hidden on mobile drawer) */}
        {!isMobileDrawer && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={`
              ${collapsed ? "w-10 h-10 mx-auto" : "w-full h-8"}
              text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)]
              hover:bg-[var(--pp-bg-surface2)] transition-all duration-200 cursor-pointer rounded-xl mt-1
            `}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center justify-between w-full px-1 text-xs">
                <span>Collapse view</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            )}
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
