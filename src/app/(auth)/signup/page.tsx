"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthShowcase } from "@/components/auth";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  function validateEmail(val: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(val) && !val.includes("..");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedCompany = companyName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedCompany) {
      setError("Please enter your company or workspace name.");
      return;
    }

    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured. Please set environment variables.");
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            company_name: trimmedCompany,
            onboarding_completed: false,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Transition to focused onboarding wizard
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during account creation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Pane: Visual Showcase & Testimonials (Desktop) */}
      <AuthShowcase
        heading="Start Booking More Pipeline on Autopilot"
        subheading="Join high-velocity SDRs and founders using PitchMint to research prospects, compose authentic messages, and scale outreach."
      />

      {/* Right Pane: Registration Form */}
      <div className="flex flex-col justify-between min-h-screen p-6 sm:p-12 lg:p-16 relative">
        {/* Mobile Header Logo (<1024px) */}
        <div className="lg:hidden flex items-center justify-between pb-6 mb-4 border-b border-[var(--pp-border-subtle)]">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <Image
              src="/PitchMint Logo.jpg"
              alt="PitchMint"
              width={32}
              height={32}
              className="rounded-lg shadow-md"
            />
            <span
              className="text-lg font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PitchMint
            </span>
          </Link>
          <Link
            href="/login"
            className="text-xs text-[var(--pp-accent1-light)] font-medium hover:underline"
          >
            Sign in
          </Link>
        </div>

        {/* Centered Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start closing deals
            </h1>
            <p className="text-sm text-[var(--pp-text-secondary)] mb-6">
              Create your PitchMint workspace — free plan includes 25 leads/month.
            </p>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full h-12 gap-3 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white hover:bg-[var(--pp-bg-surface2)] hover:border-[var(--pp-border-strong)] transition-all duration-200 cursor-pointer font-medium text-sm rounded-xl mb-5 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign up with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--pp-border-subtle)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-[var(--pp-bg-deepest)] text-[var(--pp-text-muted)] font-mono font-semibold">
                  or register with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Label
                    htmlFor="signup-name"
                    className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1 block"
                  >
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-11 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="signup-company"
                    className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1 block"
                  >
                    Company Name *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="NovaMint Inc"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="pl-10 h-11 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="signup-email"
                  className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1 block"
                >
                  Work Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="alex@novamint.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="signup-password"
                  className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1 block"
                >
                  Password (8+ characters) *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10 pr-10 h-11 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--pp-text-muted)] hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-colors ${
                            passwordStrength >= level
                              ? level <= 2
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                              : "bg-[var(--pp-bg-surface2)]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--pp-text-muted)] font-mono">
                      {passwordStrength < 2 && "Too weak — add uppercase, numbers, or symbols"}
                      {passwordStrength === 2 && "Fair — add special symbols"}
                      {passwordStrength >= 3 && "Strong password"}
                    </p>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 text-xs text-[var(--pp-text-secondary)] pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-[var(--pp-border-default)] bg-[var(--pp-bg-surface)] text-[var(--pp-accent1)] focus:ring-[var(--pp-accent1)] mt-0.5"
                />
                <label htmlFor="agree-terms" className="cursor-pointer leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[var(--pp-accent1-light)] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and acknowledge the{" "}
                  <Link href="/privacy" className="text-[var(--pp-accent1-light)] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-[var(--pp-accent1)] to-[var(--pp-accent1-dark)] text-white font-semibold cursor-pointer btn-hover glow-indigo transition-all duration-200 rounded-xl mt-2 text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating workspace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center text-xs text-[var(--pp-text-secondary)] mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--pp-accent1-light)] font-semibold hover:underline cursor-pointer ml-1"
              >
                Log in
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--pp-text-muted)] pt-6 border-t border-[var(--pp-border-subtle)]">
          Free plan includes 25 leads/mo • No credit card required • Instant setup
        </div>
      </div>
    </div>
  );
}
