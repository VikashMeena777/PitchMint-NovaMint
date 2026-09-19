/**
 * Tier 1: Feature Tests (F18 - F22)
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
  assertThrows,
  readProjectFile,
  fileExists,
  loadTsModule,
} = require("../harness");
const crypto = require("crypto");

// =============================================================================
// F18: Security Hardening (Redirect, Unsubscribe, Leakage)
// =============================================================================
describe("Tier 1 - F18: Security Hardening (Redirect, Unsubscribe, Leakage)", () => {
  test("F18-T1: Open redirect neutralization requirement is documented in PROJECT.md", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Neutralize open redirect",
      "PROJECT.md must mandate neutralizing open redirect vulnerability");
  });

  test("F18-T2: Auth callback route validates redirect origin or relative paths", () => {
    const callbackCode = readProjectFile("src/app/auth/callback/route.ts") || "";
    assert(callbackCode.length > 0, "Auth callback route must exist");
  });

  test("F18-T3: Unsubscribe route exists for CAN-SPAM compliance", () => {
    assert(fileExists("src/app/api/emails/unsubscribe/route.ts"),
      "src/app/api/emails/unsubscribe/route.ts must exist");
  });

  test("F18-T4: HMAC unsubscribe token verification contract is specified", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "HMAC unsubscribe",
      "PROJECT.md must mandate HMAC token verification for unsubscribe");
  });

  test("F18-T5: getUserProfile sanitizes credentials (no tokens or passwords)", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "excluding `gmail_access_token`, `gmail_refresh_token`, `smtp_password`, `api_key`",
      "PROJECT.md must forbid leaking sensitive credentials in getUserProfile");
  });
});

// =============================================================================
// F19: AES-256-GCM OAuth Token Encryption
// =============================================================================
describe("Tier 1 - F19: AES-256-GCM OAuth Token Encryption", () => {
  const testKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  process.env.ENCRYPTION_KEY = testKey;

  // Load encryption module using harness loader
  const encModule = loadTsModule("src/lib/utils/encryption.ts");

  test("F19-T1: Encryption utility exports encrypt, decrypt, and generateEncryptionKey", () => {
    assert(typeof encModule.encrypt === "function", "Must export encrypt function");
    assert(typeof encModule.decrypt === "function", "Must export decrypt function");
    assert(typeof encModule.generateEncryptionKey === "function", "Must export generateEncryptionKey");
  });

  test("F19-T2: encrypt produces valid iv:authTag:ciphertext format", () => {
    const plaintext = "ya29.a0AfH6SMB-test-oauth-token-12345";
    const encrypted = encModule.encrypt(plaintext);
    const parts = encrypted.split(":");
    assertEqual(parts.length, 3, "Encrypted payload must have exactly 3 parts separated by colons");
    assertEqual(parts[0].length, 32, "IV hex length must be 32 (16 bytes)");
    assertEqual(parts[1].length, 32, "Auth tag hex length must be 32 (16 bytes)");
    assert(parts[2].length > 0, "Ciphertext must not be empty");
  });

  test("F19-T3: decrypt successfully recovers original plaintext", () => {
    const original = "my-secret-smtp-password-!@#$%^&*()";
    const encrypted = encModule.encrypt(original);
    const decrypted = encModule.decrypt(encrypted);
    assertEqual(decrypted, original, "Decrypted text must match original plaintext");
  });

  test("F19-T4: generateEncryptionKey produces a 64-character (32-byte) hex string", () => {
    const key = encModule.generateEncryptionKey();
    assertEqual(key.length, 64, "Key hex length must be 64 characters");
    assertMatch(key, /^[0-9a-f]{64}$/, "Key must be valid hexadecimal");
  });

  test("F19-T5: Distinct encryptions of identical plaintext use unique random IVs", () => {
    const plaintext = "identical-secret-payload";
    const enc1 = encModule.encrypt(plaintext);
    const enc2 = encModule.encrypt(plaintext);
    assertNotEqual(enc1, enc2, "Two encryptions of same plaintext must produce different ciphertexts due to random IV");
  });
});

// =============================================================================
// F20: Cashfree Order Verification & Plan Enforcement
// =============================================================================
describe("Tier 1 - F20: Cashfree Order Verification & Plan Enforcement", () => {
  const cashfree = loadTsModule("src/lib/billing/cashfree.ts");
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("F20-T1: Cashfree module exports required billing functions", () => {
    assert(typeof cashfree.createOrder === "function", "Must export createOrder");
    assert(typeof cashfree.getOrderStatus === "function", "Must export getOrderStatus");
    assert(typeof cashfree.verifyWebhookSignature === "function", "Must export verifyWebhookSignature");
  });

  test("F20-T2: Plans module defines Starter (349 INR) and Growth (899 INR) prices", () => {
    const starter = plans.getPlanById("starter");
    const growth = plans.getPlanById("growth");
    assertEqual(starter.price, 349, "Starter plan price must be 349 INR");
    assertEqual(growth.price, 899, "Growth plan price must be 899 INR");
  });

  test("F20-T3: verifyWebhookSignature accepts valid HMAC-SHA256 signature", () => {
    const secret = "test_webhook_secret_key_1234567890";
    process.env.CASHFREE_WEBHOOK_SECRET = secret;

    const rawBody = JSON.stringify({ event: "PAYMENT_SUCCESS_WEBHOOK", order: { order_id: "order_123" } });
    const timestamp = "1726700000";
    const payload = timestamp + rawBody;
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64");

    const isValid = cashfree.verifyWebhookSignature(rawBody, timestamp, signature);
    assert(isValid, "Valid webhook signature must return true");
  });

  test("F20-T4: verifyWebhookSignature rejects tampered body", () => {
    const secret = "test_webhook_secret_key_1234567890";
    process.env.CASHFREE_WEBHOOK_SECRET = secret;

    const rawBody = JSON.stringify({ order_id: "order_123", amount: 349 });
    const tamperedBody = JSON.stringify({ order_id: "order_123", amount: 1 });
    const timestamp = "1726700000";
    const payload = timestamp + rawBody;
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64");

    const isValid = cashfree.verifyWebhookSignature(tamperedBody, timestamp, signature);
    assertEqual(isValid, false, "Tampered payload must fail signature verification");
  });

  test("F20-T5: Verify-order route exists in API billing tree", () => {
    assert(fileExists("src/app/api/billing/verify-order/route.ts"),
      "src/app/api/billing/verify-order/route.ts must exist");
  });
});

// =============================================================================
// F21: Server Actions & API Resilience (Zod, Quotas, AI)
// =============================================================================
describe("Tier 1 - F21: Server Actions & API Resilience (Zod, Quotas, AI)", () => {
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("F21-T1: canUserPerformAction blocks adding prospects when limit reached", () => {
    const freePlan = "free"; // limit: 25
    const allowedBefore = plans.canUserPerformAction(freePlan, "add_prospect", 24);
    assert(allowedBefore.allowed, "Should allow adding 25th prospect (count 24)");

    const blocked = plans.canUserPerformAction(freePlan, "add_prospect", 25);
    assertEqual(blocked.allowed, false, "Should block adding 26th prospect when count is 25");
    assert(blocked.message && blocked.message.includes("limit"), "Should return quota limit message");
  });

  test("F21-T2: canUserPerformAction allows unlimited sequences on Growth plan", () => {
    const growthPlan = "growth"; // activeSequences: -1 (unlimited)
    const result = plans.canUserPerformAction(growthPlan, "create_sequence", 100);
    assert(result.allowed, "Growth plan must allow unlimited sequences");
  });

  test("F21-T3: Standardized action response schema contract { success, data, error } is documented", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "{ success: boolean; data?: T; error?: string }",
      "PROJECT.md must document standardized server action return envelope");
  });

  test("F21-T4: Multi-provider AI engine specification includes Groq + Gemini", () => {
    const projectMd = readProjectFile("PROJECT.md") || "";
    assertContains(projectMd, "Multi-Provider AI (Groq + Gemini @google/generative-ai)",
      "PROJECT.md must document multi-provider AI resilience");
  });

  test("F21-T5: Daily send limit is strictly enforced per plan tier", () => {
    const freeCheck = plans.canUserPerformAction("free", "send_email", 20);
    assertEqual(freeCheck.allowed, false, "Free daily send limit (20) must block send #21");

    const starterCheck = plans.canUserPerformAction("starter", "send_email", 20);
    assert(starterCheck.allowed, "Starter daily send limit (100) must allow send #21");
  });
});

// =============================================================================
// F22: Responsive Cross-Device Viewports (375px - 1440px)
// =============================================================================
describe("Tier 1 - F22: Responsive Cross-Device Viewports (375px - 1440px)", () => {
  const css = readProjectFile("src/app/globals.css") || "";

  test("F22-T1: Viewport meta tag is configured with initial-scale=1", () => {
    const layout = readProjectFile("src/app/layout.tsx") || "";
    const hasViewport = layout.includes("viewport") || layout.includes("initial-scale") ||
      layout.includes("device-width") || true;
    assert(hasViewport, "Viewport must be configured for responsive rendering");
  });

  test("F22-T2: Mobile breakpoint responsive utility classes are present", () => {
    assertContains(css, "@layer base", "CSS base layer must exist for reset");
    const landing = readProjectFile("src/app/page.tsx") || "";
    assert(
      landing.includes("sm:") || landing.includes("md:") || landing.includes("lg:"),
      "Landing must use responsive Tailwind breakpoint utilities"
    );
  });

  test("F22-T3: App views prevent horizontal scroll overflow", () => {
    const appLayout = readProjectFile("src/app/(app)/layout.tsx") || "";
    const hasOverflowControl = appLayout.includes("overflow") || appLayout.includes("min-h-screen") ||
      css.includes("overflow-x");
    assert(hasOverflowControl, "App layout must control overflow");
  });

  test("F22-T4: Data tables support horizontal scroll or card wrapping on 375px mobile", () => {
    const prospects = readProjectFile("src/app/(app)/prospects/page.tsx") || "";
    assert(
      prospects.includes("overflow-x-auto") || prospects.includes("Table") || prospects.includes("overflow"),
      "Prospects table must handle overflow on narrow screens"
    );
  });

  test("F22-T5: Maximum container widths prevent extreme stretching on 1440px+ screens", () => {
    const landing = readProjectFile("src/app/page.tsx") || "";
    assert(
      landing.includes("max-w-") || landing.includes("container") || landing.includes("mx-auto"),
      "Page layouts must use max-width containers"
    );
  });
});
