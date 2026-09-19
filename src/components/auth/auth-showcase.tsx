"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Shield,
  Star,
  Lock,
} from "lucide-react";
import { AnimatedSparkles } from "@/components/icons";

interface AuthShowcaseProps {
  heading?: string;
  subheading?: string;
}

export function AuthShowcase({
  heading = "Autonomous Cold Outreach for Revenue Teams",
  subheading = "Turn cold prospects into booked pipeline with deep multi-source AI research and hyper-personalized follow-up sequences.",
}: AuthShowcaseProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between relative bg-[var(--pp-bg-surface)] p-12 overflow-hidden border-r border-[var(--pp-border-subtle)] min-h-screen">
      {/* Background Orbs & Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, var(--pp-accent1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, var(--pp-accent2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Top Header: Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 cursor-pointer group">
          <Image
            src="/PitchMint Logo.jpg"
            alt="PitchMint"
            width={40}
            height={40}
            priority
            className="rounded-xl shadow-lg transition-transform duration-200 group-hover:scale-105"
          />
          <span
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            PitchMint
          </span>
        </Link>
      </div>

      {/* Center Showcase: Animated Metric & Live Mockup */}
      <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--pp-accent1)]/15 border border-[var(--pp-border-accent)] text-xs font-semibold text-[var(--pp-accent1-light)]">
          <AnimatedSparkles size={14} className="text-[var(--pp-accent3)]" />
          <span>Used by 500+ Outbound Teams</span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2
            className="text-3xl xl:text-4xl font-extrabold text-white leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {heading}
          </h2>
          <p className="text-sm text-[var(--pp-text-secondary)] leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Live Sequence Activity Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-strong rounded-2xl p-5 border border-[var(--pp-border-default)] shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--pp-border-subtle)] text-xs font-mono">
            <span className="text-[var(--pp-text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE SEQUENCE RUNNER
            </span>
            <span className="text-emerald-400 font-semibold">Stage 03 • Meeting Booked</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--pp-accent1)] to-[var(--pp-accent3)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-md">
              SC
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Sarah Chen</span>
                <span className="text-[11px] text-[var(--pp-text-muted)] font-normal truncate">
                  VP Revenue, ScaleMetrics
                </span>
              </div>
              <p className="text-[11px] text-[var(--pp-accent3)] font-mono truncate mt-0.5">
                Positive reply detected: &quot;Let&apos;s talk Thursday&quot;
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-center">
              <span className="text-[10px] text-[var(--pp-text-muted)] block uppercase font-mono">Open Rate</span>
              <span className="text-sm font-bold text-white font-mono">68.4%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-center">
              <span className="text-[10px] text-[var(--pp-text-muted)] block uppercase font-mono">Replies</span>
              <span className="text-sm font-bold text-[var(--pp-accent3)] font-mono">14.2%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)] text-center">
              <span className="text-[10px] text-[var(--pp-text-muted)] block uppercase font-mono">Deliverability</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">99.2%</span>
            </div>
          </div>
        </motion.div>

        {/* Customer Testimonial Quote */}
        <div className="p-4 rounded-2xl bg-[var(--pp-bg-surface2)]/60 border border-[var(--pp-border-subtle)] space-y-2">
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
          <p className="text-xs text-[var(--pp-text-secondary)] italic leading-relaxed">
            &ldquo;PitchMint eliminated 12+ hours of manual prospect research every week for each rep. Our booked meeting velocity tripled within the first month.&rdquo;
          </p>
          <div className="text-[11px] text-[var(--pp-text-muted)] pt-1">
            <span className="text-white font-semibold">David K.</span> — VP of Growth, Fintech Venture
          </div>
        </div>
      </div>

      {/* Bottom Footer Badges */}
      <div className="relative z-10 pt-6 border-t border-[var(--pp-border-subtle)] flex items-center justify-between text-xs text-[var(--pp-text-muted)]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>SOC 2 Type II Certified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[var(--pp-accent3)]" />
          <span>AES-256-GCM Token Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default AuthShowcase;
