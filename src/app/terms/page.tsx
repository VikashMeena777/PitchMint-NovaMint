"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";

interface Section {
  id: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "description", title: "2. Description of Service" },
  { id: "acceptable-use", title: "3. Acceptable Use Policy & Anti-Spam" },
  { id: "responsibilities", title: "4. User Responsibilities & Compliance" },
  { id: "ai-content", title: "5. AI-Generated Content Disclosures" },
  { id: "plans-billing", title: "6. Account Plans & Cashfree Billing" },
  { id: "data-ownership", title: "7. Data Ownership & Intellectual Property" },
  { id: "termination", title: "8. Account Termination & Suspension" },
  { id: "liability", title: "9. Limitation of Liability & Warranty Disclaimer" },
  { id: "governing-law", title: "10. Governing Law & Contact Details" },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const { scrollTo } = useSmoothScroll();

  // Scroll spy effect to highlight current active section in TOC
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
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

      {/* ━━━ MAIN WRAPPER ━━━ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex-1 w-full">
        {/* Header Title */}
        <div className="mb-14 pb-8 border-b border-[var(--pp-border-subtle)]">
          <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent1-light)] inline-block mb-3">
            Legal Transparency
          </span>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--pp-text-muted)] font-mono">
            Effective Date: May 15, 2026 • Last Reviewed: September 2026
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Sticky Table of Contents (4 cols) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="glass-strong rounded-3xl p-6 border border-[var(--pp-border-default)] shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--pp-text-muted)] pb-3 mb-4 border-b border-[var(--pp-border-subtle)]">
                <Scale className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                <span>Table of Contents</span>
              </div>

              <nav className="space-y-1" aria-label="Table of contents">
                {SECTIONS.map((sec) => {
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
                  <span>Compliant with CAN-SPAM Act</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GDPR &amp; CASL Safe Architecture</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Legal Text Content (8 cols) */}
          <article className="lg:col-span-8 space-y-12 text-sm text-[var(--pp-text-secondary)] leading-relaxed">
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, or subscribing to PitchMint (operated by NovaMint Networks, herein &ldquo;the Service&rdquo;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service and our Privacy Policy. If you are entering into this agreement on behalf of a company or legal entity, you represent that you possess the necessary organizational authority to bind that entity.
              </p>
            </section>

            {/* Section 2 */}
            <section id="description" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                2. Description of Service
              </h2>
              <p>
                PitchMint is an autonomous AI cold outreach and revenue intelligence platform that assists commercial teams in prospect telemetry research, personalized email composition, multi-touch automated follow-up sequence dispatch, and delivery analytics. The service connects to user-authorized email endpoints (Google Workspace / Gmail OAuth or custom SMTP) to dispatch messages from the user&apos;s own accounts.
              </p>
            </section>

            {/* Section 3 */}
            <section id="acceptable-use" className="scroll-mt-28 space-y-4">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                3. Acceptable Use Policy &amp; Anti-Spam
              </h2>
              <p>
                PitchMint strictly prohibits unsolicited bulk spamming. You agree that all outreach initiated via the Service will target verifiable B2B business prospects with legitimate commercial interest and comply with global email standards. You agree NOT to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Deploy PitchMint for indiscriminate scraping, email harvesting, or dictionary attacks.</li>
                <li>Violate the CAN-SPAM Act of 2003, EU General Data Protection Regulation (GDPR), Canadian Anti-Spam Legislation (CASL), or UK Data Protection Act.</li>
                <li>Send misleading headers, deceptive subject lines, or forged sender identifications.</li>
                <li>Transmit malware, phishing schemes, fraudulent financial offerings, or offensive content.</li>
                <li>Circumvent plan quota limits, rate limiters, or automated deliverability throttles.</li>
              </ul>
              <div className="rounded-2xl p-4 bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-accent)] text-xs text-[var(--pp-text-primary)]">
                <span className="font-bold text-[var(--pp-accent3)]">Zero Tolerance Policy:</span> Any account generating bounce rates above 5% or complaint rates above 0.1% will be immediately throttled or suspended to protect global IP subnet health.
              </div>
            </section>

            {/* Section 4 */}
            <section id="responsibilities" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                4. User Responsibilities &amp; Compliance
              </h2>
              <p>As a subscriber, you agree to maintain complete responsibility for:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Ensuring you possess a legal basis (such as legitimate interest under GDPR Recital 47) before contacting prospective individuals.</li>
                <li>Maintaining valid physical business postal address disclosures in your email templates as required by law.</li>
                <li>Honoring all unsubscribe requests instantly. PitchMint provides automated HMAC unsubscribe links which must not be removed or obscured.</li>
                <li>Safeguarding all account credentials, API keys, and workspace access tokens.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="ai-content" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                5. AI-Generated Content Disclosures
              </h2>
              <p>
                PitchMint utilizes advanced multi-provider neural networks (Groq and Google Gemini) to generate prospective email angles and research dossiers. While our models are continually optimized for accuracy, AI-generated outputs may occasionally include factual discrepancies. You remain the sole author and approval authority for all communications dispatched from your email credentials.
              </p>
            </section>

            {/* Section 6 */}
            <section id="plans-billing" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                6. Account Plans &amp; Cashfree Billing
              </h2>
              <p>
                Subscriptions are billed on a recurring monthly or annual basis in accordance with selected tier pricing. Payment processing is securely handled via our authorized payment partner, Cashfree Payments India Pvt. Ltd. You may cancel your subscription at any time within Settings; cancellations take effect at the conclusion of the active billing cycle. PitchMint does not offer prorated refunds for partial billing cycles.
              </p>
            </section>

            {/* Section 7 */}
            <section id="data-ownership" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                7. Data Ownership &amp; Intellectual Property
              </h2>
              <p>
                You retain all rights, title, and ownership of prospect data, company profiles, and custom templates uploaded to PitchMint. PitchMint does not sell user lead databases or utilize your proprietary prospect data to train public third-party foundational models.
              </p>
            </section>

            {/* Section 8 */}
            <section id="termination" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                8. Account Termination &amp; Suspension
              </h2>
              <p>
                We reserve the right to suspend or terminate accounts without prior notice if we detect evidence of abuse, credential harvesting, or malicious cyber activity. In the event of standard voluntary account deletion, all database records, prospect lists, and cached OAuth tokens will be purged within thirty (30) days.
              </p>
            </section>

            {/* Section 9 */}
            <section id="liability" className="scroll-mt-28 space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                9. Limitation of Liability &amp; Warranty Disclaimer
              </h2>
              <p>
                THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND. PITCHMINT DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL PITCHMINT OR NOVAMINT NETWORKS BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM EMAIL DELIVERABILITY BLOCKS, THIRD-PARTY API OUTAGES, OR LOSS OF BUSINESS PROFITS.
              </p>
            </section>

            {/* Section 10 */}
            <section id="governing-law" className="scroll-mt-28 space-y-3 pb-8">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                10. Governing Law &amp; Contact Details
              </h2>
              <p>
                These Terms shall be governed and interpreted under the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Rajasthan, India.
              </p>
              <div className="pt-2 font-mono text-xs text-[var(--pp-text-secondary)]">
                <p>Legal &amp; Compliance Office: NovaMint Networks</p>
                <p>Direct Inquiries: <a href="mailto:support@novamintnetworks.in" className="text-[var(--pp-accent3)] hover:underline">support@novamintnetworks.in</a></p>
                <p>Mailing Address: Rajasthan, India</p>
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
            <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors cursor-pointer">
              Contact
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
