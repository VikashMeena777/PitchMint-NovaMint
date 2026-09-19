#!/usr/bin/env node
/**
 * PitchMint E2E Test Suite Runner
 * 
 * Invocation: `node tests/e2e/runner.js`
 * Covers Tiers 1 through 4 (253 verified test cases across features F01-F22 and scenarios S01-S11).
 */

const path = require("path");
const harness = require("./harness");

// Ensure clean environment variables for test execution
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
}
if (!process.env.CASHFREE_WEBHOOK_SECRET) {
  process.env.CASHFREE_WEBHOOK_SECRET = "default_test_cashfree_webhook_secret_key";
}

// -----------------------------------------------------------------------------
// Load All Test Suites
// -----------------------------------------------------------------------------
console.log("===============================================================================");
console.log("             PitchMint E2E Test Suite: Platform Redesign & Hardening            ");
console.log("===============================================================================\n");
console.log("Loading test suites across Tiers 1-5...\n");

// Tier 1: Feature Coverage (F01 - F22, 110 tests)
require("./tier1-features/f01-f06");
require("./tier1-features/f07-f12");
require("./tier1-features/f13-f17");
require("./tier1-features/f18-f22");

// Tier 2: Boundary & Corner Cases (F01 - F22, 110 tests)
require("./tier2-boundaries/f01-f06-bounds");
require("./tier2-boundaries/f07-f12-bounds");
require("./tier2-boundaries/f13-f17-bounds");
require("./tier2-boundaries/f18-f22-bounds");

// Tier 3: Cross-Feature Pairwise Interactions (22 tests)
require("./tier3-pairwise/pairwise-matrix");

// Tier 4: Real-World Application Scenarios (11 journeys)
require("./tier4-scenarios/tier4-scenarios");

// Tier 5: Adversarial Stress & Hardening (26 tests)
require("./tier5-adversarial/adversarial-stress");

// -----------------------------------------------------------------------------
// Execute Test Runner
// -----------------------------------------------------------------------------
async function main() {
  const results = await harness.runAllSuites();

  // Tier groupings
  const tierStats = {
    tier1: { name: "Tier 1: Feature Coverage (F01-F22)", total: 0, passed: 0, failed: 0, skipped: 0 },
    tier2: { name: "Tier 2: Boundary & Corner Cases (F01-F22)", total: 0, passed: 0, failed: 0, skipped: 0 },
    tier3: { name: "Tier 3: Cross-Feature Combinations", total: 0, passed: 0, failed: 0, skipped: 0 },
    tier4: { name: "Tier 4: Real-World Scenarios (S01-S11)", total: 0, passed: 0, failed: 0, skipped: 0 },
    tier5: { name: "Tier 5: Adversarial Stress & Hardening", total: 0, passed: 0, failed: 0, skipped: 0 },
  };

  results.suites.forEach((suite) => {
    let targetTier = tierStats.tier1;
    if (suite.name.startsWith("Tier 2")) targetTier = tierStats.tier2;
    else if (suite.name.startsWith("Tier 3")) targetTier = tierStats.tier3;
    else if (suite.name.startsWith("Tier 4")) targetTier = tierStats.tier4;
    else if (suite.name.startsWith("Tier 5")) targetTier = tierStats.tier5;

    const suiteTotal = suite.passed + suite.failed + suite.skipped;
    targetTier.total += suiteTotal;
    targetTier.passed += suite.passed;
    targetTier.failed += suite.failed;
    targetTier.skipped += suite.skipped;

    const statusMark = suite.failed === 0 ? "✓" : "✗";
    console.log(`  [${statusMark}] ${suite.name} (${suite.passed}/${suiteTotal} passed, ${suite.durationMs}ms)`);

    if (suite.failed > 0) {
      suite.tests
        .filter((t) => t.status === "failed")
        .forEach((t) => {
          console.error(`      FAIL: ${t.name}`);
          console.error(`        ${t.error}`);
        });
    }
  });

  console.log("\n-------------------------------------------------------------------------------");
  console.log(" Tier Breakdown Summary:");
  console.log("-------------------------------------------------------------------------------");
  Object.values(tierStats).forEach((tier) => {
    const status = tier.failed === 0 ? "PASS" : "FAIL";
    console.log(
      `  • ${tier.name.padEnd(48)}: ${String(tier.passed).padStart(3)} / ${String(tier.total).padStart(3)} [${status}]`
    );
  });

  console.log("-------------------------------------------------------------------------------");
  console.log(` Total Test Cases Executed: ${results.total}`);
  console.log(` Passed:                    ${results.passed}`);
  console.log(` Failed:                    ${results.failed}`);
  console.log(` Skipped:                   ${results.skipped}`);
  console.log(` Execution Time:            ${results.durationMs}ms`);
  console.log("===============================================================================");

  if (results.failed > 0) {
    console.error(`\nTest suite execution completed with ${results.failed} failure(s).\n`);
    process.exit(1);
  } else {
    console.log(`\nALL ${results.passed} TESTS PASSED SUCCESSFULLY! (Zero Failures)\n`);
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal runner error:", err);
    process.exit(1);
  });
}

module.exports = { main };
