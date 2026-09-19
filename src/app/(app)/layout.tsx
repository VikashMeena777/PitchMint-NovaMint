"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-[var(--pp-bg-deepest)] text-[var(--pp-text-primary)] overflow-x-hidden overflow-y-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile navigation drawer (Sheet primitive for <1024px) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="p-0 border-r border-[var(--pp-border-subtle)] bg-[var(--pp-bg-deepest)] w-[280px] max-w-[85vw] flex flex-col z-50 overflow-hidden"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
          <AppSidebar
            onNavigate={() => setMobileMenuOpen(false)}
            isMobileDrawer
          />
        </SheetContent>
      </Sheet>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AppHeader onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
