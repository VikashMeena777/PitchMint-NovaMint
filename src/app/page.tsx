"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Shield,
  Clock,
  Star,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Typewriter } from "@/components/ui/typewriter";
import { AnimatedZap as AnimatedZapIcon } from "@/components/icons";

// Import Modular Marketing Components
import {
  MobileNav,
  PricingCalculator,
  SequenceDemoCard,
  BentoGrid,
  FaqAccordion,
  MarketingFooter,
} from "@/components/marketing";

// Dynamically import 3D WebGL Hero Scene with SSR disabled and Canvas 2D fallback
const HeroScene = dynamic(
  () => import("@/components/canvas/hero-scene").then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] rounded-3xl bg-[var(--pp-bg-surface)]/40 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--pp-accent1)] border-t-transparent animate-spin" />
      </div>
    ),
  }
);

/* Typewriter phrases for hero section */
const heroTypewriterWords = [
  "That Works 24/7",
  "That Never Sleeps",
  "That Books Meetings",
  "That Closes Deals",
  "That Scales Outreach",
];

/* Social proof statistics */
const socialStats = [
  { value: 500, suffix: "+", label: "Active Founders" },
  { value: 50, suffix: "K+", label: "Personalized Emails" },
  { value: 98, suffix: "%", label: "Primary Deliverability" },
  { value: 4.8, suffix: "★", label: "G2 User Rating" },
];

function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);

  return (
    <div className="min-h-screen bg-[var(--pp-bg-deepest)] text-[var(--pp-text-primary)] overflow-x-hidden font-sans selection:bg-[var(--pp-accent1)] selection:text-white">
      {/* ━━━ NAVIGATION ━━━ */}
      <motion.nav
        initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 border-b border-[var(--pp-border-subtle)]"
      >
        <div className="glass-strong">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-[var(--pp-text-secondary)] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-sm font-medium text-[var(--pp-text-secondary)] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Interactive Demo
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-[var(--pp-text-secondary)] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-sm font-medium text-[var(--pp-text-secondary)] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                FAQ
              </a>
              <Link
                href="/contact"
                className="text-sm font-medium text-[var(--pp-text-secondary)] hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Contact
              </Link>
            </div>

            {/* Actions & Mobile Drawer Toggle */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Button
                  asChild
                  className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo transition-all duration-200 text-sm hidden sm:inline-flex"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-[var(--pp-text-secondary)] hover:text-white cursor-pointer hidden sm:flex"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo transition-all duration-200 text-sm hidden sm:inline-flex"
                  >
                    <Link href="/signup">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </>
              )}

              {/* Accessible mobile drawer navigation toggle (<768px) */}
              <div className="md:hidden">
                <MobileNav isLoggedIn={isLoggedIn} />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ━━━ HERO SECTION WITH 3D WEBGL CANVAS ━━━ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden"
      >
        <AuroraBackground className="py-8 sm:py-12" intensity={0.65}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Fluid Satoshi Typography & Value Proposition */}
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* Live Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] mb-6 shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--pp-accent3)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--pp-accent3)]" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent3-light)] font-mono">
                    Autonomous Cold Outreach 2.0
                  </span>
                </motion.div>

                {/* Satoshi Fluid Clamp Typography H1 */}
                <motion.h1
                  initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-6 font-extrabold tracking-tight leading-[1.05]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.35rem, 5.2vw + 0.5rem, 4.4rem)",
                  }}
                >
                  <span className="block text-gradient-hero">Your AI Sales Rep</span>
                  <span className="block text-gradient-hero min-h-[1.2em]">
                    <Typewriter
                      words={heroTypewriterWords}
                      typingSpeed={65}
                      deletingSpeed={40}
                      pauseDuration={2400}
                      className="text-gradient-hero"
                    />
                  </span>
                </motion.h1>

                {/* General Sans Body Fluid Paragraph */}
                <motion.p
                  initial={{ opacity: 0, y: 16, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="text-[var(--pp-text-secondary)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-sans"
                  style={{ fontSize: "clamp(1rem, 1.2vw + 0.1rem, 1.15rem)" }}
                >
                  PitchMint researches your prospects across company web telemetry and LinkedIn, crafts authentic 1-to-1 cold emails, and dispatches automated sequences.{" "}
                  <span className="text-white font-medium">Book meetings on autopilot without sacrificing your sender reputation.</span>
                </motion.p>

                {/* AnimatedZap CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-[var(--pp-accent1)] via-[var(--pp-accent1-light)] to-[var(--pp-accent2)] text-white font-semibold text-base cursor-pointer btn-hover shadow-[0_0_35px_rgba(93,92,255,0.35)] hover:shadow-[0_0_50px_rgba(93,92,255,0.55)] transition-all duration-200"
                  >
                    <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                      <AnimatedZapIcon size={20} animated={true} className="mr-2 text-white" />
                      <span>{isLoggedIn ? "Go to Live Dashboard" : "Start Free — No Card Required"}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 px-7 bg-[var(--pp-bg-surface2)]/70 border-[var(--pp-border-default)] text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] hover:border-[var(--pp-border-strong)] cursor-pointer transition-all duration-200 text-base"
                  >
                    <a href="#demo">
                      <span>Explore Live Demo</span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </motion.div>

                {/* Trust Badge Metrics */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[var(--pp-text-muted)]"
                >
                  <div className="flex items-center gap-1.5 bg-[var(--pp-bg-surface)]/60 px-3 py-1.5 rounded-full border border-[var(--pp-border-subtle)]">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-[var(--pp-accent3)] text-[var(--pp-accent3)]" />
                      ))}
                    </div>
                    <span className="font-medium text-white ml-1">4.8/5</span>
                    <span>from outbound reps</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[var(--pp-bg-surface)]/60 px-3 py-1.5 rounded-full border border-[var(--pp-border-subtle)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--pp-accent1-light)]" />
                    <span>2-min onboarding</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[var(--pp-bg-surface)]/60 px-3 py-1.5 rounded-full border border-[var(--pp-border-subtle)]">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SOC 2 &amp; GDPR compliant</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: 3D Procedural WebGL Canvas (`HeroScene`) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 relative w-full h-[380px] sm:h-[450px] lg:h-[500px]"
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[var(--pp-border-default)] shadow-2xl bg-[var(--pp-bg-surface)]/50 backdrop-blur-sm">
                  {/* WebGL Scene */}
                  <HeroScene className="w-full h-full" enableScrollScrub={true} />

                  {/* Overlaid Floating HUD Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-[var(--pp-bg-deepest)]/85 backdrop-blur-md border border-[var(--pp-border-subtle)] flex items-center justify-between text-xs pointer-events-none">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--pp-accent3)] animate-pulse" />
                      <span className="font-mono text-white">AI Pipeline Node #04 Active</span>
                    </div>
                    <span className="font-mono text-[var(--pp-accent1-light)] text-[11px]">3D Interactive WebGL</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </AuroraBackground>
      </motion.section>

      {/* ━━━ SOCIAL PROOF STATS COUNTER BAR ━━━ */}
      <section className="relative py-12 border-y border-[var(--pp-border-subtle)] bg-[var(--pp-bg-surface)]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {socialStats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i * 0.1} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  {Number.isInteger(stat.value) ? (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} className="text-3xl sm:text-4xl font-extrabold text-white" />
                  ) : (
                    <span className="stat-number">{stat.value}{stat.suffix}</span>
                  )}
                </div>
                <p className="text-xs uppercase tracking-wider text-[var(--pp-text-muted)] font-semibold mt-1">
                  {stat.label}
                </p>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ BENTO GRID: FEATURE HIGHLIGHTS (CARDTILT 3D) ━━━ */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimateOnScroll className="text-center mb-16">
            <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent1-light)] inline-block mb-3">
              Capabilities Architecture
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Engineered for <span className="gradient-text">predictable pipeline</span>
            </h2>
            <p className="text-[var(--pp-text-secondary)] max-w-2xl mx-auto text-base sm:text-lg">
              From autonomous prospect dossier creation to sentiment-based reply sorting — PitchMint operates your entire cold outbound machine.
            </p>
          </AnimateOnScroll>

          {/* Bento Grid Component */}
          <BentoGrid />
        </div>
      </section>

      {/* ━━━ LIVE INTERACTIVE SEQUENCE DEMO CARD ━━━ */}
      <section id="demo" className="py-24 sm:py-32 relative bg-[var(--pp-bg-surface)]/40 border-t border-[var(--pp-border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimateOnScroll className="text-center mb-16">
            <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent4)]/10 border border-[var(--pp-accent4)]/20 text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent4-light)] inline-block mb-3">
              Step-by-Step Preview
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Watch the <span className="gradient-text">Autonomous Sequence</span> in action
            </h2>
            <p className="text-[var(--pp-text-secondary)] max-w-xl mx-auto text-base sm:text-lg">
              Interact with the live stage runner below to see how real context turns cold prospects into booked pipeline.
            </p>
          </AnimateOnScroll>

          {/* Interactive Sequence Demo */}
          <SequenceDemoCard />
        </div>
      </section>

      {/* ━━━ DYNAMIC PRICING CALCULATOR & TIERS ━━━ */}
      <section id="pricing" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimateOnScroll className="text-center mb-14">
            <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent3)]/10 border border-[var(--pp-accent3)]/20 text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent3-light)] inline-block mb-3">
              Predictable Investment
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Dynamic Pricing Calculator
            </h2>
            <p className="text-[var(--pp-text-secondary)] max-w-xl mx-auto text-base sm:text-lg">
              Free plan forever for testing. Scale up flexibly with monthly or annual savings as your outreach grows.
            </p>
          </AnimateOnScroll>

          {/* Dynamic Slider Pricing Calculator */}
          <PricingCalculator />
        </div>
      </section>

      {/* ━━━ FAQ ACCORDION ━━━ */}
      <section id="faq" className="py-24 sm:py-32 relative bg-[var(--pp-bg-surface)]/30 border-t border-[var(--pp-border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimateOnScroll className="text-center mb-14">
            <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent2)]/10 border border-[var(--pp-border-accent)] text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent2-light)] inline-block mb-3">
              Common Questions
            </span>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-[var(--pp-text-secondary)] max-w-lg mx-auto text-sm sm:text-base">
              Everything you need to know about AI research, deliverability hygiene, and campaign automation.
            </p>
          </AnimateOnScroll>

          {/* FAQ Accordion Component */}
          <FaqAccordion />
        </div>
      </section>

      {/* ━━━ CONVERSION CTA BANNER ━━━ */}
      <section className="relative py-24 overflow-hidden border-t border-[var(--pp-border-subtle)]">
        <AuroraBackground className="py-20" intensity={0.7} starCount={30}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to automate your <span className="gradient-text">cold outreach?</span>
            </h2>
            <p className="text-base sm:text-lg text-[var(--pp-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed font-sans">
              Join founders and revenue teams who use PitchMint to research leads, craft authentic emails, and scale meeting volume without spam.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent2)] text-white font-semibold text-base cursor-pointer btn-hover shadow-[0_0_35px_rgba(93,92,255,0.4)] hover:shadow-[0_0_50px_rgba(93,92,255,0.6)]"
              >
                <Link href="/signup">
                  <AnimatedZapIcon size={18} animated={true} className="mr-2 text-white" />
                  Get Started Free Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-[var(--pp-text-muted)] mt-4">
              Free plan includes 25 prospects/mo • No credit card required
            </p>
          </div>
        </AuroraBackground>
      </section>

      {/* ━━━ MARKETING FOOTER ━━━ */}
      <MarketingFooter />
    </div>
  );
}
