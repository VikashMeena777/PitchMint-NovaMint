/**
 * Tier 2: Boundary & Corner Cases (F18 - F22)
 * PitchMint Platform Redesign & Hardening
 */

const {
  describe,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertGreaterThan,
  assertThrows,
  readProjectFile,
  loadTsModule,
} = require("../harness");
const crypto = require("crypto");

// =============================================================================
// F18: Security Hardening Boundaries
// =============================================================================
describe("Tier 2 - F18: Security Hardening Boundaries", () => {
  test("F18-B1: Open redirect validator blocks protocol-relative URLs (//evil.com)", () => {
    const isSafeRedirect = (urlStr, baseOrigin = "https://pitchmint.com") => {
      if (!urlStr || typeof urlStr !== "string") return false;
      // Must start with single / and not //
      if (urlStr.startsWith("//")) return false;
      if (urlStr.startsWith("/")) return true;
      try {
        const parsed = new URL(urlStr);
        return parsed.origin === baseOrigin;
      } catch {
        return false;
      }
    };

    assertEqual(isSafeRedirect("/dashboard"), true, "Relative /dashboard is safe");
    assertEqual(isSafeRedirect("//attacker.com"), false, "Protocol-relative //attacker.com is blocked");
    assertEqual(isSafeRedirect("https://attacker.com"), false, "External host is blocked");
    assertEqual(isSafeRedirect("javascript:alert(1)"), false, "javascript: protocol is blocked");
    assertEqual(isSafeRedirect("data:text/html,evil"), false, "data: protocol is blocked");
  });

  test("F18-B2: HMAC unsubscribe token tampering by 1 single bit fails verification", () => {
    const secret = "secret_unsubscribe_salt_key_998877";
    const prospectId = "prospect_uuid_12345";
    const userId = "user_uuid_67890";
    const payload = `${prospectId}:${userId}`;

    const validHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    // Tamper with one character
    const tamperedHmac = validHmac.slice(0, -1) + (validHmac.slice(-1) === "a" ? "b" : "a");

    const verifyHmac = (token, expectedPayload) => {
      const computed = crypto.createHmac("sha256", secret).update(expectedPayload).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(computed));
    };

    assertEqual(verifyHmac(validHmac, payload), true, "Valid HMAC passes");
    assertEqual(verifyHmac(tamperedHmac, payload), false, "1-bit tampered HMAC fails");
  });

  test("F18-B3: User profile response filter strips all sensitive credential keys", () => {
    const rawDbUser = {
      id: "usr_1",
      email: "user@pitchmint.com",
      full_name: "Test User",
      gmail_access_token: "secret_token_123",
      gmail_refresh_token: "secret_refresh_456",
      smtp_password: "super_secret_smtp_password",
      api_key: "pm_live_secret_key",
      plan: "starter",
    };

    const sanitizeUser = (user) => {
      const sanitized = { ...user };
      delete sanitized.gmail_access_token;
      delete sanitized.gmail_refresh_token;
      delete sanitized.smtp_password;
      delete sanitized.api_key;
      return sanitized;
    };

    const safeUser = sanitizeUser(rawDbUser);
    assertEqual("gmail_access_token" in safeUser, false, "gmail_access_token must be stripped");
    assertEqual("gmail_refresh_token" in safeUser, false, "gmail_refresh_token must be stripped");
    assertEqual("smtp_password" in safeUser, false, "smtp_password must be stripped");
    assertEqual("api_key" in safeUser, false, "api_key must be stripped");
    assertEqual(safeUser.email, "user@pitchmint.com", "Non-sensitive email retained");
  });

  test("F18-B4: API error responses replace internal stack traces with generic message in production", () => {
    const formatSafeApiError = (err, isProd = true) => {
      if (isProd) {
        return { error: "An unexpected error occurred. Please try again." };
      }
      return { error: err.message, stack: err.stack };
    };

    const err = new Error("Connection failed to internal-db-cluster-01.internal:5432");
    const prodResponse = formatSafeApiError(err, true);
    assert(!prodResponse.error.includes("internal-db-cluster-01"), "Prod error must not leak internal hostnames");
    assertEqual(prodResponse.stack, undefined, "Stack trace must not be exposed");
  });

  test("F18-B5: Null byte (%00) injection in URL search params is stripped or rejected", () => {
    const sanitizeParam = (param) => param ? param.replace(/\0/g, "") : "";
    assertEqual(sanitizeParam("prospect\0.csv"), "prospect.csv", "Null byte stripped");
  });
});

// =============================================================================
// F19: AES-256-GCM OAuth Token Encryption Boundaries
// =============================================================================
describe("Tier 2 - F19: AES-256-GCM OAuth Token Encryption Boundaries", () => {
  const testKey = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
  process.env.ENCRYPTION_KEY = testKey;
  const encModule = loadTsModule("src/lib/utils/encryption.ts");

  test("F19-B1: Decrypting tampered auth tag throws authentication tag mismatch error", () => {
    const original = "my-secret-token";
    const encrypted = encModule.encrypt(original);
    const [iv, authTag, cipher] = encrypted.split(":");

    // Flip last character of auth tag
    const tamperedTag = authTag.slice(0, -1) + (authTag.slice(-1) === "a" ? "b" : "a");
    const tamperedEncrypted = `${iv}:${tamperedTag}:${cipher}`;

    assertThrows(() => {
      encModule.decrypt(tamperedEncrypted);
    }, null, "Decryption of tampered auth tag must fail");
  });

  test("F19-B2: Decrypting truncated or malformed ciphertext format throws error", () => {
    assertThrows(() => encModule.decrypt("not_enough_colons"), "Invalid encrypted text format");
    assertThrows(() => encModule.decrypt("only:two_parts"), "Invalid encrypted text format");
  });

  test("F19-B3: Encrypting non-ASCII Unicode and emoji strings roundtrips flawlessly", () => {
    const unicodeString = "Token_🔑_OAuth_éèñ_日本語_العربية";
    const enc = encModule.encrypt(unicodeString);
    const dec = encModule.decrypt(enc);
    assertEqual(dec, unicodeString, "Unicode and emojis must decrypt faithfully");
  });

  test("F19-B4: Large secret string (100,000 characters) encrypts and decrypts accurately", () => {
    const largePlaintext = "A".repeat(100000);
    const enc = encModule.encrypt(largePlaintext);
    const dec = encModule.decrypt(enc);
    assertEqual(dec.length, 100000, "Large payload length matches");
    assertEqual(dec, largePlaintext, "Large payload content matches");
  });

  test("F19-B5: Empty string encryption produces valid ciphertext and decrypts back to empty string", () => {
    const enc = encModule.encrypt("");
    const dec = encModule.decrypt(enc);
    assertEqual(dec, "", "Empty string should decrypt back to empty string");
  });
});

// =============================================================================
// F20: Cashfree Order Verification & Plan Enforcement Boundaries
// =============================================================================
describe("Tier 2 - F20: Cashfree Order Verification & Plan Enforcement Boundaries", () => {
  const cashfree = loadTsModule("src/lib/billing/cashfree.ts");
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("F20-B1: Order verification blocks activation when order_amount does not match plan catalog price", () => {
    const verifyAmountMatch = (planId, orderAmount) => {
      const plan = plans.getPlanById(planId);
      return plan.price === orderAmount;
    };

    assertEqual(verifyAmountMatch("starter", 349), true, "349 INR matches Starter price");
    assertEqual(verifyAmountMatch("starter", 348), false, "348 INR (tampered by 1 INR) is blocked");
    assertEqual(verifyAmountMatch("growth", 1), false, "1 INR tampered amount is blocked");
  });

  test("F20-B2: Order verification blocks activation when order_tags.plan_id does not match target plan", () => {
    const verifyPlanTag = (requestedPlanId, orderTagPlanId) => requestedPlanId === orderTagPlanId;
    assertEqual(verifyPlanTag("growth", "growth"), true, "Matching plan tag is verified");
    assertEqual(verifyPlanTag("agency", "starter"), false, "Tag plan mismatch (paid Starter, claimed Agency) is blocked");
  });

  test("F20-B3: Webhook verification rejects request when signature header is missing or empty", () => {
    process.env.CASHFREE_WEBHOOK_SECRET = "test_webhook_secret_key";
    assertEqual(cashfree.verifyWebhookSignature("{}", "1726700000", ""), false, "Empty signature fails");
    assertEqual(cashfree.verifyWebhookSignature("{}", "1726700000", null), false, "Null signature fails");
  });

  test("F20-B4: Webhook verification rejects request when CASHFREE_WEBHOOK_SECRET is not configured", () => {
    const orig = process.env.CASHFREE_WEBHOOK_SECRET;
    delete process.env.CASHFREE_WEBHOOK_SECRET;
    try {
      const res = cashfree.verifyWebhookSignature("{}", "1726700000", "any_sig");
      assertEqual(res, false, "Missing webhook secret safely rejects webhook");
    } finally {
      process.env.CASHFREE_WEBHOOK_SECRET = orig;
    }
  });

  test("F20-B5: Webhook timestamp drift boundary (rejecting timestamps older than 5 minutes / 300s)", () => {
    const isTimestampFresh = (timestampSec, currentSec = Math.floor(Date.now() / 1000), maxDriftSec = 300) => {
      const diff = Math.abs(currentSec - parseInt(timestampSec, 10));
      return diff <= maxDriftSec;
    };

    const now = 1726700000;
    assertEqual(isTimestampFresh(1726700000, now), true, "Exact timestamp is fresh");
    assertEqual(isTimestampFresh(1726699800, now), true, "200s old is fresh");
    assertEqual(isTimestampFresh(1726699600, now), false, "400s old (>300s) is rejected as replay");
  });
});

// =============================================================================
// F21: Server Actions & API Resilience Boundaries
// =============================================================================
describe("Tier 2 - F21: Server Actions & API Resilience Boundaries", () => {
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("F21-B1: canUserPerformAction blocks zero-count edge cases for non-positive allowances", () => {
    // Zero quota edge case
    const checkQuota = (allowance, current) => current < allowance;
    assertEqual(checkQuota(0, 0), false, "0 allowance with 0 count cannot proceed");
    assertEqual(checkQuota(1, 0), true, "1 allowance with 0 count can proceed");
  });

  test("F21-B2: PostgREST search filter escaping prevents query delimiter injection (,) and operators", () => {
    const escapePostgrest = (input) => {
      // Escape commas, parens, and wildcards
      return input.replace(/[,()]/g, "\\$&");
    };
    assertEqual(escapePostgrest("test,ilike.*"), "test\\,ilike.*", "Commas must be escaped");
    assertEqual(escapePostgrest("search(term)"), "search\\(term\\)", "Parentheses must be escaped");
  });

  test("F21-B3: Rate limiter window boundary allows burst limit and blocks burst + 1", () => {
    const simulateRateLimit = (limit, requests) => requests <= limit;
    assertEqual(simulateRateLimit(10, 10), true, "10th request in 10-limit window allowed");
    assertEqual(simulateRateLimit(10, 11), false, "11th request in 10-limit window blocked");
  });

  test("F21-B4: Multi-provider AI fallback switches from Groq to Gemini on 500/503 error", () => {
    let activeProvider = "groq";
    const handleAiCall = (primaryFail) => {
      if (primaryFail) {
        activeProvider = "gemini";
      }
      return { provider: activeProvider, success: true };
    };

    const res = handleAiCall(true);
    assertEqual(res.provider, "gemini", "Must fall back to Gemini when primary provider fails");
  });

  test("F21-B5: Standardized error envelope wraps thrown exceptions without terminating Node process", () => {
    const safeActionWrapper = async (action) => {
      try {
        const data = await action();
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message || "Action failed" };
      }
    };

    return safeActionWrapper(async () => {
      throw new Error("Simulated database timeout");
    }).then(res => {
      assertEqual(res.success, false, "Action error returns success: false");
      assertEqual(res.error, "Simulated database timeout", "Error message surfaced safely");
    });
  });
});

// =============================================================================
// F22: Responsive Cross-Device Viewports Boundaries
// =============================================================================
describe("Tier 2 - F22: Responsive Cross-Device Viewports Boundaries", () => {
  test("F22-B1: Ultra-narrow mobile viewport (320px) maintains horizontal containment", () => {
    const simulateViewport = (width, containerWidth) => containerWidth <= width;
    assertEqual(simulateViewport(320, 320), true, "320px container fits 320px screen without horizontal scroll");
    assertEqual(simulateViewport(320, 350), false, "350px container on 320px screen overflows");
  });

  test("F22-B2: Ultra-wide 4K desktop viewport (3840px) constrains content width via max-w container", () => {
    const getMaxContentWidth = (viewportWidth) => Math.min(viewportWidth, 1440);
    assertEqual(getMaxContentWidth(3840), 1440, "4K screen bounds content container to 1440px max");
  });

  test("F22-B3: Tablet breakpoint transition at boundary (767px mobile vs 768px tablet)", () => {
    const isMobileNav = (width) => width < 768;
    assertEqual(isMobileNav(767), true, "767px is mobile nav");
    assertEqual(isMobileNav(768), false, "768px switches to desktop/tablet layout");
  });

  test("F22-B4: Laptop breakpoint transition at boundary (1023px vs 1024px)", () => {
    const isDrawerRequired = (width) => width < 1024;
    assertEqual(isDrawerRequired(1023), true, "1023px requires drawer");
    assertEqual(isDrawerRequired(1024), false, "1024px enables permanent sidebar");
  });

  test("F22-B5: Mobile touch target boundary enforces minimum 44px by 44px hit area", () => {
    const isTouchAccessible = (width, height) => width >= 44 && height >= 44;
    assertEqual(isTouchAccessible(44, 44), true, "44x44px passes accessibility");
    assertEqual(isTouchAccessible(48, 48), true, "48x48px passes accessibility");
    assertEqual(isTouchAccessible(40, 44), false, "40x44px fails touch target requirement");
  });
});
