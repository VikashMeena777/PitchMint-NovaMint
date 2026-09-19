# E2E Test Infra: PitchMint Platform Redesign & Hardening

## Test Philosophy
- **Opaque-box, requirement-driven**: Derived strictly from `ORIGINAL_REQUEST.md` and user specifications, not implementation internals.
- **Progressive testability**: Test verification mechanisms do not rely on features more complex than what is being tested.
- **Methodology**: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory & Tier Coverage Targets
| # | Feature | Requirement | Tier 1 (Req) | Tier 2 (Boundary) | Tier 3 (Pairwise) |
|---|---------|-------------|:------------:|:-----------------:|:-----------------:|
| 1 | F01: Design Tokens & Fluid Typography | R1 | 5 | 5 | ✓ |
| 2 | F02: Animated Iconography & Micro-interactions | R1 | 5 | 5 | ✓ |
| 3 | F03: Build & Lint Zero-Error Hygiene | R6 | 5 | 5 | ✓ |
| 4 | F04: Lenis Smooth Scroll Provider | R2 | 5 | 5 | ✓ |
| 5 | F05: GSAP ScrollTrigger Timelines & Parallax | R2 | 5 | 5 | ✓ |
| 6 | F06: Framer Motion Layouts & Reduced Motion | R2 | 5 | 5 | ✓ |
| 7 | F07: Interactive 3D WebGL Canvas & Fallback | R3 | 5 | 5 | ✓ |
| 8 | F08: Landing Page (Hero, Nav Drawer, Bento, Pricing) | R4 | 5 | 5 | ✓ |
| 9 | F09: Marketing Auxiliary Pages (Contact, Terms, Privacy) | R4 | 5 | 5 | ✓ |
| 10 | F10: Split-Pane Auth Pages (Login, Signup) | R4 | 5 | 5 | ✓ |
| 11 | F11: Focused 4-Step Onboarding Wizard | R4 | 5 | 5 | ✓ |
| 12 | F12: Authenticated App Shell & Mobile Drawer | R4 | 5 | 5 | ✓ |
| 13 | F13: Dashboard (KPI sparklines, live activity stream) | R4 | 5 | 5 | ✓ |
| 14 | F14: Prospects Table & AI Preview Drawer | R4 | 5 | 5 | ✓ |
| 15 | F15: Visual Sequence Graph Builder | R4 | 5 | 5 | ✓ |
| 16 | F16: Recharts Analytics Outreach Funnel & Gauges | R4 | 5 | 5 | ✓ |
| 17 | F17: Billing, Settings & Templates Views | R4 | 5 | 5 | ✓ |
| 18 | F18: Security Hardening (Redirect, Unsubscribe, Leakage) | R5 | 5 | 5 | ✓ |
| 19 | F19: AES-256-GCM OAuth Token Encryption | R5 | 5 | 5 | ✓ |
| 20 | F20: Cashfree Order Verification & Plan Enforcement | R5 | 5 | 5 | ✓ |
| 21 | F21: Server Actions & API Resilience (Zod, Quotas, AI) | R5 | 5 | 5 | ✓ |
| 22 | F22: Responsive Cross-Device Viewports (375px - 1440px) | R6 | 5 | 5 | ✓ |

## Test Architecture
- **Directory Layout**: `tests/e2e/`
  - `tests/e2e/harness.ts`: Standardized test runner, assertion library, and mock HTTP environment.
  - `tests/e2e/tier1-features/`: Unit & functional tests verifying each feature in isolation (110 test cases).
  - `tests/e2e/tier2-boundaries/`: Edge cases, empty inputs, extreme viewports, malicious payloads (110 test cases).
  - `tests/e2e/tier3-pairwise/`: Cross-feature combinatorial interactions (22 test cases).
  - `tests/e2e/tier4-scenarios/`: End-to-end user journeys (11 comprehensive scenarios).
- **Invocation Command**: `node tests/e2e/runner.js` or `npm run test:e2e`.
- **Pass/Fail Semantics**: All tests must complete with exit code 0 and 0 failures.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| S01 | New User Discovery to Signup | F01, F04, F07, F08, F10 | Medium |
| S02 | Focused Onboarding & ICP Setup | F10, F11, F02, F21 | Medium |
| S03 | Prospect Import & AI Enrichment Drawer | F12, F14, F21, F18 | High |
| S04 | Visual Multi-Step Sequence Construction | F12, F15, F02, F21 | High |
| S05 | Live Sequence Outreach Simulation | F08, F15, F16, F21 | Medium |
| S06 | Campaign Analytics & Deliverability Funnel | F12, F16, F01 | Medium |
| S07 | Cashfree Subscription Upgrade Journey | F08, F17, F20 | High |
| S08 | Gmail OAuth Connection & Token Encryption | F17, F19, F18 | High |
| S09 | Mobile Prospect Inspection on 375px Viewport | F08, F12, F14, F22 | High |
| S10 | Security Penetration & Malicious Input Defense | F18, F19, F20, F21 | High |
| S11 | High-DPI Smooth Scroll & 3D WebGL Resilience | F04, F05, F07, F22 | High |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 110 tests (≥5 per feature across 22 features)
- **Tier 2 (Boundary & Corner)**: ≥ 110 tests (≥5 per feature across 22 features)
- **Tier 3 (Cross-Feature Pairwise)**: ≥ 22 pairwise interaction tests
- **Tier 4 (Real-World Application)**: ≥ 11 end-to-end user scenario flows
- **Total Minimum Test Count**: ≥ 253 verified test cases
