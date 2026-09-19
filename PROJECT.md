# Project: PitchMint Platform Redesign & Backend Hardening

## Architecture
- **Framework & Runtime**: Next.js 16.2.2 (App Router, Turbopack, Async Request APIs) + React 19.2.4.
- **Styling & Design System**: Tailwind CSS v4, CSS-first `@theme inline` with `--pp-*` midnight obsidian tokens, fluid typography via `clamp()`, and custom micro-animated SVG/Lucide icons.
- **Motion Engine**: Global Lenis virtual smooth-scroll synchronized with GSAP ScrollTrigger ticker; Framer Motion for layout transitions and modal/tab micro-interactions; full `prefers-reduced-motion` compliance.
- **Interactive 3D**: Pure Three.js procedural WebGL canvas components dynamically loaded (`ssr: false`) with IntersectionObserver RAF pausing, DPR clamping, and Canvas 2D fallback.
- **Backend & Database**: Next.js Server Actions (`src/lib/actions/*`) and API routes (`src/app/api/*`) connected to Supabase (PostgreSQL + Auth + RLS). Zod runtime validation, AES-256-GCM token encryption, distributed rate limiting with in-memory fallback.
- **Integrations**: Cashfree PG v5 (verified order tags/amounts, HMAC webhooks), Gmail OAuth (encrypted tokens, CASA-compliant heuristic interest detection), Multi-Provider AI (Groq + Gemini @google/generative-ai).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F01: Design Tokens & Palette | `--pp-*` midnight obsidian theme variables, fluid `clamp()` scales, purge legacy `zinc-*` | M1 | Survey 1, 3 |
| 2 | F02: Animated Iconography | Micro-animated SVG icon system (`animated-zap`, `animated-mail`, etc.), button `cursor-pointer` | M1 | Survey 1 |
| 3 | F03: Build & Lint Hygiene | Resolve 53 ESLint errors (React 19 purity, hook effects, any types), clean Turbopack config | M1 | Survey 3 |
| 4 | F04: Lenis Smooth Scroll | Global `SmoothScrollProvider`, GSAP ticker sync, Next 16 route transition scroll reset | M2 | Survey 3 |
| 5 | F05: GSAP ScrollTrigger Timelines | Scrubbed text reveals, parallax layers, pinned bento unveils, React lifecycle cleanup (`useGSAP`) | M2 | Survey 3 |
| 6 | F06: Framer Motion Micro-Interactions | Layout transitions, spring physics, accessible `prefers-reduced-motion` safeguards | M2 | Survey 1, 3 |
| 7 | F07: Interactive 3D WebGL Canvas | Pure Three.js hero crystal lattice, pipeline sphere, 60fps guardrails, Canvas 2D fallback | M2 | Survey 3 |
| 8 | F08: Landing Page (`/`) Overhaul | Cinematic hero, mobile navigation drawer (<768px), bento grid, live sequence demo, pricing calc | M3 | Survey 1 |
| 9 | F09: Marketing Auxiliary Pages | Overhaul `/contact`, `/terms`, `/privacy` with glassmorphic cards, TOC, compliance notices | M3 | Survey 1 |
| 10 | F10: Split-Pane Auth Pages | Overhaul `/login` and `/signup` with animated visual showcases and form polish | M3 | Survey 1 |
| 11 | F11: Focused Onboarding Wizard | Decouple `/onboarding` layout from app shell, 4-step wizard with live tone preview | M3 | Survey 1 |
| 12 | F12: Authenticated App Shell | Glassmorphic `app-header.tsx`, collapsible `app-sidebar.tsx`, mobile drawer, notifications | M4 | Survey 1 |
| 13 | F13: Interactive Dashboard | `/dashboard` metric cards with sparkline charts, live activity stream, quick actions | M4 | Survey 1 |
| 14 | F14: Prospects & Drawer Preview | `/prospects` data table, floating bulk action bar, slide-out AI enrichment `Sheet` drawer | M4 | Survey 1 |
| 15 | F15: Visual Sequence Builder | `/sequences/[id]` interactive node graph with animated pulses & conditional branches | M4 | Survey 1 |
| 16 | F16: Recharts Analytics | `/analytics` outreach funnel, deliverability meters, conversion area charts | M4 | Survey 1 |
| 17 | F17: Billing, Settings & Templates | `/billing`, `/settings`, `/templates` tiered pricing cards, usage meters, template gallery | M4 | Survey 1 |
| 18 | F18: Backend Security Hardening | Neutralize open redirect, HMAC unsubscribe, sanitize credential leak in `getUserProfile` | M5 | Survey 2 |
| 19 | F19: Plaintext Token Encryption | AES-256-GCM encryption with backward-compatible decryption for Gmail OAuth & SMTP | M5 | Survey 2 |
| 20 | F20: Cashfree Billing Integrity | Enforce plan verification, order tag check, amount match, and webhook HMAC validation | M5 | Survey 2 |
| 21 | F21: Server Actions & API Resilience | Zod validation, PostgREST filter sanitization, plan quota enforcement, Gemini reconnection | M5 | Survey 2 |
| 22 | F22: Final E2E Suite & Adversarial Hardening | 100% pass across Tiers 1-4 E2E tests, Tier 5 adversarial hardening, cross-breakpoint audit | M6 | Survey 1, 2, 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation, Tokens & Codebase Hygiene | Install motion/3D/Zod packages, fix 53 ESLint errors, update `globals.css` tokens, build animated icon library | None | DONE |
| M2 | Motion Engine & Interactive 3D WebGL | Lenis smooth scroll provider, GSAP ScrollTrigger timeline system, Three.js hero crystal & pipeline sphere | M1 | DONE |
| M3 | Public Marketing & Auth Pages Redesign | Redesign `/`, `/contact`, `/terms`, `/privacy`, `/login`, `/signup`, `/onboarding` (with mobile nav drawer) | M1, M2 | DONE |
| M4 | Authenticated App Shell & Core Views | Redesign app shell, `/dashboard`, `/prospects` (with drawer), `/sequences` (node builder), `/analytics` (Recharts), `/settings` | M1, M2 | DONE |
| M5 | Backend Resilience, Security & Integrations | Remediate 7 vulnerabilities (open redirect, unsubscribe, token encryption, Cashfree verification, RLS/quotas, Gemini AI) | M1 | DONE |
| M6 | Final E2E Test Suite Pass & Adversarial Hardening | Pass 100% E2E test suite (Tiers 1-4), Tier 5 adversarial edge-case hardening, responsive audits, zero-regression build | M1, M2, M3, M4, M5, TEST_READY | IN_PROGRESS |

## Parallel Track: E2E Testing Track
| Track | Scope | Outputs | Status |
|-------|-------|---------|--------|
| E2E Testing Track | Independent opaque-box test suite for all 22 features (Tiers 1-4: >=253 test cases) | `TEST_INFRA.md`, test runner, `TEST_READY.md` | DONE |

## Interface Contracts
### Motion & Design System ↔ UI Components
- `SmoothScrollProvider`: wraps root `src/app/layout.tsx`. Exposes scroll context, binds GSAP ticker, resets scroll on route transitions.
- Animated Icons: exported from `src/components/icons/*`, accepts `className`, `size`, `animated?: boolean`.
- 3D WebGL Canvas: `src/components/canvas/hero-scene.tsx`, `src/components/canvas/sphere-scene.tsx` dynamically imported with `{ ssr: false }`. Fallbacks gracefully to Canvas 2D if WebGL is unavailable.

### Frontend ↔ Backend Server Actions
- All Server Actions in `src/lib/actions/*` return standardized schema: `{ success: boolean; data?: T; error?: string }`.
- `getUserProfile`: Returns user fields excluding `gmail_access_token`, `gmail_refresh_token`, `smtp_password`, `api_key`.
- `getProspects`: Accepts `{ search?: string; status?: string; tag?: string; limit?: number; offset?: number }` with strict parameter sanitization.
- `addProspect` / `createSequence`: Validates plan quotas via `canUserPerformAction(userId, action)` before writing to DB.

### Billing & OAuth Verification
- `verify-order`: Checks `orderStatus.order_amount === planPrice` and `orderStatus.order_tags.plan_id === planId`.
- `gmail/callback`: Encrypts `access_token` and `refresh_token` using `encrypt()` from `src/lib/utils/encryption.ts`.
- `gmail.ts`: Reads tokens and decrypts using `decrypt()` with transparent plaintext fallback for existing rows.

## Code Layout
- `src/components/providers/smooth-scroll-provider.tsx`: Lenis + GSAP ticker provider.
- `src/components/canvas/*`: Three.js procedural WebGL visual anchors.
- `src/components/icons/*`: Micro-animated SVG icons.
- `src/components/ui/*`: shadcn/ui base primitives with micro-interactions.
- `src/app/(auth)/*`: Split-pane authentication pages.
- `src/app/(onboarding)/*`: Dedicated focused onboarding layout and wizard.
- `src/app/(app)/*`: Authenticated app views and shell.
- `src/lib/actions/*`: Server actions with Zod validation and plan limit checks.
- `src/lib/ai/engine.ts`: Multi-provider AI engine (Groq + Gemini).
- `src/lib/security/*`: Input sanitization, HMAC token generation, redirect validation.
- `tests/e2e/*`: Opaque-box E2E test suite.
