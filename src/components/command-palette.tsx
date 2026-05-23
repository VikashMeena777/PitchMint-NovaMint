"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Zap,
  Send,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleToggle = () => setOpen((open) => !open);

    document.addEventListener("keydown", down);
    window.addEventListener("toggle-command-palette", handleToggle);

    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("toggle-command-palette", handleToggle);
    };
  }, []);

  const runCommand = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="bg-[var(--pp-bg-surface)] text-[var(--pp-text-primary)] border-t border-[var(--pp-border-subtle)] p-2">
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-[var(--pp-accent1-light)]" />
            <span>Dashboard</span>
          </CommandItem>
          
          <CommandItem
            onSelect={() => runCommand(() => router.push("/prospects"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <Users className="mr-2 h-4 w-4 text-[var(--pp-accent4-light)]" />
            <span>Prospects</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => router.push("/sequences"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <Zap className="mr-2 h-4 w-4 text-[var(--pp-accent2-light)]" />
            <span>Sequences</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => router.push("/emails"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <Send className="mr-2 h-4 w-4 text-[var(--pp-accent3-light)]" />
            <span>Emails</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => router.push("/templates"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <FileText className="mr-2 h-4 w-4 text-emerald-400" />
            <span>Templates</span>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => router.push("/analytics"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <BarChart3 className="mr-2 h-4 w-4 text-indigo-400" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="bg-[var(--pp-border-subtle)] my-1" />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <Settings className="mr-2 h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </CommandItem>
          
          <CommandItem
            onSelect={() => runCommand(() => router.push("/billing"))}
            className="hover:bg-[var(--pp-bg-surface2)] cursor-pointer text-sm font-medium transition-colors"
          >
            <CreditCard className="mr-2 h-4 w-4 text-rose-400" />
            <span>Billing</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
