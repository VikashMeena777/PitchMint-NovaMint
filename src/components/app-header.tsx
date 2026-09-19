"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Search,
  Menu,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Sparkles,
  UserPlus,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function formatBadge(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "email" | "prospect" | "sequence" | "system";
}

export function AppHeader({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Email Opened",
      description: "Sarah Connor opened 'Quick question on Q4 pipeline'",
      time: "5m ago",
      read: false,
      type: "email",
    },
    {
      id: "2",
      title: "New Reply Received",
      description: "David Miller replied: 'Let's connect next Tuesday'",
      time: "24m ago",
      read: false,
      type: "email",
    },
    {
      id: "3",
      title: "Sequence Active",
      description: "SaaS Founders Q4 sequence enrolled 15 prospects",
      time: "2h ago",
      read: false,
      type: "sequence",
    },
    {
      id: "4",
      title: "AI Enrichment Complete",
      description: "Enriched 12 new prospects with ICP insights",
      time: "5h ago",
      read: true,
      type: "prospect",
    },
  ]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Also try fetching recent live activities
    fetch("/api/activity?limit=5")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.activities && data.activities.length > 0) {
          const mapped: NotificationItem[] = data.activities.map(
            (a: { id: string; action: string; display: string; created_at: string }, i: number) => ({
              id: a.id || String(i),
              title: a.action.replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              description: a.display,
              time: "Just now",
              read: false,
              type: a.action.startsWith("email") ? "email" : a.action.startsWith("prospect") ? "prospect" : "system",
            })
          );
          setNotifications(mapped);
        }
      })
      .catch(() => {
        // Fallback to default notifications
      });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials = getInitials(displayName);

  // Breadcrumbs calculation
  const breadcrumbItems = useMemo(() => {
    if (!pathname) return [{ label: "Home", href: "/dashboard" }];
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const label =
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      return { label, href };
    });
  }, [pathname]);

  return (
    <header className="h-16 border-b border-[var(--pp-border-subtle)] bg-[var(--pp-bg-deepest)]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-3">
      {/* Left side: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer flex-shrink-0"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--pp-text-muted)]">
          <Link
            href="/dashboard"
            className="hover:text-[var(--pp-text-primary)] transition-colors cursor-pointer"
          >
            PitchMint
          </Link>
          {breadcrumbItems.map((item, index) => (
            <div key={item.href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[var(--pp-border-strong)]" />
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-[var(--pp-text-primary)] font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[var(--pp-text-primary)] transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Center: Search trigger (Cmd+K) */}
      <div className="flex-1 max-w-md mx-2">
        <div
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-command-palette"))}
          className="w-full cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              window.dispatchEvent(new CustomEvent("toggle-command-palette"));
            }
          }}
          aria-label="Search prospects, sequences, commands"
        >
          <div className="relative pointer-events-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)] group-hover:text-[var(--pp-accent1-light)] transition-colors duration-200" />
            <Input
              readOnly
              tabIndex={-1}
              placeholder="Search prospects, sequences, templates..."
              className="pl-10 pr-16 h-9 bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] group-hover:border-[var(--pp-border-accent)] text-xs sm:text-sm text-[var(--pp-text-primary)] placeholder:text-[var(--pp-text-muted)] transition-all duration-200 w-full cursor-pointer rounded-xl"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-[var(--pp-text-muted)] bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] rounded-md font-mono">
                <span>⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Notifications + User menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notifications Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] transition-colors duration-200 cursor-pointer rounded-xl p-2 hover:bg-[var(--pp-bg-surface2)] border-none bg-transparent outline-none flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-[var(--pp-accent1)] text-white shadow-[0_0_8px_rgba(95,93,240,0.6)]">
                {formatBadge(unreadCount)}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] shadow-2xl rounded-2xl p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--pp-text-primary)]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--pp-accent1)]/20 text-[var(--pp-accent1-light)] border border-[var(--pp-accent1)]/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-[var(--pp-accent1-light)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[var(--pp-border-subtle)]">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 mx-auto text-[var(--pp-text-muted)] mb-2 opacity-40" />
                  <p className="text-xs text-[var(--pp-text-muted)]">No notifications</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-3 flex items-start gap-3 hover:bg-[var(--pp-bg-surface2)] transition-colors cursor-pointer ${
                      !item.read ? "bg-[var(--pp-accent1)]/5" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.type === "email"
                          ? "bg-[var(--pp-accent3)]/15 text-[var(--pp-accent3-light)]"
                          : item.type === "sequence"
                          ? "bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)]"
                          : "bg-[var(--pp-accent2)]/15 text-[var(--pp-accent2-light)]"
                      }`}
                    >
                      {item.type === "email" ? (
                        <MailIcon className="w-3.5 h-3.5" />
                      ) : item.type === "sequence" ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-[var(--pp-text-primary)] truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-[var(--pp-text-muted)] flex-shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--pp-text-secondary)] mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    {!item.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--pp-accent1)] flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 text-center border-t border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface2)]/30">
              <Link
                href="/dashboard"
                className="text-[11px] text-[var(--pp-accent1-light)] hover:underline font-medium cursor-pointer"
              >
                View all activity
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center h-9 gap-2 px-2 cursor-pointer hover:bg-[var(--pp-bg-surface2)] transition-all duration-200 rounded-xl border border-transparent hover:border-[var(--pp-border-subtle)] bg-transparent outline-none"
            aria-label="User account menu"
          >
            <Avatar className="w-7 h-7 ring-1 ring-[var(--pp-border-subtle)]">
              <AvatarFallback className="bg-gradient-to-br from-[var(--pp-accent1)] to-[var(--pp-accent2)] text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-[var(--pp-text-primary)] hidden md:block max-w-[120px] truncate">
              {displayName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-[var(--pp-text-primary)] rounded-xl shadow-2xl p-1"
          >
            <DropdownMenuLabel className="text-[var(--pp-text-secondary)] p-2">
              <p className="text-xs font-semibold text-[var(--pp-text-primary)] truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[var(--pp-text-muted)] truncate mt-0.5">
                {user?.email || "Signed in"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--pp-border-subtle)]" />
            <DropdownMenuItem className="cursor-pointer hover:bg-[var(--pp-bg-surface2)] rounded-lg p-0 text-xs">
              <Link href="/settings" className="flex items-center gap-2.5 w-full px-2.5 py-2">
                <Settings className="w-3.5 h-3.5 text-[var(--pp-text-muted)]" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[var(--pp-bg-surface2)] rounded-lg p-0 text-xs">
              <Link href="/billing" className="flex items-center gap-2.5 w-full px-2.5 py-2">
                <CreditCard className="w-3.5 h-3.5 text-[var(--pp-text-muted)]" />
                <span>Billing & Plans</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[var(--pp-bg-surface2)] rounded-lg p-0 text-xs">
              <Link href="/templates" className="flex items-center gap-2.5 w-full px-2.5 py-2">
                <FileText className="w-3.5 h-3.5 text-[var(--pp-text-muted)]" />
                <span>Templates</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--pp-border-subtle)]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 rounded-lg px-2.5 py-2 text-xs flex items-center gap-2.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
