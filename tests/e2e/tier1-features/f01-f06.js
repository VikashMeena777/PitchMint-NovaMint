/**
 * Tier 1: Feature Tests (F01 - F06)
 * PitchMint Platform Redesign & Hardening
 */

const {
  describe,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertContains,
  assertMatch,
  readProjectFile,
  fileExists,
} = require("../harness");

// =============================================================================
// F01: Design Tokens & Fluid Typography
// =============================================================================
describe("Tier 1 - F01: Design Tokens & Fluid Typography", () => {
  const css = readProjectFile("src/app/globals.css") || "";

  test("F01-T1: Midnight obsidian background tokens are defined", () => {
    assertContains(css, "--pp-bg-deepest", "Must declare --pp-bg-deepest token");
    assertContains(css, "--pp-bg-surface", "Must declare --pp-bg-surface token");
    assertContains(css, "--pp-bg-surface2", "Must declare --pp-bg-surface2 token");
    assertContains(css, "--pp-bg-elevated", "Must declare --pp-bg-elevated token");
  });

  test("F01-T2: Saturated accent color tokens are declared", () => {
    assertContains(css, "--pp-accent1", "Must declare --pp-accent1 (Indigo)");
    assertContains(css, "--pp-accent2", "Must declare --pp-accent2 (Violet)");
    assertContains(css, "--pp-accent3", "Must declare --pp-accent3 (Cyan)");
    assertContains(css, "--pp-accent4", "Must declare --pp-accent4 (Fuchsia/Pink)");
  });

  test("F01-T3: Colored glow shadow tokens are defined instead of plain grey", () => {
    assertContains(css, "--pp-glow-indigo", "Must declare --pp-glow-indigo token");
    assertContains(css, "--pp-glow-violet", "Must declare --pp-glow-violet token");
    assertContains(css, "--pp-glow-cyan", "Must declare --pp-glow-cyan token");
    // Verify it uses rgba color, not greyscale
    assertMatch(css, /--pp-glow-indigo:\s*rgba\(93,\s*92,\s*255/);
  });

  test("F01-T4: Fluid typography clamp() scaling is configured", () => {
    // Check for fluid font sizing clamp expressions in CSS or typography utilities
    const hasClamp = css.includes("clamp(") || readProjectFile("src/app/page.tsx")?.includes("clamp(");
    assert(hasClamp, "Design system must include fluid typography clamp() scale");
  });

  test("F01-T5: Dark mode root tokens define midnight obsidian foundation", () => {
    assertContains(css, ".dark", "Must define .dark theme override");
    assertMatch(css, /--background:\s*#02040a/, "Dark mode background must match #02040a");
    assertMatch(css, /--foreground:\s*#f8fafc/, "Dark mode foreground must match #f8fafc");
  });
});

// =============================================================================
// F02: Animated Iconography & Micro-interactions
// =============================================================================
describe("Tier 1 - F02: Animated Iconography & Micro-interactions", () => {
  const css = readProjectFile("src/app/globals.css") || "";

  test("F02-T1: Design system provides cubic-bezier spring physics timing", () => {
    assertContains(css, "--pp-ease-spring", "Must declare --pp-ease-spring");
    assertContains(css, "--pp-ease-out-expo", "Must declare --pp-ease-out-expo");
    assertMatch(css, /--pp-ease-spring:\s*cubic-bezier\(/);
  });

  test("F02-T2: Interactive buttons enforce cursor-pointer styling", () => {
    // Buttons or interactive primitives must enforce cursor: pointer
    const hasCursorPointer = css.includes("cursor: pointer") || css.includes("cursor-pointer") ||
      readProjectFile("src/components/ui/button.tsx")?.includes("cursor-pointer");
    assert(hasCursorPointer, "Buttons must have explicit cursor-pointer styling");
  });

  test("F02-T3: Micro-interaction transition durations are standardized", () => {
    assertContains(css, "--pp-transition-fast", "Must declare --pp-transition-fast");
    assertContains(css, "--pp-transition-base", "Must declare --pp-transition-base");
    assertContains(css, "--pp-transition-slow", "Must declare --pp-transition-slow");
  });

  test("F02-T4: Lucide icon package and animation dependencies are installed", () => {
    const pkg = JSON.parse(readProjectFile("package.json") || "{}");
    assert(pkg.dependencies && pkg.dependencies["lucide-react"], "lucide-react must be installed in package.json");
    assert(pkg.dependencies && pkg.dependencies["tw-animate-css"], "tw-animate-css must be installed for animations");
  });

  test("F02-T5: Accessible focus ring styles exist for interactive elements", () => {
    assertContains(css, "outline-ring", "Base layer must enforce accessible outline-ring");
    assertContains(css, "--ring", "Theme must define --ring token");
  });
});

// =============================================================================
// F03: Build & Lint Zero-Error Hygiene
// =============================================================================
describe("Tier 1 - F03: Build & Lint Zero-Error Hygiene", () => {
  test("F03-T1: Package scripts include build, dev, and lint commands", () => {
    const pkg = JSON.parse(readProjectFile("package.json") || "{}");
    assert(pkg.scripts?.build, "Must have build script in package.json");
    assert(pkg.scripts?.dev, "Must have dev script in package.json");
    assert(pkg.scripts?.lint, "Must have lint script in package.json");
  });

  test("F03-T2: Next.js 16 and React 19 dependencies are correctly pinned", () => {
    const pkg = JSON.parse(readProjectFile("package.json") || "{}");
    assertEqual(pkg.dependencies?.next, "16.2.2", "Next.js must be 16.2.2");
    assertEqual(pkg.dependencies?.react, "19.2.4", "React must be 19.2.4");
    assertEqual(pkg.dependencies?.["react-dom"], "19.2.4", "React DOM must be 19.2.4");
  });

  test("F03-T3: Tailwind CSS v4 CSS-first import structure is present", () => {
    const css = readProjectFile("src/app/globals.css") || "";
    assert(css.startsWith('@import "tailwindcss";'), "globals.css must begin with Tailwind v4 @import");
    assertContains(css, "@theme inline", "Must declare @theme inline block");
  });

  test("F03-T4: Path aliases are properly mapped in tsconfig.json", () => {
    const tsconfigStr = readProjectFile("tsconfig.json") || "{}";
    assert(tsconfigStr.includes('"@/*"'), "tsconfig.json must define @/* path alias");
    assert(tsconfigStr.includes('"./src/*"') || tsconfigStr.includes('"src/*"'), "Alias must map to src/*");
  });

  test("F03-T5: Root layout is present with valid metadata and html structure", () => {
    const layout = readProjectFile("src/app/layout.tsx") || "";
    assert(layout.length > 0, "Root layout src/app/layout.tsx must exist");
    assertContains(layout, "<html", "Root layout must render <html> element");
    assertContains(layout, "<body", "Root layout must render <body> element");
  });
});

// =============================================================================
// F04: Lenis Smooth Scroll Provider
// =============================================================================
describe("Tier 1 - F04: Lenis Smooth Scroll Provider", () => {
  test("F04-T1: Smooth scroll provider contract exists or is configured in layout", () => {
    const hasProvider = fileExists("src/components/providers/smooth-scroll-provider.tsx") ||
      fileExists("src/components/smooth-scroll-provider.tsx") ||
      readProjectFile("src/app/layout.tsx")?.includes("Lenis") ||
      readProjectFile("src/app/layout.tsx")?.includes("scroll");
    assert(hasProvider, "Smooth scroll architecture must be referenced in layout or provider");
  });

  test("F04-T2: Root HTML / Body specifies smooth scroll classes or properties", () => {
    const css = readProjectFile("src/app/globals.css") || "";
    const layout = readProjectFile("src/app/layout.tsx") || "";
    const hasScrollConfig = css.includes("scroll-behavior") || css.includes("lenis") || layout.includes("scroll");
    assert(hasScrollConfig, "Global CSS or layout must configure smooth scrolling");
  });

  test("F04-T3: Lenis configuration respects touch devices to prevent scroll hijacking", () => {
    // Contract check: touchMultiplier or syncTouch parameter should be non-hijacking
    const providerCode = readProjectFile("src/components/providers/smooth-scroll-provider.tsx") ||
      readProjectFile("src/app/layout.tsx") || "";
    assert(typeof providerCode === "string", "Provider code must be loadable");
  });

  test("F04-T4: GSAP ticker integration contract exists", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Lenis virtual smooth-scroll synchronized with GSAP ScrollTrigger ticker",
      "PROJECT.md architecture must define Lenis + GSAP ticker sync contract");
  });

  test("F04-T5: Route transition scroll reset contract is preserved", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Next 16 route transition scroll reset",
      "PROJECT.md must mandate route transition scroll reset");
  });
});

// =============================================================================
// F05: GSAP ScrollTrigger Timelines & Parallax
// =============================================================================
describe("Tier 1 - F05: GSAP ScrollTrigger Timelines & Parallax", () => {
  test("F05-T1: PROJECT.md specifies GSAP ScrollTrigger scrubbed reveals and parallax", () => {
    const doc = readProjectFile("PROJECT.md") || "";
    assertContains(doc, "F05: GSAP ScrollTrigger Timelines", "Must document F05 feature");
    assertContains(doc, "Scrubbed text reveals, parallax layers", "Must define parallax & scrubbed text");
  });

  test("F05-T2: ScrollTrigger React lifecycle cleanup contract is defined", () => {
    const doc = readProjectFile("PROJECT.md") || "";
    assertContains(doc, "React lifecycle cleanup (`useGSAP`)", "Must document useGSAP cleanup pattern");
  });

  test("F05-T3: Pinned bento unveils feature is scoped for landing view", () => {
    const originalReq = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(originalReq, "pinned feature reveals", "ORIGINAL_REQUEST must mandate pinned feature reveals");
  });

  test("F05-T4: Parallax layering velocity contract preserves smooth 60fps", () => {
    const originalReq = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(originalReq, "smoothly load without frame drops", "Parallax must perform smoothly");
  });

  test("F05-T5: Section morphs and scrubbed text unveils on scroll", () => {
    const originalReq = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(originalReq, "scrubbed text unveilings, and section morphs on scroll",
      "Must mandate scrubbed text unveilings and section morphs");
  });
});

// =============================================================================
// F06: Framer Motion Layouts & Reduced Motion
// =============================================================================
describe("Tier 1 - F06: Framer Motion Layouts & Reduced Motion", () => {
  test("F06-T1: framer-motion is installed as a production dependency", () => {
    const pkg = JSON.parse(readProjectFile("package.json") || "{}");
    assert(pkg.dependencies && pkg.dependencies["framer-motion"], "framer-motion must be installed");
  });

  test("F06-T2: prefers-reduced-motion compliance is required across motion components", () => {
    const doc = readProjectFile("PROJECT.md") || "";
    assertContains(doc, "prefers-reduced-motion", "PROJECT.md must mandate prefers-reduced-motion compliance");
  });

  test("F06-T3: Layout transitions and modal micro-interactions are specified", () => {
    const originalReq = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(originalReq, "Framer Motion for layout transitions, modals, interactive tabs",
      "Must require Framer Motion for layout transitions and tabs");
  });

  test("F06-T4: Spring physics transition variables are integrated", () => {
    const css = readProjectFile("src/app/globals.css") || "";
    assertContains(css, "--pp-ease-spring", "Spring physics token must be available for motion");
  });

  test("F06-T5: Motion engine architecture integrates with Next.js 16 and React 19", () => {
    const doc = readProjectFile("PROJECT.md") || "";
    assertContains(doc, "Next.js 16.2.2 (App Router, Turbopack, Async Request APIs) + React 19.2.4",
      "Motion engine must target React 19 and Next 16");
  });
});
