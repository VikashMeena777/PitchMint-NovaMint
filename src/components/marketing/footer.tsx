"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--pp-border-subtle)] bg-[var(--pp-bg-deepest)] text-[var(--pp-text-secondary)] relative overflow-hidden">
      {/* Subtle top glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--pp-accent1)]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--pp-border-subtle)]">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
              <Image
                src="/PitchMint Logo.jpg"
                alt="PitchMint"
                width={36}
                height={36}
                className="rounded-xl flex-shrink-0 shadow-md transition-transform duration-200 group-hover:scale-105"
              />
              <span
                className="text-xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                PitchMint
              </span>
            </Link>

            <p className="text-sm text-[var(--pp-text-secondary)] max-w-sm leading-relaxed">
              Autonomous AI sales outreach platform. Research prospects, generate hyper-personalized multi-touch emails, and book pipeline on autopilot.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono text-emerald-400">All Systems Operational</span>
            </div>
          </div>

          {/* Col 3: Product Links */}
          <div className="space-y-3">
            <h4
              className="text-xs uppercase font-mono font-bold tracking-wider text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors cursor-pointer">
                  AI Research
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white transition-colors cursor-pointer">
                  Sequence Engine
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">
                  Pricing Calculator
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">
                  Live Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-3">
            <h4
              className="text-xs uppercase font-mono font-bold tracking-wider text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#faq" className="hover:text-white transition-colors cursor-pointer">
                  Outreach FAQ
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors cursor-pointer">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors cursor-pointer">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors cursor-pointer">
                  Get Started Free
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Security */}
          <div className="space-y-3">
            <h4
              className="text-xs uppercase font-mono font-bold tracking-wider text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-xs text-[var(--pp-text-muted)] flex items-center gap-1.5 pt-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  GDPR &amp; CAN-SPAM Ready
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--pp-text-muted)]">
          <p>© {new Date().getFullYear()} PitchMint. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors cursor-pointer">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
