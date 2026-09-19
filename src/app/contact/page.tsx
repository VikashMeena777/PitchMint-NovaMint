"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const TOPICS = [
  { id: "sales", label: "Sales & Upgrades", icon: Briefcase },
  { id: "support", label: "Technical Support", icon: HelpCircle },
  { id: "security", label: "Security & Privacy", icon: ShieldAlert },
  { id: "other", label: "General Inquiries", icon: MessageSquare },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "sales",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const maxMessageLength = 5000;

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    if (formData.message.length > maxMessageLength) {
      toast.error(`Message cannot exceed ${maxMessageLength} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate submission network call
      await new Promise((r) => setTimeout(r, 1000));
      setIsSuccess(true);
      toast.success("Message received! Our team will respond within 24 hours.");
      setFormData({
        name: "",
        email: "",
        topic: "sales",
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Failed to send message. Please try again or email support directly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--pp-bg-deepest)] text-[var(--pp-text-primary)] selection:bg-[var(--pp-accent1)] selection:text-white flex flex-col justify-between">
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-1 w-full">
        {/* Header Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="px-3.5 py-1 rounded-full bg-[var(--pp-accent1)]/10 border border-[var(--pp-border-accent)] text-xs font-semibold uppercase tracking-wider text-[var(--pp-accent1-light)] inline-block mb-3">
            Concierge Support
          </span>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-[var(--pp-text-secondary)] max-w-xl mx-auto text-base sm:text-lg">
            Have questions about custom plans, AI research capabilities, or technical deliverability? We reply within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Support Channels Sidebar (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Email card */}
            <div className="rounded-2xl p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] shadow-xl hover:border-[var(--pp-border-accent)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--pp-accent1)]/15 border border-[var(--pp-border-default)] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[var(--pp-accent1-light)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Direct Support Email</h3>
                  <a
                    href="mailto:support@novamintnetworks.in"
                    className="text-sm font-mono text-[var(--pp-accent3)] hover:underline mt-0.5 block"
                  >
                    support@novamintnetworks.in
                  </a>
                  <p className="text-xs text-[var(--pp-text-muted)] mt-1">
                    Fast response for existing customers and billing inquiries.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Chat card */}
            <div className="rounded-2xl p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] shadow-xl hover:border-[var(--pp-border-accent)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Live Chat Support</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-sm text-[var(--pp-text-secondary)] mt-0.5">Mon–Fri • 9:00 AM – 6:00 PM IST</p>
                  <p className="text-xs text-[var(--pp-text-muted)] mt-1">
                    Available in-app directly inside your authenticated dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Office location card */}
            <div className="rounded-2xl p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] shadow-xl hover:border-[var(--pp-border-accent)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--pp-accent4)]/15 border border-[var(--pp-border-default)] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[var(--pp-accent4-light)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Engineering HQ</h3>
                  <p className="text-sm text-[var(--pp-text-secondary)] mt-0.5">NovaMint Networks</p>
                  <p className="text-xs text-[var(--pp-text-muted)] mt-1">Rajasthan, India</p>
                </div>
              </div>
            </div>

            {/* Response Time Guarantee Card */}
            <div className="rounded-2xl p-6 bg-[var(--pp-bg-surface)] border border-[var(--pp-border-default)] shadow-xl hover:border-[var(--pp-border-accent)] transition-all">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--pp-accent2)]/15 border border-[var(--pp-border-default)] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[var(--pp-accent2-light)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Guaranteed Response Time</h3>
                  <p className="text-sm font-mono text-[var(--pp-accent1-light)] mt-0.5">&lt; 24 Hours SLA</p>
                  <p className="text-xs text-[var(--pp-text-muted)] mt-1">
                    Enterprise and Growth tier accounts receive priority 4-hour SLA.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Card (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="lg:col-span-7"
          >
            <div className="glass-strong rounded-3xl p-6 sm:p-10 border border-[var(--pp-border-default)] shadow-2xl relative">
              {isSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Thank you for reaching out!
                  </h3>
                  <p className="text-sm text-[var(--pp-text-secondary)] max-w-md mx-auto">
                    Your inquiry has been routed to our technical support desk. We will review your message and reply back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="mt-6 border-[var(--pp-border-default)] text-white hover:bg-[var(--pp-bg-surface2)] cursor-pointer"
                  >
                    Send another inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Topic Selector */}
                  <div>
                    <label className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--pp-text-muted)] mb-2 block">
                      Inquiry Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TOPICS.map((topic) => {
                        const Icon = topic.icon;
                        const isSelected = formData.topic === topic.id;
                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, topic: topic.id })}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer text-xs flex flex-col gap-1.5 ${
                              isSelected
                                ? "bg-[var(--pp-accent1)]/15 border-[var(--pp-accent1)] text-white font-medium shadow-sm"
                                : "bg-[var(--pp-bg-surface)] border-[var(--pp-border-subtle)] text-[var(--pp-text-secondary)] hover:border-[var(--pp-border-default)]"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                isSelected ? "text-[var(--pp-accent1-light)]" : "text-[var(--pp-text-muted)]"
                              }`}
                            />
                            <span>{topic.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                        Your Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Rostova"
                        required
                        className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] h-11 focus:border-[var(--pp-accent1)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                        Work Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@company.com"
                        required
                        className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] h-11 focus:border-[var(--pp-accent1)]"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block">
                      Subject
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can our revenue team help?"
                      className="bg-[var(--pp-bg-deepest)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] h-11 focus:border-[var(--pp-accent1)]"
                    />
                  </div>

                  {/* Message textarea with character limit countdown */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--pp-text-secondary)]">
                        Message *
                      </label>
                      <span className="text-[11px] font-mono text-[var(--pp-text-muted)]">
                        {formData.message.length} / {maxMessageLength} chars
                      </span>
                    </div>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      maxLength={maxMessageLength}
                      placeholder="Tell us about your team's outreach goals or technical questions..."
                      rows={5}
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm bg-[var(--pp-bg-deepest)] border border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-accent1)] focus:border-transparent resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo transition-all duration-200 text-sm"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Routing Message...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message to Team
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-[var(--pp-border-subtle)] py-8 bg-[var(--pp-bg-deepest)] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--pp-text-muted)]">
          <p>© {new Date().getFullYear()} PitchMint (NovaMint Networks). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
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
