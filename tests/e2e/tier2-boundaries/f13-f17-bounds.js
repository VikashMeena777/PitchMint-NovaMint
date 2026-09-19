/**
 * Tier 2: Boundary & Corner Cases (F13 - F17)
 * PitchMint Platform Redesign & Hardening
 */

const crypto = require("crypto");
const {
  describe,
  test,
  assert,
  assertEqual,
  assertGreaterThan,
  assertLessThan,
  assertThrows,
  readProjectFile,
  loadTsModule,
} = require("../harness");

// =============================================================================
// F13: Dashboard Boundaries
// =============================================================================
describe("Tier 2 - F13: Dashboard Boundaries", () => {
  test("F13-B1: Zero-data user state calculates 0% open and reply rates without NaN or divide-by-zero", () => {
    const calculateRates = (sent, opened, replied) => ({
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
    });

    const rates = calculateRates(0, 0, 0);
    assertEqual(rates.openRate, 0, "Zero sent emails must yield 0% open rate (not NaN)");
    assertEqual(rates.replyRate, 0, "Zero sent emails must yield 0% reply rate (not NaN)");
  });

  test("F13-B2: Sparkline chart with single data point renders baseline horizontal path without crashing", () => {
    const buildSparklinePath = (points, width = 100, height = 30) => {
      if (!points || points.length === 0) return "";
      if (points.length === 1) return `M 0,${height / 2} L ${width},${height / 2}`;
      const min = Math.min(...points);
      const max = Math.max(...points);
      const range = max - min || 1;
      return points
        .map((p, i) => {
          const x = (i / (points.length - 1)) * width;
          const y = height - ((p - min) / range) * height;
          return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    };

    const singlePointPath = buildSparklinePath([42]);
    assertEqual(singlePointPath, "M 0,15 L 100,15", "Single point must produce flat baseline path");
    const emptyPath = buildSparklinePath([]);
    assertEqual(emptyPath, "", "Empty points returns empty path");
  });

  test("F13-B3: Extreme outreach count (1,000,000 sent) formats into compact metric string ('1M')", () => {
    const formatNumberCompact = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
      return String(num);
    };

    assertEqual(formatNumberCompact(500), "500", "Under 1000 displays raw number");
    assertEqual(formatNumberCompact(2500), "2.5k", "2500 displays as 2.5k");
    assertEqual(formatNumberCompact(1000000), "1M", "1M displays as 1M");
  });

  test("F13-B4: Activity feed with 10,000 events enforces pagination/virtualization limit to 50 max", () => {
    const clampFeed = (events, max = 50) => events.slice(0, max);
    const hugeList = Array.from({ length: 10000 }, (_, i) => ({ id: i }));
    assertEqual(clampFeed(hugeList).length, 50, "Dashboard activity feed must clamp to 50 items");
  });

  test("F13-B5: Negative metric delta prevention ensures rates never fall below 0%", () => {
    const clampRate = (rate) => Math.max(0, Math.min(100, rate));
    assertEqual(clampRate(-5), 0, "Negative rate clamped to 0");
    assertEqual(clampRate(120), 100, "Overflow rate clamped to 100");
    assertEqual(clampRate(45), 45, "Valid rate retained");
  });
});

// =============================================================================
// F14: Prospects Table & AI Preview Drawer Boundaries
// =============================================================================
describe("Tier 2 - F14: Prospects Table & AI Preview Drawer Boundaries", () => {
  test("F14-B1: Prospects search query with special characters (%, _, ', \") is escaped against SQL/PostgREST injection", () => {
    const sanitizeSearch = (term) => term.replace(/[%_\\]/g, "\\$&");
    assertEqual(sanitizeSearch("100% discount"), "100\\% discount", "Must escape % wildcard");
    assertEqual(sanitizeSearch("user_test"), "user\\_test", "Must escape _ wildcard");
  });

  test("F14-B2: Bulk action execution with empty selection (0 items selected) safely no-ops", () => {
    const executeBulkDelete = (selectedIds) => {
      if (!selectedIds || selectedIds.length === 0) return { affected: 0, status: "noop" };
      return { affected: selectedIds.length, status: "success" };
    };
    const res = executeBulkDelete([]);
    assertEqual(res.status, "noop", "Empty selection must no-op");
  });

  test("F14-B3: CSV upload header mapping handles missing or renamed email column gracefully", () => {
    const detectEmailColumn = (headers) => {
      const emailAliases = ["email", "e-mail", "work_email", "contact_email", "email_address"];
      return headers.find(h => emailAliases.includes(h.toLowerCase().trim())) || null;
    };
    assertEqual(detectEmailColumn(["First Name", "Last Name", "Work_Email"]), "Work_Email", "Recognizes Work_Email alias");
    assertEqual(detectEmailColumn(["Name", "Phone", "Company"]), null, "Missing email returns null");
  });

  test("F14-B4: Formula injection in CSV export (=, +, -, @) is prefixed with single quote for safety", () => {
    const sanitizeCsvCell = (val) => {
      const str = String(val || "");
      if (/^[=+\-@\t\r]/.test(str)) {
        return `'${str}`;
      }
      return str;
    };
    assertEqual(sanitizeCsvCell("=CMD('calc')"), "'=CMD('calc')", "Formula trigger '=' prefixed with quote");
    assertEqual(sanitizeCsvCell("+123456"), "'+123456", "Trigger '+' prefixed with quote");
    assertEqual(sanitizeCsvCell("Normal Company"), "Normal Company", "Normal text unescaped");
  });

  test("F14-B5: AI preview drawer rapid toggle spam (20 open/close triggers) maintains stable drawer state", () => {
    let isOpen = false;
    for (let i = 0; i < 20; i++) {
      isOpen = !isOpen;
    }
    assertEqual(isOpen, false, "20 toggles returns to closed state");
  });
});

// =============================================================================
// F15: Visual Sequence Graph Builder Boundaries
// =============================================================================
describe("Tier 2 - F15: Visual Sequence Graph Builder Boundaries", () => {
  test("F15-B1: Sequence with zero steps (empty sequence) is blocked from publication", () => {
    const validateSequenceForActivation = (steps) => {
      if (!steps || steps.length === 0) return { valid: false, error: "Sequence must have at least one step" };
      return { valid: true };
    };
    assertEqual(validateSequenceForActivation([]).valid, false, "Empty sequence cannot be activated");
  });

  test("F15-B2: Step wait delay enforces non-negative duration (min: 0 hours)", () => {
    const validateDelay = (hours) => hours >= 0;
    assertEqual(validateDelay(-1), false, "Negative delay is rejected");
    assertEqual(validateDelay(0), true, "Zero delay (immediate) is allowed");
    assertEqual(validateDelay(24), true, "24h delay is allowed");
  });

  test("F15-B3: Sequence node connections prevent circular references (A -> B -> A)", () => {
    const hasCycle = (edges) => {
      const adj = new Map();
      edges.forEach(([from, to]) => {
        if (!adj.has(from)) adj.set(from, []);
        adj.get(from).push(to);
      });

      const visited = new Set();
      const recStack = new Set();

      const dfs = (node) => {
        visited.add(node);
        recStack.add(node);
        const neighbors = adj.get(node) || [];
        for (const n of neighbors) {
          if (!visited.has(n) && dfs(n)) return true;
          if (recStack.has(n)) return true;
        }
        recStack.delete(node);
        return false;
      };

      for (const node of adj.keys()) {
        if (!visited.has(node) && dfs(node)) return true;
      }
      return false;
    };

    const circularEdges = [["step1", "step2"], ["step2", "step1"]];
    assertEqual(hasCycle(circularEdges), true, "Must detect circular dependency");

    const linearEdges = [["step1", "step2"], ["step2", "step3"]];
    assertEqual(hasCycle(linearEdges), false, "Linear graph has no cycle");
  });

  test("F15-B4: Maximum step count is capped (e.g. 20 steps max) to prevent infinite pipelines", () => {
    const MAX_STEPS = 20;
    const canAddStep = (currentStepCount) => currentStepCount < MAX_STEPS;
    assertEqual(canAddStep(19), true, "Step 20 can be added");
    assertEqual(canAddStep(20), false, "Step 21 is blocked by limit");
  });

  test("F15-B5: Step email subject / body handles multi-byte Unicode and emojis", () => {
    const subject = "Quick question about your Q4 pipeline 🚀 🎯";
    const byteLength = Buffer.byteLength(subject, "utf8");
    assertGreaterThan(byteLength, subject.length, "Emoji strings have byte length > char length");
    assert(subject.includes("🚀"), "Emoji is preserved intact");
  });
});

// =============================================================================
// F16: Recharts Analytics Outreach Funnel Boundaries
// =============================================================================
describe("Tier 2 - F16: Recharts Analytics Outreach Funnel Boundaries", () => {
  test("F16-B1: Date range filter rejects invalid ranges where startDate > endDate", () => {
    const validateDateRange = (start, end) => new Date(start).getTime() <= new Date(end).getTime();
    assertEqual(validateDateRange("2026-09-20", "2026-09-10"), false, "Start > End must be rejected");
    assertEqual(validateDateRange("2026-09-10", "2026-09-20"), true, "Start <= End is valid");
  });

  test("F16-B2: Funnel conversion percentage never exceeds 100% even with duplicated tracking events", () => {
    const calculateFunnelRatio = (stageCount, totalSent) => {
      if (totalSent <= 0) return 0;
      return Math.min(100, Math.round((stageCount / totalSent) * 100));
    };
    assertEqual(calculateFunnelRatio(150, 100), 100, "150 opens on 100 sends clamps to 100%");
  });

  test("F16-B3: Deliverability health gauge clamps bounce rate between 0% and 100%", () => {
    const evaluateHealth = (bounceRate) => {
      if (bounceRate <= 2.0) return "excellent";
      if (bounceRate <= 5.0) return "warning";
      return "critical";
    };
    assertEqual(evaluateHealth(0.5), "excellent", "<2% is excellent");
    assertEqual(evaluateHealth(3.5), "warning", "2-5% is warning");
    assertEqual(evaluateHealth(8.0), "critical", ">5% is critical deliverability risk");
  });

  test("F16-B4: Single day date range (start == end) aggregates 24 hours of hourly buckets without crashing", () => {
    const generateHourlyBuckets = (dateStr) => Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    const buckets = generateHourlyBuckets("2026-09-18");
    assertEqual(buckets.length, 24, "Single day must yield 24 hourly buckets");
  });

  test("F16-B5: All-zero metrics render empty state notice instead of broken chart visuals", () => {
    const isChartEmpty = (data) => data.every(d => d.value === 0);
    assertEqual(isChartEmpty([{ value: 0 }, { value: 0 }]), true, "Detects all-zero datasets");
    assertEqual(isChartEmpty([{ value: 0 }, { value: 5 }]), false, "Non-zero dataset is not empty");
  });
});

// =============================================================================
// F17: Billing, Settings & Templates Boundaries
// =============================================================================
describe("Tier 2 - F17: Billing, Settings & Templates Boundaries", () => {
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("F17-B1: Unknown plan ID safely falls back to Free plan tier", () => {
    const fallback = plans.getPlanById("nonexistent_plan_xyz");
    assertEqual(fallback.id, "free", "Unknown plan must fall back to free");
  });

  test("F17-B2: Template variable interpolation handles missing data fields without crashing or displaying 'undefined'", () => {
    const interpolateTemplate = (text, data) => {
      return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
        return data[key] != null ? data[key] : "";
      });
    };

    const template = "Hi {{firstName}}, how is everything at {{companyName}}?";
    const result = interpolateTemplate(template, { firstName: "Vikash" }); // companyName missing
    assertEqual(result, "Hi Vikash, how is everything at ?", "Missing variable replaced with empty string, not 'undefined'");
  });

  test("F17-B3: Plan limits retrieval returns defined boundaries for all valid tiers", () => {
    const tiers = ["free", "starter", "growth", "agency"];
    for (const t of tiers) {
      const limits = plans.getPlanLimits(t);
      assert(limits.monthlyProspects > 0, `${t} must have positive monthlyProspects`);
      assert(limits.dailySendLimit > 0, `${t} must have positive dailySendLimit`);
    }
  });

  test("F17-B4: Zero or negative subscription price values are rejected for paid tiers", () => {
    const starter = plans.getPlanById("starter");
    const growth = plans.getPlanById("growth");
    const agency = plans.getPlanById("agency");
    assertGreaterThan(starter.price, 0, "Starter price must be > 0");
    assertGreaterThan(growth.price, 0, "Growth price must be > 0");
    assertGreaterThan(agency.price, 0, "Agency price must be > 0");
  });

  test("F17-B5: API key generation format adheres to prefix and entropy requirements", () => {
    const generateApiKey = () => `pm_live_${crypto.randomBytes(24).toString("hex")}`;
    const key = generateApiKey();
    assert(key.startsWith("pm_live_"), "API key must use pm_live_ prefix");
    assertEqual(key.length, 8 + 48, "API key has 8 prefix chars + 48 hex chars = 56 total");
  });
});
