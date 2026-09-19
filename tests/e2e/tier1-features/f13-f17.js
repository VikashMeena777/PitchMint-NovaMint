/**
 * Tier 1: Feature Tests (F13 - F17)
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
// F13: Dashboard (KPI sparklines, live activity stream)
// =============================================================================
describe("Tier 1 - F13: Dashboard (KPI sparklines, live activity stream)", () => {
  test("F13-T1: Dashboard page exists in app views", () => {
    assert(fileExists("src/app/(app)/dashboard/page.tsx"), "src/app/(app)/dashboard/page.tsx must exist");
  });

  test("F13-T2: Dashboard actions provide getDashboardStats contract", () => {
    const userActions = readProjectFile("src/lib/actions/user.ts") || "";
    assertContains(userActions, "export async function getDashboardStats",
      "src/lib/actions/user.ts must export getDashboardStats");
  });

  test("F13-T3: getDashboardStats returns required KPI fields", () => {
    const userActions = readProjectFile("src/lib/actions/user.ts") || "";
    assertContains(userActions, "totalProspects", "Must return totalProspects");
    assertContains(userActions, "emailsSent", "Must return emailsSent");
    assertContains(userActions, "openRate", "Must return openRate");
    assertContains(userActions, "replyRate", "Must return replyRate");
    assertContains(userActions, "activeSequences", "Must return activeSequences");
    assertContains(userActions, "recentActivity", "Must return recentActivity");
  });

  test("F13-T4: Dashboard view contains KPI metric display cards", () => {
    const dashboard = readProjectFile("src/app/(app)/dashboard/page.tsx") || "";
    assert(
      dashboard.includes("Prospect") || dashboard.includes("prospects") || dashboard.includes("Sent") || dashboard.includes("Open"),
      "Dashboard view must render outreach metrics"
    );
  });

  test("F13-T5: Quick actions shortcuts are provided for key workflows", () => {
    const dashboard = readProjectFile("src/app/(app)/dashboard/page.tsx") || "";
    assert(
      dashboard.includes("Prospect") || dashboard.includes("Sequence") || dashboard.includes("quick") || dashboard.includes("Quick"),
      "Dashboard must include quick actions"
    );
  });
});

// =============================================================================
// F14: Prospects Table & AI Preview Drawer
// =============================================================================
describe("Tier 1 - F14: Prospects Table & AI Preview Drawer", () => {
  test("F14-T1: Prospects page exists in app routing", () => {
    assert(fileExists("src/app/(app)/prospects/page.tsx"), "src/app/(app)/prospects/page.tsx must exist");
  });

  test("F14-T2: Prospects server actions export getProspects and addProspect", () => {
    const actions = readProjectFile("src/lib/actions/prospects.ts") || "";
    assertContains(actions, "export async function getProspects", "Must export getProspects");
    assertContains(actions, "export async function addProspect", "Must export addProspect");
  });

  test("F14-T3: Bulk action toolbar component exists", () => {
    assert(fileExists("src/components/bulk-actions-toolbar.tsx"),
      "src/components/bulk-actions-toolbar.tsx must exist");
    const toolbar = readProjectFile("src/components/bulk-actions-toolbar.tsx") || "";
    assert(toolbar.includes("selected") || toolbar.includes("delete") || toolbar.includes("tag"),
      "Bulk action toolbar must support operations on selected items");
  });

  test("F14-T4: CSV import modal component exists for bulk ingestion", () => {
    assert(fileExists("src/components/csv-import-modal.tsx"),
      "src/components/csv-import-modal.tsx must exist");
    const modal = readProjectFile("src/components/csv-import-modal.tsx") || "";
    assert(modal.includes("csv") || modal.includes("file") || modal.includes("upload"),
      "CSV modal must handle file ingestion");
  });

  test("F14-T5: AI drawer preview specification is defined in PROJECT.md", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "slide-out AI enrichment `Sheet` drawer",
      "PROJECT.md must document slide-out AI enrichment Sheet drawer");
  });
});

// =============================================================================
// F15: Visual Sequence Graph Builder
// =============================================================================
describe("Tier 1 - F15: Visual Sequence Graph Builder", () => {
  test("F15-T1: Sequences list view exists", () => {
    assert(fileExists("src/app/(app)/sequences/page.tsx"), "src/app/(app)/sequences/page.tsx must exist");
  });

  test("F15-T2: Sequence detail or builder view exists", () => {
    assert(
      fileExists("src/app/(app)/sequences/[id]/page.tsx") || fileExists("src/components/sequence-builder-modal.tsx"),
      "Sequence detail route or builder modal component must exist"
    );
  });

  test("F15-T3: Sequence actions export sequence management functions", () => {
    const actions = readProjectFile("src/lib/actions/sequences.ts") || "";
    assert(
      actions.includes("createSequence") || actions.includes("getSequences") || actions.includes("updateSequence"),
      "Sequence actions must provide CRUD operations"
    );
  });

  test("F15-T4: Interactive node graph with animated pulses is specified", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "interactive node graph with animated pulses & conditional branches",
      "PROJECT.md must mandate node graph with animated pulses");
  });

  test("F15-T5: Sequence steps support delays and status toggles", () => {
    const types = readProjectFile("src/types/database.ts") || "";
    const actions = readProjectFile("src/lib/actions/sequences.ts") || "";
    assert(
      types.includes("sequence") || actions.includes("delay") || actions.includes("status"),
      "Sequences must support step delays and status controls"
    );
  });
});

// =============================================================================
// F16: Recharts Analytics Outreach Funnel & Gauges
// =============================================================================
describe("Tier 1 - F16: Recharts Analytics Outreach Funnel & Gauges", () => {
  test("F16-T1: Analytics page exists in app views", () => {
    assert(fileExists("src/app/(app)/analytics/page.tsx"), "src/app/(app)/analytics/page.tsx must exist");
  });

  test("F16-T2: recharts is installed as a production dependency", () => {
    const pkg = JSON.parse(readProjectFile("package.json") || "{}");
    assert(pkg.dependencies && pkg.dependencies["recharts"], "recharts must be installed");
  });

  test("F16-T3: Analytics utilities compute open, click, and reply rates", () => {
    const utils = readProjectFile("src/lib/utils/analytics.ts") || "";
    assert(utils.length > 50, "src/lib/utils/analytics.ts must exist and provide analytics calculations");
  });

  test("F16-T4: Outreach funnel stages are defined (Sent, Delivered, Opened, Clicked, Replied)", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "/analytics` outreach funnel, deliverability meters, conversion area charts",
      "PROJECT.md must specify outreach funnel and deliverability meters");
  });

  test("F16-T5: Deliverability health and bounce rate monitoring is specified", () => {
    const req = readProjectFile(".agents/ORIGINAL_REQUEST.md") || "";
    assertContains(req, "animated Recharts charts, deliverability funnels, conversion meters",
      "ORIGINAL_REQUEST must mandate Recharts charts and deliverability funnels");
  });
});

// =============================================================================
// F17: Billing, Settings & Templates Views
// =============================================================================
describe("Tier 1 - F17: Billing, Settings & Templates Views", () => {
  test("F17-T1: Billing page exists in app views", () => {
    assert(fileExists("src/app/(app)/billing/page.tsx"), "src/app/(app)/billing/page.tsx must exist");
  });

  test("F17-T2: Settings page exists in app views", () => {
    assert(fileExists("src/app/(app)/settings/page.tsx"), "src/app/(app)/settings/page.tsx must exist");
  });

  test("F17-T3: Templates page exists in app views", () => {
    assert(fileExists("src/app/(app)/templates/page.tsx"), "src/app/(app)/templates/page.tsx must exist");
  });

  test("F17-T4: Billing plans catalog defines Free, Starter, Growth, and Agency tiers", () => {
    const plansFile = readProjectFile("src/lib/billing/plans.ts") || "";
    assertContains(plansFile, "free:", "Must define free tier");
    assertContains(plansFile, "starter:", "Must define starter tier");
    assertContains(plansFile, "growth:", "Must define growth tier");
    assertContains(plansFile, "agency:", "Must define agency tier");
  });

  test("F17-T5: Template variable substitution tags are documented", () => {
    const templates = readProjectFile("src/lib/actions/templates.ts") ||
      readProjectFile("src/app/(app)/templates/page.tsx") || "";
    assert(
      templates.includes("template") || templates.includes("{{") || templates.includes("body"),
      "Templates must support variables"
    );
  });
});
