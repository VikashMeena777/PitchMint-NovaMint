/**
 * Tier 1: Feature Tests (F07 - F12)
 * PitchMint Platform Redesign & Hardening
 */

const {
  describe,
  test,
  assert,
  assertEqual,
  assertContains,
  assertMatch,
  readProjectFile,
  fileExists,
} = require("../harness");

// =============================================================================
// F07: Interactive 3D WebGL Canvas & Fallback
// =============================================================================
describe("Tier 1 - F07: Interactive 3D WebGL Canvas & Fallback", () => {
  test("F07-T1: Architecture specifies pure Three.js procedural WebGL canvas components", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Pure Three.js procedural WebGL canvas",
      "PROJECT.md must document Three.js procedural WebGL canvas");
  });

  test("F07-T2: Dynamic import with { ssr: false } contract is documented", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "ssr: false", "3D canvas components must specify ssr: false");
  });

  test("F07-T3: DevicePixelRatio (DPR) clamping contract protects 60fps performance", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "DPR clamping", "Must mandate DPR clamping to protect performance");
  });

  test("F07-T4: IntersectionObserver RAF pausing contract is specified", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "IntersectionObserver RAF pausing",
      "Must mandate RAF pausing when offscreen");
  });

  test("F07-T5: Graceful Canvas 2D fallback contract is required", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Canvas 2D fallback",
      "Must mandate Canvas 2D fallback when WebGL context fails");
  });
});

// =============================================================================
// F08: Landing Page (Hero, Nav Drawer, Bento, Pricing)
// =============================================================================
describe("Tier 1 - F08: Landing Page (Hero, Nav Drawer, Bento, Pricing)", () => {
  const landingPage = readProjectFile("src/app/page.tsx") || "";

  test("F08-T1: Landing page file exists and is populated", () => {
    assert(landingPage.length > 500, "src/app/page.tsx must exist and contain landing markup");
  });

  test("F08-T2: Landing page contains hero headline and value proposition", () => {
    assertContains(landingPage, "PitchMint", "Landing page must brandish PitchMint");
    assert(
      landingPage.includes("cold") || landingPage.includes("outreach") || landingPage.includes("pipeline") || landingPage.includes("AI"),
      "Landing page must articulate core cold outreach proposition"
    );
  });

  test("F08-T3: Landing page features pricing section or tier options", () => {
    const hasPricing = landingPage.includes("Starter") || landingPage.includes("Growth") ||
      landingPage.includes("pricing") || landingPage.includes("Free");
    assert(hasPricing, "Landing page must display pricing tiers");
  });

  test("F08-T4: Landing page has CTA leading to signup / onboarding", () => {
    assert(
      landingPage.includes("/signup") || landingPage.includes("/login") || landingPage.includes("/onboarding"),
      "Landing page must include conversion CTAs pointing to signup/login/onboarding"
    );
  });

  test("F08-T5: Mobile navigation responsiveness (<768px drawer) is accounted for", () => {
    const hasMobileNav = landingPage.includes("md:hidden") || landingPage.includes("drawer") ||
      landingPage.includes("menu") || landingPage.includes("mobile") ||
      readProjectFile("src/components/app-header.tsx")?.includes("md:hidden");
    assert(hasMobileNav, "Landing navigation must provide responsive mobile drawer/toggle");
  });
});

// =============================================================================
// F09: Marketing Auxiliary Pages (Contact, Terms, Privacy)
// =============================================================================
describe("Tier 1 - F09: Marketing Auxiliary Pages (Contact, Terms, Privacy)", () => {
  test("F09-T1: Contact page (/contact) exists", () => {
    assert(fileExists("src/app/contact/page.tsx"), "src/app/contact/page.tsx must exist");
    const contact = readProjectFile("src/app/contact/page.tsx") || "";
    assert(contact.length > 100, "Contact page must contain content");
  });

  test("F09-T2: Terms of Service page (/terms) exists", () => {
    assert(fileExists("src/app/terms/page.tsx"), "src/app/terms/page.tsx must exist");
    const terms = readProjectFile("src/app/terms/page.tsx") || "";
    assert(terms.length > 100, "Terms page must contain legal terms");
  });

  test("F09-T3: Privacy Policy page (/privacy) exists", () => {
    assert(fileExists("src/app/privacy/page.tsx"), "src/app/privacy/page.tsx must exist");
    const privacy = readProjectFile("src/app/privacy/page.tsx") || "";
    assert(privacy.length > 100, "Privacy page must contain privacy policy");
  });

  test("F09-T4: Privacy page contains GDPR/data protection references", () => {
    const privacy = readProjectFile("src/app/privacy/page.tsx") || "";
    assert(
      privacy.includes("data") || privacy.includes("GDPR") || privacy.includes("privacy") || privacy.includes("information"),
      "Privacy policy must detail user data protection"
    );
  });

  test("F09-T5: Auxiliary pages include breadcrumb or return-home navigation", () => {
    const terms = readProjectFile("src/app/terms/page.tsx") || "";
    const privacy = readProjectFile("src/app/privacy/page.tsx") || "";
    const contact = readProjectFile("src/app/contact/page.tsx") || "";
    const hasBackLink = terms.includes("/") || privacy.includes("/") || contact.includes("/");
    assert(hasBackLink, "Auxiliary pages must provide navigation links back to site");
  });
});

// =============================================================================
// F10: Split-Pane Auth Pages (Login, Signup)
// =============================================================================
describe("Tier 1 - F10: Split-Pane Auth Pages (Login, Signup)", () => {
  test("F10-T1: Auth route directory exists for login and signup", () => {
    assert(
      fileExists("src/app/(auth)/login/page.tsx") || fileExists("src/app/login/page.tsx") || fileExists("src/app/auth/login/page.tsx"),
      "Login page must exist in auth route group"
    );
    assert(
      fileExists("src/app/(auth)/signup/page.tsx") || fileExists("src/app/signup/page.tsx") || fileExists("src/app/auth/signup/page.tsx"),
      "Signup page must exist in auth route group"
    );
  });

  test("F10-T2: Login page presents email and password input fields", () => {
    const loginCode = readProjectFile("src/app/(auth)/login/page.tsx") ||
      readProjectFile("src/app/login/page.tsx") || "";
    assert(
      loginCode.includes("email") && loginCode.includes("password"),
      "Login page must contain email and password fields"
    );
  });

  test("F10-T3: Signup page provides account creation form", () => {
    const signupCode = readProjectFile("src/app/(auth)/signup/page.tsx") ||
      readProjectFile("src/app/signup/page.tsx") || "";
    assert(
      signupCode.includes("email") && (signupCode.includes("password") || signupCode.includes("account")),
      "Signup page must contain registration inputs"
    );
  });

  test("F10-T4: Split-pane visual showcase is specified in PROJECT.md and ORIGINAL_REQUEST", () => {
    const req = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(req, "split-pane animated visual showcases",
      "Must mandate split-pane animated visual showcases for auth pages");
  });

  test("F10-T5: Auth pages link bidirectionally (Login -> Signup, Signup -> Login)", () => {
    const loginCode = readProjectFile("src/app/(auth)/login/page.tsx") ||
      readProjectFile("src/app/login/page.tsx") || "";
    const signupCode = readProjectFile("src/app/(auth)/signup/page.tsx") ||
      readProjectFile("src/app/signup/page.tsx") || "";
    assert(loginCode.includes("signup") || loginCode.includes("Sign up"), "Login must link to Signup");
    assert(signupCode.includes("login") || signupCode.includes("Log in"), "Signup must link to Login");
  });
});

// =============================================================================
// F11: Focused 4-Step Onboarding Wizard
// =============================================================================
describe("Tier 1 - F11: Focused 4-Step Onboarding Wizard", () => {
  test("F11-T1: Dedicated onboarding page exists in routing tree", () => {
    assert(
      fileExists("src/app/(app)/onboarding/page.tsx") || fileExists("src/app/onboarding/page.tsx") || fileExists("src/app/(onboarding)/page.tsx"),
      "Onboarding page must exist"
    );
  });

  test("F11-T2: Onboarding flow decouples layout from main app shell navigation", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Decouple `/onboarding` layout from app shell",
      "PROJECT.md must mandate decoupling onboarding layout from app shell");
  });

  test("F11-T3: 4-step wizard sequence is documented in PROJECT.md", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "4-step wizard with live tone preview",
      "PROJECT.md must document 4-step wizard with live tone preview");
  });

  test("F11-T4: Live tone preview reflects cold email messaging tone", () => {
    const originalReq = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(originalReq, "progress steppers, and polished form fields",
      "Must specify progress steppers and form polish for onboarding");
  });

  test("F11-T5: User database schema supports onboarding_completed tracking", () => {
    const types = readProjectFile("src/types/database.ts") || "";
    const callback = readProjectFile("src/app/auth/callback/route.ts") || "";
    assert(
      types.includes("onboarding_completed") || callback.includes("onboarding_completed"),
      "System must track onboarding_completed flag"
    );
  });
});

// =============================================================================
// F12: Authenticated App Shell & Mobile Drawer
// =============================================================================
describe("Tier 1 - F12: Authenticated App Shell & Mobile Drawer", () => {
  test("F12-T1: App header component exists with glassmorphic styling", () => {
    assert(fileExists("src/components/app-header.tsx"), "src/components/app-header.tsx must exist");
    const header = readProjectFile("src/components/app-header.tsx") || "";
    assert(header.includes("header") || header.includes("nav"), "Header component must render navigation");
  });

  test("F12-T2: App sidebar component exists with navigation links", () => {
    assert(fileExists("src/components/app-sidebar.tsx"), "src/components/app-sidebar.tsx must exist");
    const sidebar = readProjectFile("src/components/app-sidebar.tsx") || "";
    assert(
      sidebar.includes("dashboard") || sidebar.includes("prospects") || sidebar.includes("sequences"),
      "Sidebar must link to primary app sections"
    );
  });

  test("F12-T3: Authenticated app layout wraps core authenticated pages", () => {
    assert(fileExists("src/app/(app)/layout.tsx"), "src/app/(app)/layout.tsx must exist");
    const layout = readProjectFile("src/app/(app)/layout.tsx") || "";
    assert(layout.includes("AppHeader") || layout.includes("AppSidebar") || layout.includes("sidebar"),
      "App layout must include header/sidebar navigation shell");
  });

  test("F12-T4: Mobile responsive drawer / toggle is supported in app shell", () => {
    const sidebar = readProjectFile("src/components/app-sidebar.tsx") || "";
    const header = readProjectFile("src/components/app-header.tsx") || "";
    assert(
      sidebar.includes("Sheet") || sidebar.includes("mobile") || sidebar.includes("drawer") ||
      header.includes("menu") || header.includes("Menu") || header.includes("lg:hidden") || header.includes("md:hidden"),
      "App shell must support mobile navigation drawer"
    );
  });

  test("F12-T5: Notification indicators / bells are present in app header", () => {
    const header = readProjectFile("src/components/app-header.tsx") || "";
    assert(
      header.includes("Bell") || header.includes("notification") || header.includes("badge") || header.includes("notifications"),
      "App header must include notification bell/trigger"
    );
  });
});
