"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { AuthShowcase } from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function validateEmail(val: string): boolean {
    // Rejects missing @, missing domain, or double dot in domain
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(val) && !val.includes("..");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase is not configured. Please set environment variables.");
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Check onboarding state or route to dashboard
      const user = data?.user;
      if (user && user.user_metadata?.onboarding_completed === false) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Pane: Visual Showcase & Testimonials (Desktop) */}
      <AuthShowcase
        heading="Welcome Back to Your Outbound Engine"
        subheading="Sign in to monitor live sequence deliverability, review AI-researched prospects, and scale pipeline."
      />

      {/* Right Pane: Login Form */}
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
            href="/signup"
            className="text-xs text-[var(--pp-accent1-light)] font-medium hover:underline"
          >
            Create account
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
              Sign in to PitchMint
            </h1>
            <p className="text-sm text-[var(--pp-text-secondary)] mb-8">
              Enter your credentials to access your autonomous outreach workspace.
            </p>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-12 gap-3 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white hover:bg-[var(--pp-bg-surface2)] hover:border-[var(--pp-border-strong)] transition-all duration-200 cursor-pointer font-medium text-sm rounded-xl mb-6 shadow-sm"
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
              <span>Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--pp-border-subtle)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-[var(--pp-bg-deepest)] text-[var(--pp-text-muted)] font-mono font-semibold">
                  or with email
                </span>
              </div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label
                  htmlFor="login-email"
                  className="text-xs font-semibold text-[var(--pp-text-secondary)] mb-1.5 block"
                >
                  Work Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="founder@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-[var(--pp-text-secondary)]"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[var(--pp-accent1-light)] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pp-text-muted)]" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 bg-[var(--pp-bg-surface)] border-[var(--pp-border-default)] text-white placeholder:text-[var(--pp-text-muted)] rounded-xl focus:border-[var(--pp-accent1)]"
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
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--pp-text-secondary)]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--pp-border-default)] bg-[var(--pp-bg-surface)] text-[var(--pp-accent1)] focus:ring-[var(--pp-accent1)]"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              {/* Error Alert */}
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
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in to Account
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Sign up Link */}
            <div className="text-center text-xs text-[var(--pp-text-secondary)] mt-8">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[var(--pp-accent1-light)] font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign up for free
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer legal note */}
        <div className="text-center text-xs text-[var(--pp-text-muted)] pt-6 border-t border-[var(--pp-border-subtle)]">
          Protected by PitchMint Cloud Shield •{" "}
          <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
            Terms
          </Link>{" "}
          &amp;{" "}
          <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
