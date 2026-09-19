"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HelpCircle } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--pp-bg-deepest)] text-[var(--pp-text-primary)] font-sans relative overflow-x-hidden selection:bg-[var(--pp-accent1)] selection:text-white flex flex-col justify-between">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, var(--pp-accent1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, var(--pp-accent2) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 grid-pattern opacity-10" />
      </div>

      {/* Top Header: Logo + Support link */}
      <header className="border-b border-[var(--pp-border-subtle)] sticky top-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <Image
              src="/PitchMint Logo.jpg"
              alt="PitchMint"
              width={36}
              height={36}
              priority
              className="rounded-xl flex-shrink-0 shadow-md transition-transform duration-200 group-hover:scale-105"
            />
            <span
              className="text-lg font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PitchMint
            </span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-1.5 text-xs text-[var(--pp-text-secondary)] hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need assistance?</span>
          </Link>
        </div>
      </header>

      {/* Main Full-Screen Wizard Area */}
      <main className="flex-1 flex flex-col justify-center relative z-10">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-[var(--pp-border-subtle)] text-center text-xs text-[var(--pp-text-muted)] relative z-10">
        PitchMint Intelligent Cold Outreach • Setup wizard takes under 2 minutes
      </footer>
    </div>
  );
}
