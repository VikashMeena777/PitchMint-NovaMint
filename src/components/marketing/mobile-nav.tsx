"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard, Sparkles, Mail, Shield, HelpCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isLoggedIn?: boolean;
}

export function MobileNav({ isLoggedIn = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Focus the close button when opened
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLinkClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features", icon: Sparkles },
    { label: "How It Works", href: "#how-it-works", icon: Mail },
    { label: "Pricing", href: "#pricing", icon: Shield },
    { label: "FAQ", href: "#faq", icon: HelpCircle },
    { label: "Contact", href: "/contact", icon: PhoneCall },
  ];

  return (
    <div className="md:hidden">
      {/* Mobile Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className="p-2 rounded-xl bg-[var(--pp-bg-surface2)] border border-[var(--pp-border-default)] text-[var(--pp-text-primary)] hover:text-white hover:border-[var(--pp-border-strong)] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--pp-accent1)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Accessible Sliding Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end" id="mobile-nav-drawer">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xs h-full bg-[var(--pp-bg-surface)] border-l border-[var(--pp-border-default)] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                {/* Header with Logo and Close Button */}
                <div className="flex items-center justify-between pb-6 border-b border-[var(--pp-border-subtle)] mb-6">
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <Image
                      src="/PitchMint Logo.jpg"
                      alt="PitchMint"
                      width={32}
                      height={32}
                      className="rounded-lg shadow-md"
                    />
                    <span
                      className="text-lg font-bold tracking-tight text-[var(--pp-text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      PitchMint
                    </span>
                  </Link>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2 rounded-xl text-[var(--pp-text-muted)] hover:text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--pp-accent1)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5" aria-label="Mobile Navigation Links">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index, duration: 0.25 }}
                      >
                        <Link
                          href={link.href}
                          onClick={handleLinkClick}
                          className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-medium text-[var(--pp-text-secondary)] hover:text-white hover:bg-[var(--pp-bg-surface2)] transition-all duration-150 cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-[var(--pp-accent1-light)]" />
                          <span>{link.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-[var(--pp-border-subtle)] space-y-3">
                {isLoggedIn ? (
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo"
                  >
                    <Link href="/dashboard" onClick={handleLinkClick}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full bg-transparent border-[var(--pp-border-default)] text-[var(--pp-text-primary)] hover:bg-[var(--pp-bg-surface2)] cursor-pointer"
                    >
                      <Link href="/login" onClick={handleLinkClick}>
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo"
                    >
                      <Link href="/signup" onClick={handleLinkClick}>
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  </>
                )}
                <p className="text-center text-xs text-[var(--pp-text-muted)] pt-2">
                  © {new Date().getFullYear()} PitchMint. All rights reserved.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileNav;
