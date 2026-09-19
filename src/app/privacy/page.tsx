"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";

interface Section {
  id: string;
  title: string;
}

const PRIVACY_SECTIONS: Section[] = [
  { id: "info-collected", title: "1. Information We Collect" },
  { id: "info-usage", title: "2. How We Use Your Information" },
  { id: "google-data", title: "3. Google API Data & Gmail Disclosures" },
  { id: "gdpr-rights", title: "4. GDPR & Global Data Protection Rights" },
  { id: "security-encryption", title: "5. Security & AES-256-GCM Encryption" },
  { id: "subprocessors", title: "6. Authorized Sub-processors" },
  { id: "retention-deletion", title: "7. Data Retention & Account Purge" },
  { id: "tracking-pixels", title: "8. Tracking Pixels & Engagement Telemetry" },
  { id: "contact-controller", title: "9. Data Controller & DPO Contact" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>("info-collected");
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of PRIVACY_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offsetTop = el.offsetTop - 90;
      scrollTo(offsetTop, { duration: 0.8 });
      setActiveSection(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pp-bg-deepest)] text-[var(--pp-text-primary)] font-sans selection:bg-[var(--pp-accent1)] selection:text-white flex flex-col justify-between">
      {/* ━━━ TOP NAV ━━━ */}
      <nav className="border-b border-[var(--pp-border-subtle)] sticky top-0 z-50 glass-strong">
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

          <Button
            variant="ghost"
            asChild
            className="text-[var(--pp-text-secondary)] hover:text-white cursor-pointer"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      {/* ━━━ MAIN CONTENT ━━━ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 w-full">
        {/* Header Heading */}
        <div className="mb-14 pb-8 border-b border-[var(--pp-border-subtle)]">
          <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent3)]/10 border border-[var(--pp-accent3)]/30 text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent3-light)] inline-block mb-3 font-mono">
            Privacy &amp; Data Security
          </span>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--pp-text-muted)] font-mono">
            Last Updated: May 15, 2026 • CASA Tier-2 Certified Architecture
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Sticky Table of Contents (4 cols) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="glass-strong rounded-3xl p-6 border border-[var(--pp-border-default)] shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--pp-text-muted)] pb-3 mb-4 border-b border-[var(--pp-border-subtle)]">
                <Lock className="w-4 h-4 text-[var(--pp-accent3)]" />
                <span>Privacy Navigation</span>
              </div>

              <nav className="space-y-1" aria-label="Privacy Table of contents">
                {PRIVACY_SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => handleTocClick(e, sec.id)}
                      className={`block px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "bg-[var(--pp-accent1)]/15 text-[var(--pp-accent1-light)] font-semibold border border-[var(--pp-border-accent)]"
                          : "text-[var(--pp-text-secondary)] hover:text-white hover:bg-[var(--pp-bg-surface2)]"
                      }`}
                    >
                      {sec.title}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-6 pt-5 border-t border-[var(--pp-border-subtle)] text-xs text-[var(--pp-text-muted)] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Google Limited Use Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>End-to-End OAuth Token Encryption</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Privacy Text Content (8 cols) */}
          <article className="lg:col-span-8 space-y-12 text-sm text-[var(--pp-text-secondary)] leading-relaxed">
            {/* Section 1 */}
            <section id="info-collected" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                1. Information We Collect
              </h2>
              <p>
                When you create an account or interact with PitchMint, we collect specific categories of business information necessary to render our services:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white">Account Information:</strong> Name, work email address, company name, and workspace credentials provided during registration and onboarding.
                </li>
                <li>
                  <strong className="text-white">Prospect Business Data:</strong> Professional names, corporate email addresses, job titles, LinkedIn profile URLs, and company domain telemetry uploaded via CSV import or API.
                </li>
                <li>
                  <strong className="text-white">Outreach Content:</strong> Cold email templates, dynamic sequence variables, AI research prompt settings, and dispatch logs.
                </li>
                <li>
                  <strong className="text-white">Payment &amp; Billing Data:</strong> Order identifiers and transaction records processed securely through Cashfree Payments. Full credit card and banking credentials are never received or stored on PitchMint servers.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="info-usage" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                2. How We Use Your Information
              </h2>
              <p>We process your data strictly to execute the core operations of PitchMint:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Operating automated outreach sequences and scheduling follow-up delays.</li>
                <li>Synthesizing personalized email drafts based on prospect business telemetry.</li>
                <li>Tracking campaign deliverability metrics (inbox delivery, bounces, opens, replies).</li>
                <li>Enforcing account subscription quotas and anti-abuse safeguards.</li>
                <li>Providing technical customer support and critical platform status alerts.</li>
              </ul>
              <p className="pt-1">
                We <strong className="text-white">never</strong> sell your prospect lists, monetize contact directories, or share proprietary customer data with advertisers.
              </p>
            </section>

            {/* Section 3: Google API Data & Gmail Disclosures */}
            <section id="google-data" className="scroll-mt-28 space-y-4">
              <h2
                className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                3. Google User Data &amp; Gmail Integration
              </h2>
              <div className="rounded-2xl p-5 bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-accent)] text-xs space-y-3">
                <div className="flex items-center gap-2 text-[var(--pp-accent3)] font-semibold uppercase font-mono">
                  <Shield className="w-4 h-4" />
                  <span>Google API Services User Data Policy Disclosure</span>
                </div>
                <p className="text-[var(--pp-text-primary)] leading-relaxed">
                  PitchMint&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--pp-accent3-light)] underline hover:text-white"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>

              <h3 className="text-base font-semibold text-white pt-2">3.1 Requested Google Scopes</h3>
              <p>When connecting Gmail via OAuth 2.0, PitchMint requests access strictly to:</p>
              <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
                <li>
                  <code className="text-[var(--pp-accent1-light)]">https://www.googleapis.com/auth/gmail.send</code>: Enables the platform to dispatch scheduled outreach emails from your personal or Google Workspace address upon your explicit instruction.
                </li>
                <li>
                  <code className="text-[var(--pp-accent1-light)]">https://www.googleapis.com/auth/userinfo.email</code>: Identifies your sender email address to bind credentials to your workspace.
                </li>
              </ul>

              <h3 className="text-base font-semibold text-white pt-2">3.2 Scope Safeguards &amp; Inbox Non-Access</h3>
              <p>
                PitchMint does <strong className="text-white">NOT</strong> request or possess read access to your Gmail inbox (<code className="text-xs">gmail.readonly</code>). We cannot browse, read, scan, index, or harvest your incoming email messages. Reply detection is conducted through engagement link tracking and user manual status triggers.
              </p>
              <p>
                Google user data is never used to develop, improve, or train generalized AI/ML models. All tokens are encrypted at rest using AES-256-GCM.
              </p>
            </section>

            {/* Section 4: GDPR & Global Rights */}
            <section id="gdpr-rights" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                4. GDPR &amp; Global Data Protection Rights
              </h2>
              <p>
                Under the EU General Data Protection Regulation (GDPR), UK GDPR, and California Consumer Privacy Act (CCPA), you and your prospects maintain fundamental statutory rights:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-white">Right of Access:</strong> You may request a machine-readable export of all prospect records and personal data stored in your workspace.</li>
                <li><strong className="text-white">Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may permanently delete your account and all associated prospect records instantly via Settings.</li>
                <li><strong className="text-white">Right to Rectification:</strong> You may update or correct erroneous prospect details at any time.</li>
                <li><strong className="text-white">Right to Object / Unsubscribe:</strong> Recipients can unsubscribe with a single click via our automated HMAC verification token.</li>
              </ul>
            </section>

            {/* Section 5: Security & Encryption */}
            <section id="security-encryption" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                5. Security &amp; AES-256-GCM Encryption
              </h2>
              <p>
                PitchMint enforces enterprise-grade confidentiality safeguards. All OAuth tokens (Gmail access &amp; refresh tokens) and custom SMTP passwords are encrypted before database insertion using AES-256-GCM with distinct initialization vectors (IV) and authentication tags. Database connections are restricted via Supabase Row-Level Security (RLS), ensuring multi-tenant isolation.
              </p>
            </section>

            {/* Section 6: Sub-processors */}
            <section id="subprocessors" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                6. Authorized Sub-processors
              </h2>
              <p>PitchMint relies on audited enterprise cloud infrastructure providers:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)]">
                  <span className="font-semibold text-white block">Supabase Inc. / AWS</span>
                  <span className="text-[var(--pp-text-muted)]">Encrypted PostgreSQL Database &amp; Auth</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)]">
                  <span className="font-semibold text-white block">Cashfree Payments India</span>
                  <span className="text-[var(--pp-text-muted)]">PCI-DSS Compliant Payment Gateway</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)]">
                  <span className="font-semibold text-white block">Groq Inc.</span>
                  <span className="text-[var(--pp-text-muted)]">High-Speed Llama-3 AI Inference</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-subtle)]">
                  <span className="font-semibold text-white block">Google Cloud Platform</span>
                  <span className="text-[var(--pp-text-muted)]">Gemini API &amp; OAuth Authentication</span>
                </div>
              </div>
            </section>

            {/* Section 7: Retention & Purge */}
            <section id="retention-deletion" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                7. Data Retention &amp; Account Purge
              </h2>
              <p>
                We retain active prospect and sequence telemetry for the duration of your active subscription. Upon requesting account termination, your user profile, encrypted tokens, and all prospect lists are permanently destroyed across database tables within 30 days.
              </p>
            </section>

            {/* Section 8: Tracking Pixels */}
            <section id="tracking-pixels" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                8. Tracking Pixels &amp; Engagement Telemetry
              </h2>
              <p>
                To provide deliverability analytics, emails may contain a transparent 1x1 pixel image to measure open occurrences and wrapped hyperlinks to detect recipient clicks. Recipients may disable image rendering in their email clients to prevent open tracking.
              </p>
            </section>

            {/* Section 9: Data Controller Contact */}
            <section id="contact-controller" className="scroll-mt-28 space-y-3 pb-8">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                9. Data Controller &amp; DPO Contact
              </h2>
              <p>
                For any data subject requests, GDPR right-of-access filings, or privacy inquiries, please contact our designated Data Protection Officer:
              </p>
              <div className="p-5 rounded-2xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-default)] text-xs font-mono space-y-1 text-[var(--pp-text-secondary)]">
                <p className="text-white font-bold">Data Controller: NovaMint Networks</p>
                <p>Attention: Data Protection Officer (DPO)</p>
                <p>
                  Official Privacy Inquiries:{" "}
                  <a
                    href="mailto:support@novamintnetworks.in"
                    className="text-[var(--pp-accent3)] hover:underline"
                  >
                    support@novamintnetworks.in
                  </a>
                </p>
                <p>Alternate Security Contact: privacy@pitchmint.com</p>
                <p>Location: Rajasthan, India</p>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-[var(--pp-border-subtle)] py-8 bg-[var(--pp-bg-deepest)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--pp-text-muted)]">
          <p>© {new Date().getFullYear()} PitchMint (NovaMint Networks). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors cursor-pointer">
              Contact Support
            </Link>
            <Link href="/" className="hover:text-white transition-colors cursor-pointer">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
