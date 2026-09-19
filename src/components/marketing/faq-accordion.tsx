"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How does the AI prospect research work?",
    answer:
      "PitchMint scans public corporate telemetry for each prospect: their company website, recent LinkedIn posts, executive press announcements, and technological footprint. It identifies authentic triggers (such as recent funding or hiring sprees) and weaves them naturally into personalized email angles that sound human-written.",
    category: "AI & Research",
  },
  {
    id: "faq-2",
    question: "Will my cold emails land in primary inboxes or spam?",
    answer:
      "PitchMint is built around deliverability hygiene. We enforce smart sending throttles, gradual inbox warm-up curves, and verify DNS records (SPF, DKIM, DMARC). Because every email is unique rather than a mass carbon-copy, spam filters see genuine 1-to-1 conversation traffic.",
    category: "Deliverability",
  },
  {
    id: "faq-3",
    question: "Can I connect my existing Gmail or custom SMTP provider?",
    answer:
      "Yes. PitchMint connects seamlessly to your Google Workspace / Gmail account via encrypted OAuth 2.0, or to any custom SMTP/IMAP server (Outlook, SendGrid, Amazon SES). Emails are dispatched directly from your own domain, maintaining your organic sender authority.",
    category: "Integrations",
  },
  {
    id: "faq-4",
    question: "What happens when a prospect replies to an email?",
    answer:
      "Our AI immediately detects the incoming response and pauses all subsequent sequence follow-ups for that prospect. The response is categorized by intent (Interested, Demo Request, Referral, Out of Office), and you receive an instant notification in your dashboard and inbox.",
    category: "Sequences",
  },
  {
    id: "faq-5",
    question: "Is there a completely free plan?",
    answer:
      "Yes! Our Free tier includes 25 verified prospects per month, 1 active multi-touch sequence, full AI email composition, and deliverability monitoring. No credit card is required to create an account and start launching outreach.",
    category: "Pricing",
  },
  {
    id: "faq-6",
    question: "How does PitchMint handle CAN-SPAM and GDPR compliance?",
    answer:
      "PitchMint automatically appends secure, one-click HMAC unsubscribe links to every campaign email and allows you to configure your physical business mailing address in Settings. Unsubscribe requests take effect immediately and are synced across all your sequences.",
    category: "Compliance",
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3.5">
      {FAQS.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] shadow-lg shadow-[var(--pp-accent1)]/5"
                : "bg-[var(--pp-bg-surface)]/60 border-[var(--pp-border-subtle)] hover:border-[var(--pp-border-default)]"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleFaq(faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.id}`}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pp-accent1)]"
            >
              <div className="flex items-center gap-3 pr-4">
                <span className="text-sm sm:text-base font-semibold text-[var(--pp-text-primary)]">
                  {faq.question}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="flex-shrink-0 text-[var(--pp-text-muted)]"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${faq.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--pp-text-secondary)] leading-relaxed border-t border-[var(--pp-border-subtle)]/70">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;
