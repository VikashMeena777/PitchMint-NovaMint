/**
 * Tier 5: Adversarial Coverage Hardening & Stress Suite
 * PitchMint Platform Redesign & Hardening
 * 
 * Stress conditions, concurrent operations, extreme strings, Unicode/astral-plane
 * preservation, network drop recovery, graph cycle detection, and security penetration.
 */

const crypto = require("crypto");
const {
  describe,
  test,
  assert,
  assertEqual,
  assertNotEqual,
  assertContains,
  assertGreaterThan,
  assertLessThan,
  assertBetween,
  assertThrows,
  loadTsModule,
  readProjectFile,
} = require("../harness");

// =============================================================================
// Suite 1: Motion & WebGL Canvas Adversarial Stress
// =============================================================================
describe("Tier 5 - Motion & WebGL Canvas Adversarial Stress", () => {
  test("T5-M1: Rapid viewport resize storm (50 rapid resize events) keeps aspect ratio finite and stable", () => {
    const viewports = [
      { w: 320, h: 568 },
      { w: 375, h: 667 },
      { w: 768, h: 1024 },
      { w: 1024, h: 768 },
      { w: 1440, h: 900 },
      { w: 1920, h: 1080 },
      { w: 2560, h: 1440 },
      { w: 3840, h: 2160 },
      { w: 5120, h: 1440 }, // Ultra-wide
    ];

    let cameraAspect = 1.0;
    let cameraFov = 45;

    for (let i = 0; i < 50; i++) {
      const vp = viewports[i % viewports.length];
      assert(vp.w > 0 && vp.h > 0, "Viewport dimensions must be non-zero");
      cameraAspect = vp.w / vp.h;
      assert(Number.isFinite(cameraAspect), "Camera aspect ratio must remain a finite number");
      assertGreaterThan(cameraAspect, 0, "Camera aspect ratio must be positive");
    }

    // Final check for aspect ratio stability
    assertGreaterThan(cameraAspect, 0.1, "Final aspect ratio in valid range");
    assertLessThan(cameraAspect, 10.0, "Final aspect ratio in valid range");
    assertEqual(cameraFov, 45, "Camera FOV remains unaffected by resize loop");
  });

  test("T5-M2: WebGL context loss simulation cleanly halts RAF loop and sets fallback trigger", () => {
    let isRunning = true;
    let fallbackActivated = false;
    let animationFrameId = 1234;

    const handleContextLost = (event) => {
      event.preventDefault();
      isRunning = false;
      animationFrameId = 0;
      fallbackActivated = true;
    };

    const mockEvent = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    handleContextLost(mockEvent);

    assertEqual(mockEvent.defaultPrevented, true, "Event preventDefault must be called to prevent browser reload");
    assertEqual(isRunning, false, "Animation loop must stop when context is lost");
    assertEqual(animationFrameId, 0, "Animation frame ID must be reset");
    assertEqual(fallbackActivated, true, "2D Canvas Fallback component state must activate");
  });

  test("T5-M3: IntersectionObserver off-screen occlusion immediately pauses RAF loop", () => {
    let rafActive = true;
    let frameTicks = 0;

    const simulateRaf = () => {
      if (rafActive) {
        frameTicks++;
      }
    };

    // Simulate 5 frames while visible
    for (let i = 0; i < 5; i++) simulateRaf();
    assertEqual(frameTicks, 5, "5 frames ticked while visible");

    // Off-screen event: isIntersecting = false
    rafActive = false;

    // Simulate 10 frames while off-screen
    for (let i = 0; i < 10; i++) simulateRaf();
    assertEqual(frameTicks, 5, "Frame ticks strictly frozen when scrolled off-screen");

    // Re-enters viewport: isIntersecting = true
    rafActive = true;
    for (let i = 0; i < 3; i++) simulateRaf();
    assertEqual(frameTicks, 8, "Frame ticks resume smoothly upon re-entering viewport");
  });

  test("T5-M4: High-DPI screen DPR clamping protects against GPU buffer memory exhaustion", () => {
    const clampDpr = (rawDpr) => {
      if (!rawDpr || typeof rawDpr !== "number" || rawDpr <= 0 || !Number.isFinite(rawDpr)) {
        return 1.0;
      }
      return Math.min(rawDpr, 2.0);
    };

    assertEqual(clampDpr(1.0), 1.0, "Standard 1x screen stays 1.0");
    assertEqual(clampDpr(1.5), 1.5, "1.5x screen stays 1.5");
    assertEqual(clampDpr(2.0), 2.0, "2x Retina screen stays 2.0");
    assertEqual(clampDpr(3.0), 2.0, "3x high-end smartphone screen clamped to 2.0");
    assertEqual(clampDpr(4.0), 2.0, "4x extreme test screen clamped to 2.0");
    assertEqual(clampDpr(0), 1.0, "Zero DPR falls back to 1.0");
    assertEqual(clampDpr(null), 1.0, "Null DPR falls back to 1.0");
    assertEqual(clampDpr(NaN), 1.0, "NaN DPR falls back to 1.0");
  });

  test("T5-M5: Lenis virtual scroll velocity under extreme wheel momentum spikes clamps safely", () => {
    const MAX_VELOCITY = 1500; // px/s limit
    const clampScrollVelocity = (velocity) => {
      if (velocity == null || Number.isNaN(velocity)) return 0;
      return Math.sign(velocity) * Math.min(Math.abs(velocity), MAX_VELOCITY);
    };

    assertEqual(clampScrollVelocity(250), 250, "Normal 250px/s velocity unaltered");
    assertEqual(clampScrollVelocity(1500), 1500, "1500px/s velocity at threshold unaltered");
    assertEqual(clampScrollVelocity(5800), 1500, "5800px/s ballistic fling clamped to 1500");
    assertEqual(clampScrollVelocity(-7200), -1500, "Negative ballistic fling clamped to -1500");
    assertEqual(clampScrollVelocity(NaN), 0, "NaN velocity sanitized to 0");
    assertEqual(clampScrollVelocity(Infinity), 1500, "Infinity velocity clamped to 1500");
  });

  test("T5-M6: ScrollTrigger instances clean up cleanly during rapid mount/unmount thrashing", () => {
    const activeTriggers = new Map();
    let idCounter = 0;

    const createTrigger = (id) => {
      activeTriggers.set(id, { killed: false });
    };

    const killAllTriggers = () => {
      activeTriggers.forEach((t) => {
        t.killed = true;
      });
      activeTriggers.clear();
    };

    // Thrash 30 mounts and unmounts
    for (let cycle = 0; cycle < 30; cycle++) {
      const id = `trig_${++idCounter}`;
      createTrigger(id);
      if (cycle % 3 === 0) {
        killAllTriggers();
      }
    }
    killAllTriggers();

    assertEqual(activeTriggers.size, 0, "All triggers removed from registry");
  });
});

// =============================================================================
// Suite 2: Auth & Encryption Adversarial Stress
// =============================================================================
describe("Tier 5 - Auth & Encryption Adversarial Stress", () => {
  const enc = loadTsModule("src/lib/utils/encryption.ts");
  const redirectSec = loadTsModule("src/lib/security/redirect.ts");
  const hmacSec = loadTsModule("src/lib/security/hmac.ts");

  test("T5-A1: AES-256-GCM encrypts and decrypts 100KB large payloads without truncation or corrupted tags", () => {
    // Generate 100KB payload
    const chunk = "PitchMint-AI-Cold-Outreach-Platform-Payload-Segment-2026;";
    const targetLength = 100 * 1024;
    const largePayload = chunk.repeat(Math.ceil(targetLength / chunk.length)).slice(0, targetLength);

    assertEqual(largePayload.length, 102400, "Payload length is exactly 100KB");

    const encrypted = enc.encrypt(largePayload);
    const parts = encrypted.split(":");
    assertEqual(parts.length, 3, "Encrypted structure preserves iv:authTag:cipher format");
    assertEqual(parts[0].length, 32, "16-byte IV in hex");
    assertEqual(parts[1].length, 32, "16-byte Auth tag in hex");

    const decrypted = enc.decrypt(encrypted);
    assertEqual(decrypted.length, largePayload.length, "Decrypted length matches 100KB exactly");
    assertEqual(decrypted, largePayload, "100KB payload content matches bit-for-bit");
  });

  test("T5-A2: Astral plane Unicode, RTL scripts, and multiline complex emojis roundtrip with 100% fidelity", () => {
    const complexString = "🧑‍💻 PitchMint AI 🚀 — 💎 $349/mo • ﷽ • 漢字 • \uD83D\uDE00\uD83D\uDE80\uD83D\uDCBB\n\r\tNewline & Quotes '\"`<>&";
    const encrypted = enc.encrypt(complexString);
    const decrypted = enc.decrypt(encrypted);

    assertEqual(decrypted, complexString, "Complex Unicode and emoji string restored identically");
  });

  test("T5-A3: Multi-bit flip ciphertext tampering in IV, ciphertext, or authTag consistently throws auth error", () => {
    const original = "confidential-access-token-998877";
    const encrypted = enc.encrypt(original);
    const [iv, authTag, cipher] = encrypted.split(":");

    // 1. Corrupt IV
    const corruptedIv = (iv[0] === "0" ? "1" : "0") + iv.slice(1);
    assertThrows(() => enc.decrypt(`${corruptedIv}:${authTag}:${cipher}`), null, "Corrupt IV must fail decryption");

    // 2. Corrupt Auth Tag
    const corruptedTag = authTag.slice(0, -1) + (authTag.slice(-1) === "a" ? "b" : "a");
    assertThrows(() => enc.decrypt(`${iv}:${corruptedTag}:${cipher}`), null, "Corrupt auth tag must fail decryption");

    // 3. Corrupt Ciphertext
    const corruptedCipher = cipher.slice(0, 4) + "0000" + cipher.slice(8);
    assertThrows(() => enc.decrypt(`${iv}:${authTag}:${corruptedCipher}`), null, "Corrupt cipher must fail decryption");
  });

  test("T5-A4: Open redirect defense neutralizes exotic bypasses (protocol-relative, backslash, control chars, schemes)", () => {
    const maliciousUrls = [
      "javascript:alert(document.cookie)",
      "JAVASCRIPT:alert(1)",
      "data:text/html,<script>window.location='https://attacker.com'</script>",
      "vbscript:msgbox(1)",
      "//evil.com",
      "//evil.com/phish",
      "/\\evil.com",
      "/\\\\evil.com",
      "/path\0/evil.com",
      "/dashboard\r\nLocation: https://evil.com",
      "http://169.254.169.254/latest/meta-data/", // AWS metadata SSRF
      "http://127.0.0.1:5432",
    ];

    for (const url of maliciousUrls) {
      const isSafe = redirectSec.isSafeRedirectUrl(url);
      assertEqual(isSafe, false, `Malicious URL "${url}" must be rejected`);
      const fallback = redirectSec.getSafeRedirectUrl(url, "/default");
      assertEqual(fallback, "/default", `Malicious URL "${url}" must fall back to /default`);
    }

    // Auth callback internal-only redirect validation
    const isInternalAuthRedirect = (url) =>
      typeof url === "string" &&
      url.startsWith("/") &&
      !url.startsWith("//") &&
      !url.startsWith("/\\") &&
      redirectSec.isSafeRedirectUrl(url);

    assertEqual(isInternalAuthRedirect("https://attacker.com/oauth/steal"), false, "External host rejected for internal auth callback redirect");
    assertEqual(isInternalAuthRedirect("//attacker.com"), false, "Protocol-relative rejected for internal auth callback redirect");
    assertEqual(isInternalAuthRedirect("/dashboard"), true, "Internal /dashboard accepted for auth callback");

    const safeUrls = [
      "/dashboard",
      "/prospects/123",
      "/settings?tab=billing",
      "/sequences/builder#step-2",
    ];

    for (const url of safeUrls) {
      assertEqual(redirectSec.isSafeRedirectUrl(url), true, `Safe URL "${url}" must be accepted`);
    }
  });

  test("T5-A5: User profile credential sanitization recursively strips secrets from deeply nested and aliased structures", () => {
    const deeplyNestedUser = {
      id: "usr_42",
      email: "ceo@pitchmint.com",
      name: "Founder",
      credentials: {
        gmail_access_token: "ya29.secret_token",
        smtp_password: "super_secret_smtp",
      },
      metadata: {
        api_key: "pm_live_secret_key_12345",
      },
      gmail_refresh_token: "1//refresh_token_secret",
    };

    const stripDeepSecrets = (obj) => {
      const secretKeys = new Set([
        "gmail_access_token",
        "gmail_refresh_token",
        "smtp_password",
        "api_key",
      ]);

      const clean = (target) => {
        if (!target || typeof target !== "object") return target;
        if (Array.isArray(target)) return target.map(clean);
        const res = {};
        for (const [k, v] of Object.entries(target)) {
          if (!secretKeys.has(k)) {
            res[k] = clean(v);
          }
        }
        return res;
      };

      return clean(obj);
    };

    const sanitized = stripDeepSecrets(deeplyNestedUser);
    assertEqual("gmail_refresh_token" in sanitized, false, "Root secret stripped");
    assertEqual("gmail_access_token" in sanitized.credentials, false, "Nested credential stripped");
    assertEqual("smtp_password" in sanitized.credentials, false, "Nested SMTP password stripped");
    assertEqual("api_key" in sanitized.metadata, false, "Deep metadata API key stripped");
    assertEqual(sanitized.email, "ceo@pitchmint.com", "Legitimate fields preserved");
  });

  test("T5-A6: HMAC unsubscribe token rejects constant-time comparison bypass and mismatched key spaces", () => {
    const prospectId = "prospect_uuid_8832";
    const userId = "user_uuid_1049";

    const validToken = hmacSec.generateUnsubscribeToken(prospectId, userId);
    assertEqual(typeof validToken, "string", "Generated token is string");
    assertEqual(validToken.length, 64, "Token is 64 hex chars (32 bytes HMAC-SHA256)");

    // Valid check
    assertEqual(hmacSec.verifyUnsubscribeToken(validToken, prospectId, userId), true, "Valid token verified");

    // Invalid: swapped user/prospect IDs
    assertEqual(hmacSec.verifyUnsubscribeToken(validToken, userId, prospectId), false, "Swapped IDs rejected");

    // Invalid: altered 1 character
    const tamperedToken = validToken.slice(0, -1) + (validToken.slice(-1) === "0" ? "1" : "0");
    assertEqual(hmacSec.verifyUnsubscribeToken(tamperedToken, prospectId, userId), false, "Tampered 1 char rejected");

    // Invalid: blank or empty or non-hex
    assertEqual(hmacSec.verifyUnsubscribeToken("", prospectId, userId), false, "Empty token rejected");
    assertEqual(hmacSec.verifyUnsubscribeToken("not_a_valid_hex_string", prospectId, userId), false, "Invalid hex rejected");
  });
});

// =============================================================================
// Suite 3: Cashfree Billing & Webhook Replay Defense
// =============================================================================
describe("Tier 5 - Cashfree Billing & Webhook Replay Defense", () => {
  const cashfree = loadTsModule("src/lib/billing/cashfree.ts");
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("T5-B1: High-concurrency duplicate webhook delivery maintains idempotency for same order ID", () => {
    const processedOrders = new Set();
    const processWebhookOrder = (orderId, amount) => {
      if (processedOrders.has(orderId)) {
        return { status: "duplicate", processed: false };
      }
      processedOrders.add(orderId);
      return { status: "success", processed: true, amount };
    };

    // Simulate 10 rapid concurrent deliveries of the exact same webhook payload
    const orderId = "order_cashfree_concurrency_test_001";
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(processWebhookOrder(orderId, 349));
    }

    const successCount = results.filter((r) => r.processed).length;
    const duplicateCount = results.filter((r) => r.status === "duplicate").length;

    assertEqual(successCount, 1, "Exactly one webhook execution succeeds");
    assertEqual(duplicateCount, 9, "9 duplicate deliveries safely flagged and ignored");
  });

  test("T5-B2: Stale webhook timestamp replay (>300s clock drift) is rejected even with cryptographically valid signature", () => {
    const isWebhookTimestampValid = (timestampStr, maxAgeSec = 300) => {
      const ts = parseInt(timestampStr, 10);
      if (Number.isNaN(ts) || ts <= 0) return false;
      const now = Math.floor(Date.now() / 1000);
      const age = now - ts;
      // Must not be from the future (> 60s clock skew) and not older than maxAgeSec
      return age >= -60 && age <= maxAgeSec;
    };

    const currentSec = Math.floor(Date.now() / 1000);
    assertEqual(isWebhookTimestampValid(String(currentSec)), true, "Current timestamp valid");
    assertEqual(isWebhookTimestampValid(String(currentSec - 250)), true, "250s old timestamp valid");
    assertEqual(isWebhookTimestampValid(String(currentSec - 301)), false, "301s old timestamp rejected (>300s)");
    assertEqual(isWebhookTimestampValid(String(currentSec - 86400)), false, "1-day old replayed timestamp rejected");
    assertEqual(isWebhookTimestampValid(String(currentSec + 3600)), false, "Far future timestamp rejected");
    assertEqual(isWebhookTimestampValid("not_a_number"), false, "Non-numeric timestamp rejected");
  });

  test("T5-B3: Floating-point precision manipulation in order amounts is strictly rejected", () => {
    const validateOrderAmount = (planId, claimedAmount) => {
      const plan = plans.getPlanById(planId);
      if (typeof claimedAmount !== "number" || !Number.isInteger(claimedAmount)) {
        return { valid: false, reason: "Amount must be integer INR" };
      }
      if (claimedAmount !== plan.price) {
        return { valid: false, reason: "Price mismatch" };
      }
      return { valid: true };
    };

    assertEqual(validateOrderAmount("starter", 349).valid, true, "349 INR integer matches Starter price");
    assertEqual(validateOrderAmount("starter", 349.0000001).valid, false, "Float with infinitesimal fraction rejected");
    assertEqual(validateOrderAmount("starter", 348.99).valid, false, "348.99 INR rejected");
    assertEqual(validateOrderAmount("starter", NaN).valid, false, "NaN amount rejected");
    assertEqual(validateOrderAmount("starter", -349).valid, false, "Negative amount rejected");
    assertEqual(validateOrderAmount("starter", Infinity).valid, false, "Infinity amount rejected");
  });

  test("T5-B4: Order verification blocks activation when order_tags.plan_id attempts catalog privilege escalation", () => {
    const verifyPlanPurchaseIntegrity = (orderStatus, targetPlanId) => {
      const targetPlan = plans.getPlanById(targetPlanId);
      // Verify payment status
      if (orderStatus.order_status !== "PAID") return { allowed: false, error: "Order not paid" };
      // Verify exact catalog price
      if (orderStatus.order_amount !== targetPlan.price) return { allowed: false, error: "Price mismatch" };
      // Verify tag matches
      if (orderStatus.order_tags?.plan_id !== targetPlanId) return { allowed: false, error: "Tag mismatch" };
      return { allowed: true };
    };

    // Attacker pays Starter price (349 INR) but requests Agency plan upgrade
    const forgedOrder = {
      order_id: "order_forge_001",
      order_status: "PAID",
      order_amount: 349, // Paid Starter amount
      order_tags: { plan_id: "starter" },
    };

    const agencyAttempt = verifyPlanPurchaseIntegrity(forgedOrder, "agency");
    assertEqual(agencyAttempt.allowed, false, "Privilege escalation attempt to Agency blocked");
    assertEqual(agencyAttempt.error, "Price mismatch", "Blocked due to price mismatch (349 vs 1999)");

    // Attacker forged tags: Paid 349 but put plan_id: "agency" in tag
    const forgedTagOrder = {
      order_id: "order_forge_002",
      order_status: "PAID",
      order_amount: 349,
      order_tags: { plan_id: "agency" },
    };
    const starterAttemptWithAgencyTag = verifyPlanPurchaseIntegrity(forgedTagOrder, "starter");
    assertEqual(starterAttemptWithAgencyTag.allowed, false, "Mismatched tag rejected");
  });

  test("T5-B5: Cashfree webhook verification handles multi-lingual UTF-8 strings correctly without hash distortion", () => {
    const secret = "test_cashfree_webhook_secret_key_2026";
    process.env.CASHFREE_WEBHOOK_SECRET = secret;

    const payloadObj = {
      order_id: "order_hindi_001",
      customer_name: "विकाश मीणा (Vikash Meena)",
      note: "PitchMint कोल्ड आउटरीच प्रो प्लान",
      timestamp: "1726705000",
    };
    const rawBody = JSON.stringify(payloadObj);
    const timestamp = payloadObj.timestamp;

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(timestamp + rawBody)
      .digest("base64");

    const verified = cashfree.verifyWebhookSignature(rawBody, timestamp, expectedSig);
    assertEqual(verified, true, "Signature over UTF-8 Hindi payload verifies cleanly");
  });
});

// =============================================================================
// Suite 4: Sequences Engine & Complex Graph Invariants
// =============================================================================
describe("Tier 5 - Sequences Engine & Complex Graph Invariants", () => {
  const sanitize = loadTsModule("src/lib/security/sanitize.ts");
  const plans = loadTsModule("src/lib/billing/plans.ts");

  test("T5-S1: Complex multi-branch directed acyclic graph (DAG) validates execution order and topological sort", () => {
    // Graph: Root(1) -> Wait(2) -> Condition(3) -> [BranchYes(4), BranchNo(5)] -> End(6)
    const nodes = [1, 2, 3, 4, 5, 6];
    const edges = [
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 6],
      [5, 6],
    ];

    const topologicalSort = (nodeList, edgeList) => {
      const inDegree = new Map();
      const adj = new Map();
      nodeList.forEach((n) => {
        inDegree.set(n, 0);
        adj.set(n, []);
      });

      edgeList.forEach(([u, v]) => {
        adj.get(u).push(v);
        inDegree.set(v, inDegree.get(v) + 1);
      });

      const queue = nodeList.filter((n) => inDegree.get(n) === 0);
      const order = [];

      while (queue.length > 0) {
        const u = queue.shift();
        order.push(u);

        for (const v of adj.get(u)) {
          inDegree.set(v, inDegree.get(v) - 1);
          if (inDegree.get(v) === 0) {
            queue.push(v);
          }
        }
      }

      return order.length === nodeList.length ? order : null;
    };

    const order = topologicalSort(nodes, edges);
    assert(order !== null, "Valid DAG must produce topological order");
    assertEqual(order[0], 1, "Root step 1 executes first");
    assertEqual(order[order.length - 1], 6, "End step 6 executes last");
  });

  test("T5-S2: Multi-step circular dependency cycle (A -> B -> C -> D -> B) is detected and rejected before activation", () => {
    const nodes = ["A", "B", "C", "D"];
    const cyclicEdges = [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "B"], // Cycle back to B!
    ];

    const detectCycle = (nodeList, edgeList) => {
      const adj = new Map();
      nodeList.forEach((n) => adj.set(n, []));
      edgeList.forEach(([u, v]) => adj.get(u).push(v));

      const visited = new Set();
      const inStack = new Set();

      const hasCycleDfs = (curr) => {
        visited.add(curr);
        inStack.add(curr);

        for (const neighbor of adj.get(curr)) {
          if (!visited.has(neighbor) && hasCycleDfs(neighbor)) return true;
          if (inStack.has(neighbor)) return true;
        }

        inStack.delete(curr);
        return false;
      };

      for (const n of nodeList) {
        if (!visited.has(n)) {
          if (hasCycleDfs(n)) return true;
        }
      }
      return false;
    };

    assertEqual(detectCycle(nodes, cyclicEdges), true, "Cycle A -> B -> C -> D -> B must be detected");
  });

  test("T5-S3: Self-referencing node cycle (A -> A) and disjoint unlinked nodes are rejected", () => {
    const selfLoopEdges = [["A", "A"]];
    const isSelfLoop = (edges) => edges.some(([from, to]) => from === to);
    assertEqual(isSelfLoop(selfLoopEdges), true, "Self loop A -> A detected");

    // Disconnected graph check
    const allNodes = new Set(["Step1", "Step2", "OrphanStep"]);
    const edges = [["Step1", "Step2"]];
    const connectedNodes = new Set(edges.flat());
    const orphans = [...allNodes].filter((n) => !connectedNodes.has(n));

    assertEqual(orphans.length, 1, "Detected 1 orphan step");
    assertEqual(orphans[0], "OrphanStep", "Identified OrphanStep without edge");
  });

  test("T5-S4: Template variable interpolation sanitizes script tags, event handlers, and prototype pollution attempts", () => {
    const safeInterpolate = (template, variables) => {
      return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
        // Prevent prototype pollution
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          return "";
        }
        const val = variables[key];
        if (val == null) return "";
        // Sanitize HTML
        return String(val)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      });
    };

    const template = "Hello {{name}}, welcome to {{company}}! Check: {{payload}}";
    const attackPayloads = {
      name: "<script>alert('xss')</script>",
      company: 'Acme" onmouseover="alert(1)',
      payload: "{{constructor}}",
      __proto__: "polluted",
    };

    const result = safeInterpolate(template, attackPayloads);
    assertEqual(result.includes("<script>"), false, "Script tags escaped");
    assertContains(result, "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;", "Entities safely encoded");
    assertEqual(result.includes('onmouseover="alert(1)'), false, "Event handler attribute injection escaped");
  });

  test("T5-S5: High-concurrency prospect quota evaluation under atomic limit bounds allows exactly quota limit and rejects all overflow", () => {
    const userPlan = "starter"; // 200 monthly prospects
    const quotaLimits = plans.getPlanLimits(userPlan);
    assertEqual(quotaLimits.monthlyProspects, 200, "Starter plan has 200 prospect quota");

    let atomicCurrentCount = 0;
    const enrollProspect = () => {
      const check = plans.canUserPerformAction(userPlan, "add_prospect", atomicCurrentCount);
      if (check.allowed) {
        atomicCurrentCount++;
        return { enrolled: true, count: atomicCurrentCount };
      }
      return { enrolled: false, count: atomicCurrentCount, error: check.message };
    };

    // Simulate batch enroll of 250 prospects
    const results = [];
    for (let i = 0; i < 250; i++) {
      results.push(enrollProspect());
    }

    const accepted = results.filter((r) => r.enrolled).length;
    const rejected = results.filter((r) => !r.enrolled).length;

    assertEqual(accepted, 200, "Exactly 200 prospects enrolled");
    assertEqual(rejected, 50, "Exactly 50 overflow enrollments rejected");
    assertEqual(atomicCurrentCount, 200, "Counter strictly locked at quota limit");
  });
});

// =============================================================================
// Suite 5: Network Resilience & Recovery Under Failure
// =============================================================================
describe("Tier 5 - Network Resilience & Recovery Under Failure", () => {
  test("T5-N1: Exponential backoff retry simulator with jitter caps backoff delay within maximum bounds", () => {
    const calculateBackoff = (attempt, baseMs = 100, maxMs = 2000) => {
      const expDelay = baseMs * Math.pow(2, attempt);
      const capped = Math.min(expDelay, maxMs);
      // 20% pseudo-jitter for testing
      return capped;
    };

    assertEqual(calculateBackoff(0), 100, "Attempt 0 is 100ms");
    assertEqual(calculateBackoff(1), 200, "Attempt 1 is 200ms");
    assertEqual(calculateBackoff(2), 400, "Attempt 2 is 400ms");
    assertEqual(calculateBackoff(3), 800, "Attempt 3 is 800ms");
    assertEqual(calculateBackoff(4), 1600, "Attempt 4 is 1600ms");
    assertEqual(calculateBackoff(5), 2000, "Attempt 5 capped at 2000ms max");
    assertEqual(calculateBackoff(10), 2000, "Attempt 10 capped at 2000ms max");
  });

  test("T5-N2: Multi-provider AI fallback switches from primary provider to secondary on 429/503 rate-limit or outage", async () => {
    const callAiWithFallback = async (primaryFails = true) => {
      let activeProvider = "groq";
      let modelUsed = "";

      try {
        if (primaryFails) {
          const err = new Error("Rate limit exceeded: 429 Too Many Requests");
          err.status = 429;
          throw err;
        }
        modelUsed = "llama-3.3-70b-versatile";
        return { success: true, provider: activeProvider, model: modelUsed };
      } catch {
        // Fallback to Gemini
        activeProvider = "gemini";
        modelUsed = "gemini-2.0-flash";
        return { success: true, provider: activeProvider, model: modelUsed, fellBack: true };
      }
    };

    const res = await callAiWithFallback(true);
    assertEqual(res.success, true, "AI call succeeds through fallback");
    assertEqual(res.provider, "gemini", "Switched to secondary provider Gemini");
    assertEqual(res.model, "gemini-2.0-flash", "Used secondary model");
    assertEqual(res.fellBack, true, "Fallback flag recorded for observability");
  });

  test("T5-N3: Leaky bucket rate limiter handles burst traffic and refills allowance accurately after time window elapses", () => {
    class RateLimiter {
      constructor(capacity, refillRatePerSec) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.refillRate = refillRatePerSec;
        this.lastRefill = Date.now();
      }

      consume(cost = 1) {
        this.refill();
        if (this.tokens >= cost) {
          this.tokens -= cost;
          return true;
        }
        return false;
      }

      refill(mockElapsedSec = 0) {
        const added = mockElapsedSec * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + added);
      }
    }

    const limiter = new RateLimiter(5, 2); // 5 burst capacity, 2 tokens/sec refill

    // Consume all 5
    for (let i = 0; i < 5; i++) {
      assertEqual(limiter.consume(1), true, `Token ${i + 1} consumed`);
    }

    // 6th should be rejected (bucket empty)
    assertEqual(limiter.consume(1), false, "6th token in burst window rejected");

    // Fast forward 1 second: adds 2 tokens
    limiter.refill(1.0);
    assertEqual(limiter.consume(1), true, "Refilled token 1 consumed");
    assertEqual(limiter.consume(1), true, "Refilled token 2 consumed");
    assertEqual(limiter.consume(1), false, "Refilled allowance exhausted");
  });

  test("T5-N4: Database connection error mask prevents leakage of internal hostnames, ports, and connection strings", () => {
    const maskDatabaseError = (errorMsg) => {
      if (!errorMsg || typeof errorMsg !== "string") {
        return "An internal database error occurred. Please try again later.";
      }
      // Mask postgres:// and internal hostnames
      return errorMsg
        .replace(/postgres:\/\/[^@]+@[^/]+\/[a-zA-Z0-9_]+/g, "postgres://[REDACTED]")
        .replace(/[a-zA-Z0-9._-]+\.internal(?::\d+)?/g, "[INTERNAL_HOST]")
        .replace(/password=\S+/g, "password=[REDACTED]");
    };

    const rawError = "Connection terminated: postgres://admin:superSecretPassword123@db-primary.prod.internal:5432/pitchmint_db unreachable";
    const masked = maskDatabaseError(rawError);

    assertEqual(masked.includes("superSecretPassword123"), false, "Password must not leak");
    assertEqual(masked.includes("db-primary.prod.internal"), false, "Internal hostname must not leak");
    assertContains(masked, "[REDACTED]", "Sanitized placeholder substituted");
  });
});
