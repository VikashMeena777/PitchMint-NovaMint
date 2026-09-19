# Original User Request

## Initial Request — 2026-09-18T19:04:35Z

Run the multi agents parallel and do every work with perfection, use all the tools you want and everything you need. Do not fast up the process and do not be in hurry to finish the tasks, just do the complete and deep work with all time you need.

Working directory: C:\Users\Vikash Meena\.gemini\antigravity\worktrees\pitchmint\comprehensive_website_redesign
Integrity mode: development

CONTEXT & CURRENT STATUS:
- Milestone 1 (Foundational design tokens `--pp-*`, fluid typography, animated SVG icons in `src/components/icons/*`, and dependency installations `lenis`, `gsap`, `three`, `zod`) is ALREADY COMPLETED.
- TypeScript check (`npx tsc --noEmit`) passes with 0 errors.
- Test infrastructure (`TEST_INFRA.md` and `TEST_READY.md`) with 253 test cases is created.
- Project specification `PROJECT.md` is active.
- RESUME directly from Milestone 2 (Motion Engine & 3D WebGL Canvas) and execute through Milestone 3 (Marketing/Auth), Milestone 4 (App Shell & Views), Milestone 5 (Backend Hardening & Integrations), and Milestone 6 (Final verification).

A-to-Z redesign of the entire PitchMint web platform (both marketing pages and authenticated application views) into a high-end, trending Awwwards/Linear-grade experience. Features fluid typography, animated icons, Lenis smooth scrolling, GSAP ScrollTrigger parallax, Framer Motion transitions, and interactive 3D procedural/canvas objects that reveal on scroll. Upgrade and elevate backend architecture, API resilience, and enterprise security practices without breaking existing functionality or introducing loopholes. Includes comprehensive bug hunting and programmatic verification.

## Requirements

### R1. Design System, Typography & Animated Iconography
- Upgrade design tokens to a cohesive, cinematic dark aesthetic with refined color palettes, fluid typography (`clamp()`), glowing borders, and subtle glassmorphic surfaces.
- Introduce dynamic, animated icons (using `lucide-react` animated states or custom micro-animated SVG components) across navigation, feature highlights, and dashboard cards.
- Refresh shadcn/ui components with micro-interactions, smooth hover states (`cursor-pointer`, spring physics), and accessible contrast standards.

### R2. Motion Engine: Lenis Smooth Scroll & GSAP ScrollTrigger
- Implement a global Lenis smooth-scroll provider configured seamlessly with Next.js 16 and React 19.
- Orchestrate GSAP ScrollTrigger timelines for parallax layering, pinned feature reveals, scrubbed text unveilings, and section morphs on scroll.
- Incorporate Framer Motion for layout transitions, modals, interactive tabs, and dropdown micro-interactions with proper `prefers-reduced-motion` compliance.

### R3. Interactive 3D Objects & WebGL Canvas Scroll Revealing
- Implement interactive 3D procedural elements (using Three.js / React Three Fiber and lightweight WebGL/Canvas/CSS 3D) that react to mouse hover, tilt, and scroll progress.
- Feature trending 3D visual anchors: floating geometric nodes, interactive pipeline spheres, holographic cards, and scroll-linked depth scenes that smoothly load without frame drops.

### R4. Complete Full-Site Page Redesign (Marketing & App)
- **Marketing Pages:** Completely overhaul Landing (`/`), Contact (`/contact`), Terms (`/terms`), and Privacy (`/privacy`) with cinematic hero sections, interactive bento feature grids, dynamic live sequence demos, social proof counters, interactive pricing calculators, and expandable FAQs.
- **Auth & Onboarding:** Redesign Login (`/login`), Signup (`/signup`), and Onboarding (`/onboarding`) with split-pane animated visual showcases, progress steppers, and polished form fields.
- **Application Views:** Elevate the authenticated app shell (`src/app/(app)/layout.tsx`, `app-header.tsx`, `app-sidebar.tsx`) and views:
  - Dashboard (`/dashboard`): interactive KPI metrics, live activity feeds, quick actions.
  - Prospects & Detail (`/prospects`, `/prospects/[id]`): rich data tables, bulk action floating toolbars, AI enrichment preview drawers.
  - Sequences & Visual Builder (`/sequences`, `/sequences/[id]`): interactive drag-and-drop step graph with animation pulses and conditional branches.
  - Analytics (`/analytics`): animated Recharts charts, deliverability funnels, conversion meters.
  - Billing & Settings (`/billing`, `/settings`, `/templates`): tiered pricing selectors, template previews, and credential managers.

### R5. Backend Upgrades, API Resilience & Enterprise Security Hardening
- Upgrade and harden the backend with enterprise best practices while strictly preserving zero-breaking-change behavior:
  - Enterprise security: Audit and enforce rigorous input sanitization, CSRF/CORS protections, rate limiting, and robust error masking (no sensitive stack traces leaked).
  - Auth & Supabase: Harden auth sessions, cookie handling, and RLS policies across all tables.
  - Server actions & APIs: Enhance `src/lib/actions/*` and `/api/*` routes with graceful fallbacks, structured logging, and robust type validation.
  - Billing & OAuth integrity: Preserve and reinforce Cashfree subscription workflows, webhooks, and Gmail OAuth flows without regressions.
  - Preserve all database contracts, environment configurations, and core business logic.

### R6. Deep Bug Hunting, Type Safety & Verification
- Hunt for existing bugs, layout breaks, unhandled async states, hydration mismatches, and TypeScript/ESLint warnings.
- Resolve any package compatibility nuances between React 19, Next.js 16, Three.js, GSAP, and Framer Motion.
- Ensure all pages are responsive across 375px (mobile), 768px (tablet), 1024px (laptop), and 1440px+ (desktop).

## Acceptance Criteria

### Visual & Interactive Execution
- [ ] Lenis smooth scroll operates smoothly across all scrollable pages with zero jank.
- [ ] GSAP ScrollTrigger parallax and scroll-revealing animations trigger reliably on scroll and clean up on component unmount.
- [ ] Interactive 3D procedural/canvas components render and respond to cursor tilt and scroll position without dropping below 50fps on modern devices.
- [ ] Animated icon components and micro-interactions active on key UI touchpoints with visible focus and hover states.
- [ ] Mobile navigation and responsive layouts function cleanly with zero horizontal scrollbar leaks.

### Functional & Code Integrity
- [ ] `npm run build` completes successfully with zero TypeScript compilation errors.
- [ ] `npm run lint` passes without blocking errors.
- [ ] Supabase authentication flows (login, signup, auth state listeners) remain fully operational.
- [ ] Critical server actions (`prospects`, `sequences`, `ai`, `emails`) and billing workflows execute without broken imports or altered payloads.
- [ ] User can manually test and inspect the site locally before pushing code to GitHub.
