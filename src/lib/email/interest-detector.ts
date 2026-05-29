/**
 * Interest Detection Engine — Multi-Signal Prospect Interest Scoring
 *
 * Since Gmail read scopes (gmail.readonly / gmail.metadata) are classified
 * as Restricted by Google and require a paid CASA Tier 2 security assessment,
 * this engine detects prospect interest using ONLY engagement metadata signals
 * available through our own tracking infrastructure:
 *
 * SIGNALS USED:
 * ─────────────────────────────────────────────────────────────────
 * 1. Open tracking     — tracking pixel fires (count, timing, recency)
 * 2. Click tracking    — link redirect fires (count, which links, velocity)
 * 3. Temporal patterns — time-to-open, reopening intervals, day/hour
 * 4. Behavioral decay  — engagement freshness (recent > old)
 * 5. Cross-email       — engagement across multiple emails in a sequence
 * 6. Manual flags      — user-confirmed replies
 * ─────────────────────────────────────────────────────────────────
 *
 * Output: A composite interest score (0–100) and a level:
 *   - 🔥 HOT   (70–100): Prospect is highly engaged, prioritize follow-up
 *   - 🟠 WARM  (40–69):  Prospect shows interest, keep nurturing
 *   - 🟡 COOL  (20–39):  Minimal engagement, may need a new angle
 *   - ❄️ COLD  (0–19):   No engagement, consider removing from sequence
 */

// ── Types ──────────────────────────────────────────────────────────

export type InterestLevel = "hot" | "warm" | "cool" | "cold";

export type InterestSignal = {
  name: string;
  weight: number;
  description: string;
  raw_value: string | number;
};

export type InterestResult = {
  score: number;           // 0–100
  level: InterestLevel;
  signals: InterestSignal[];
  summary: string;         // Human-readable summary
  recommended_action: string;
  should_stop_sequence: boolean;
  should_prioritize: boolean;
  confidence: number;      // 0–1
};

export type EmailEngagementData = {
  id: string;
  prospect_id: string | null;
  user_id: string;
  subject: string | null;
  to_email: string;

  // Open tracking
  open_count: number;
  first_opened_at: string | null;
  last_opened_at: string | null;

  // Click tracking
  click_count: number;
  first_clicked_at: string | null;

  // Send timing
  sent_at: string | null;
  scheduled_at: string | null;

  // Reply data
  has_reply: boolean;
  reply_received_at: string | null;
  reply_category: string | null;

  // Status
  status: string;
};

export type ProspectEngagementContext = {
  total_emails_sent: number;
  total_opens: number;
  total_clicks: number;
  emails: EmailEngagementData[];
};

// ── Core Engine ────────────────────────────────────────────────────

/**
 * Compute interest score for a single email
 */
export function scoreEmailEngagement(email: EmailEngagementData): InterestResult {
  const signals: InterestSignal[] = [];
  let totalScore = 0;

  const now = Date.now();

  // ──────────────────────────────────────────────────────────────
  // Signal 1: EMAIL OPENS
  // ──────────────────────────────────────────────────────────────

  if (email.open_count > 0) {
    // Base open signal
    let openScore = 10;
    let description = `Opened ${email.open_count}x`;

    // Multiple reopens = strong signal (they're coming back to re-read)
    if (email.open_count >= 5) {
      openScore = 25;
      description = `Opened ${email.open_count}x — highly engaged, keeps coming back`;
    } else if (email.open_count >= 3) {
      openScore = 20;
      description = `Opened ${email.open_count}x — re-reading multiple times`;
    } else if (email.open_count >= 2) {
      openScore = 15;
      description = `Opened ${email.open_count}x — came back to re-read`;
    }

    signals.push({
      name: "email_opens",
      weight: openScore,
      description,
      raw_value: email.open_count,
    });
    totalScore += openScore;
  }

  // ──────────────────────────────────────────────────────────────
  // Signal 2: LINK CLICKS (strongest non-reply signal)
  // ──────────────────────────────────────────────────────────────

  if (email.click_count > 0) {
    let clickScore = 20;
    let description = `Clicked ${email.click_count} link(s)`;

    if (email.click_count >= 3) {
      clickScore = 35;
      description = `Clicked ${email.click_count} links — exploring multiple resources`;
    } else if (email.click_count >= 2) {
      clickScore = 28;
      description = `Clicked ${email.click_count} links — actively exploring`;
    }

    signals.push({
      name: "link_clicks",
      weight: clickScore,
      description,
      raw_value: email.click_count,
    });
    totalScore += clickScore;
  }

  // ──────────────────────────────────────────────────────────────
  // Signal 3: TIME-TO-OPEN (intent urgency)
  // ──────────────────────────────────────────────────────────────

  if (email.first_opened_at && email.sent_at) {
    const sentMs = new Date(email.sent_at).getTime();
    const openedMs = new Date(email.first_opened_at).getTime();
    const hoursToOpen = (openedMs - sentMs) / (1000 * 60 * 60);

    if (hoursToOpen <= 0.5) {
      // Within 30 minutes — very high priority
      signals.push({
        name: "rapid_open",
        weight: 15,
        description: `Opened within ${Math.round(hoursToOpen * 60)} minutes — immediate attention`,
        raw_value: hoursToOpen,
      });
      totalScore += 15;
    } else if (hoursToOpen <= 2) {
      signals.push({
        name: "quick_open",
        weight: 12,
        description: `Opened within ${Math.round(hoursToOpen * 10) / 10} hours — high priority inbox`,
        raw_value: hoursToOpen,
      });
      totalScore += 12;
    } else if (hoursToOpen <= 6) {
      signals.push({
        name: "same_day_open",
        weight: 8,
        description: `Opened within ${Math.round(hoursToOpen)} hours`,
        raw_value: hoursToOpen,
      });
      totalScore += 8;
    } else if (hoursToOpen <= 24) {
      signals.push({
        name: "next_day_open",
        weight: 4,
        description: `Opened within 24 hours`,
        raw_value: hoursToOpen,
      });
      totalScore += 4;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Signal 4: OPEN-TO-CLICK VELOCITY (quick action = high intent)
  // ──────────────────────────────────────────────────────────────

  if (email.first_opened_at && email.first_clicked_at) {
    const openMs = new Date(email.first_opened_at).getTime();
    const clickMs = new Date(email.first_clicked_at).getTime();
    const minutesToClick = (clickMs - openMs) / (1000 * 60);

    if (minutesToClick <= 2) {
      signals.push({
        name: "instant_click",
        weight: 12,
        description: `Clicked within ${Math.round(minutesToClick * 60)} seconds of opening — immediate action`,
        raw_value: minutesToClick,
      });
      totalScore += 12;
    } else if (minutesToClick <= 10) {
      signals.push({
        name: "quick_click",
        weight: 8,
        description: `Clicked within ${Math.round(minutesToClick)} minutes of opening`,
        raw_value: minutesToClick,
      });
      totalScore += 8;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Signal 5: RECENCY DECAY (recent engagement > old)
  // ──────────────────────────────────────────────────────────────

  const lastEngagementAt = email.last_opened_at || email.first_opened_at || email.first_clicked_at;
  if (lastEngagementAt) {
    const lastMs = new Date(lastEngagementAt).getTime();
    const daysSinceEngagement = (now - lastMs) / (1000 * 60 * 60 * 24);

    if (daysSinceEngagement <= 1) {
      signals.push({
        name: "fresh_engagement",
        weight: 10,
        description: `Engaged today — very fresh`,
        raw_value: daysSinceEngagement,
      });
      totalScore += 10;
    } else if (daysSinceEngagement <= 3) {
      signals.push({
        name: "recent_engagement",
        weight: 6,
        description: `Engaged within ${Math.round(daysSinceEngagement)} days`,
        raw_value: daysSinceEngagement,
      });
      totalScore += 6;
    } else if (daysSinceEngagement > 14) {
      // Stale engagement — reduce score
      const decay = Math.min(15, Math.floor(daysSinceEngagement / 7) * 3);
      signals.push({
        name: "stale_engagement",
        weight: -decay,
        description: `Last engagement ${Math.round(daysSinceEngagement)} days ago — interest may have faded`,
        raw_value: daysSinceEngagement,
      });
      totalScore -= decay;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Signal 6: RE-OPEN PATTERN (opened, left, came back)
  // ──────────────────────────────────────────────────────────────

  if (email.first_opened_at && email.last_opened_at && email.open_count >= 2) {
    const firstOpenMs = new Date(email.first_opened_at).getTime();
    const lastOpenMs = new Date(email.last_opened_at).getTime();
    const hoursBetween = (lastOpenMs - firstOpenMs) / (1000 * 60 * 60);

    if (hoursBetween >= 24) {
      // Came back after a day+ — strong revisit signal
      signals.push({
        name: "multi_day_revisit",
        weight: 12,
        description: `Revisited email after ${Math.round(hoursBetween / 24)} day(s) — persistent interest`,
        raw_value: hoursBetween,
      });
      totalScore += 12;
    } else if (hoursBetween >= 4) {
      signals.push({
        name: "same_day_revisit",
        weight: 6,
        description: `Revisited email after ${Math.round(hoursBetween)} hours`,
        raw_value: hoursBetween,
      });
      totalScore += 6;
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Signal 7: MANUAL REPLY CONFIRMATION (highest confidence)
  // ──────────────────────────────────────────────────────────────

  if (email.has_reply) {
    signals.push({
      name: "reply_confirmed",
      weight: 40,
      description: "Reply manually confirmed by user",
      raw_value: 1,
    });
    totalScore += 40;
  }

  // ── Compute final result ───────────────────────────────────────

  // Clamp score to 0–100
  const finalScore = Math.max(0, Math.min(100, totalScore));

  // Determine interest level
  const level: InterestLevel =
    finalScore >= 70 ? "hot" :
    finalScore >= 40 ? "warm" :
    finalScore >= 20 ? "cool" :
    "cold";

  // Confidence based on number and strength of signals
  const nonReplySignals = signals.filter(s => s.name !== "reply_confirmed");
  const confidence = email.has_reply ? 0.95 :
    nonReplySignals.length >= 4 ? 0.85 :
    nonReplySignals.length >= 3 ? 0.75 :
    nonReplySignals.length >= 2 ? 0.60 :
    nonReplySignals.length >= 1 ? 0.40 :
    0.10;

  // Generate summary and action
  const { summary, recommended_action, should_stop_sequence, should_prioritize } =
    generateRecommendation(level, signals, email);

  return {
    score: finalScore,
    level,
    signals,
    summary,
    recommended_action,
    should_stop_sequence,
    should_prioritize,
    confidence,
  };
}

/**
 * Compute aggregate interest score for a prospect across ALL their emails
 */
export function scoreProspectEngagement(
  context: ProspectEngagementContext
): InterestResult {
  if (!context.emails.length) {
    return {
      score: 0,
      level: "cold",
      signals: [],
      summary: "No emails sent yet",
      recommended_action: "Send first outreach email",
      should_stop_sequence: false,
      should_prioritize: false,
      confidence: 0,
    };
  }

  // Score each email individually
  const emailScores = context.emails.map(e => scoreEmailEngagement(e));

  // Use the best individual email score as the base
  const bestScore = Math.max(...emailScores.map(s => s.score));

  // ── Cross-email signals ──────────────────────────────────────

  const allSignals: InterestSignal[] = [];
  let crossBonus = 0;

  // Multi-email engagement: engaged with more than one email in sequence
  const engagedEmails = context.emails.filter(e => e.open_count > 0);
  if (engagedEmails.length >= 3) {
    allSignals.push({
      name: "multi_email_engagement",
      weight: 15,
      description: `Engaged with ${engagedEmails.length} of ${context.emails.length} emails — consistent interest`,
      raw_value: engagedEmails.length,
    });
    crossBonus += 15;
  } else if (engagedEmails.length >= 2) {
    allSignals.push({
      name: "repeat_engagement",
      weight: 10,
      description: `Engaged with ${engagedEmails.length} of ${context.emails.length} emails`,
      raw_value: engagedEmails.length,
    });
    crossBonus += 10;
  }

  // Increasing engagement: later emails get more engagement
  if (context.emails.length >= 2) {
    const sortedBySent = [...context.emails]
      .filter(e => e.sent_at)
      .sort((a, b) => new Date(a.sent_at!).getTime() - new Date(b.sent_at!).getTime());

    if (sortedBySent.length >= 2) {
      const firstHalf = sortedBySent.slice(0, Math.floor(sortedBySent.length / 2));
      const secondHalf = sortedBySent.slice(Math.floor(sortedBySent.length / 2));

      const firstHalfEngagement = firstHalf.reduce((s, e) => s + e.open_count + e.click_count * 2, 0);
      const secondHalfEngagement = secondHalf.reduce((s, e) => s + e.open_count + e.click_count * 2, 0);

      if (secondHalfEngagement > firstHalfEngagement * 1.5) {
        allSignals.push({
          name: "increasing_engagement",
          weight: 8,
          description: "Engagement increasing over time — growing interest",
          raw_value: secondHalfEngagement - firstHalfEngagement,
        });
        crossBonus += 8;
      } else if (firstHalfEngagement > secondHalfEngagement * 2 && firstHalfEngagement > 0) {
        allSignals.push({
          name: "declining_engagement",
          weight: -5,
          description: "Engagement declining — interest may be fading",
          raw_value: firstHalfEngagement - secondHalfEngagement,
        });
        crossBonus -= 5;
      }
    }
  }

  // Total click volume across all emails
  const totalClicks = context.emails.reduce((s, e) => s + e.click_count, 0);
  if (totalClicks >= 5) {
    allSignals.push({
      name: "high_click_volume",
      weight: 10,
      description: `${totalClicks} total clicks across all emails — deep exploration`,
      raw_value: totalClicks,
    });
    crossBonus += 10;
  }

  // Compute aggregate score
  const aggregateScore = Math.max(0, Math.min(100, bestScore + crossBonus));

  // Get the best email result's signals and merge with cross-email signals
  const bestResult = emailScores.reduce((best, curr) => 
    curr.score > best.score ? curr : best
  );

  const mergedSignals = [...bestResult.signals, ...allSignals];

  const level: InterestLevel =
    aggregateScore >= 70 ? "hot" :
    aggregateScore >= 40 ? "warm" :
    aggregateScore >= 20 ? "cool" :
    "cold";

  const confidence = mergedSignals.length >= 5 ? 0.90 :
    mergedSignals.length >= 3 ? 0.75 :
    mergedSignals.length >= 1 ? 0.50 :
    0.10;

  const { summary, recommended_action, should_stop_sequence, should_prioritize } =
    generateRecommendation(level, mergedSignals, context.emails[0]);

  return {
    score: aggregateScore,
    level,
    signals: mergedSignals,
    summary,
    recommended_action,
    should_stop_sequence,
    should_prioritize,
    confidence,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function generateRecommendation(
  level: InterestLevel,
  signals: InterestSignal[],
  _email: EmailEngagementData,
): {
  summary: string;
  recommended_action: string;
  should_stop_sequence: boolean;
  should_prioritize: boolean;
} {
  const positiveSignals = signals
    .filter(s => s.weight > 0)
    .map(s => s.description);

  switch (level) {
    case "hot":
      return {
        summary: `🔥 Hot lead — ${positiveSignals.slice(0, 3).join(", ")}`,
        recommended_action: "Send a personalized follow-up immediately. Consider a direct CTA (meeting link, demo booking). This prospect is actively evaluating your offer.",
        should_stop_sequence: signals.some(s => s.name === "reply_confirmed"),
        should_prioritize: true,
      };
    case "warm":
      return {
        summary: `🟠 Warming up — ${positiveSignals.slice(0, 2).join(", ")}`,
        recommended_action: "Continue the sequence with stronger value propositions. Add a case study or social proof. This prospect is showing early interest.",
        should_stop_sequence: false,
        should_prioritize: true,
      };
    case "cool":
      return {
        summary: `🟡 Cool — ${positiveSignals.slice(0, 2).join(", ") || "minimal engagement"}`,
        recommended_action: "Try a completely different angle or subject line. The current approach may not be resonating. Consider a breakup email.",
        should_stop_sequence: false,
        should_prioritize: false,
      };
    case "cold":
      return {
        summary: "❄️ Cold — no meaningful engagement detected",
        recommended_action: "Review if this prospect is in your target audience. Consider removing from sequence to preserve sender reputation.",
        should_stop_sequence: false,
        should_prioritize: false,
      };
  }
}

/**
 * Format interest result as a readable string for the email reply_body field
 */
export function formatInterestSummary(result: InterestResult): string {
  const signalList = result.signals
    .filter(s => s.weight > 0)
    .map(s => s.description)
    .join(", ");

  return `[Interest: ${result.score}/100 ${result.level.toUpperCase()}] ${signalList || "No engagement signals"}`;
}

/**
 * Map interest level to reply_category and reply_sentiment for DB storage
 */
export function mapInterestToReplyFields(result: InterestResult): {
  reply_category: string;
  reply_sentiment: string;
} {
  if (result.signals.some(s => s.name === "reply_confirmed")) {
    return { reply_category: "interested", reply_sentiment: "positive" };
  }

  switch (result.level) {
    case "hot":
      return { reply_category: "engaged", reply_sentiment: "positive" };
    case "warm":
      return { reply_category: "warming_up", reply_sentiment: "neutral" };
    case "cool":
      return { reply_category: "low_engagement", reply_sentiment: "neutral" };
    case "cold":
    default:
      return { reply_category: "no_engagement", reply_sentiment: "neutral" };
  }
}

/**
 * Map interest level to prospect status
 */
export function mapInterestToProspectStatus(
  result: InterestResult,
  currentStatus: string,
): string | null {
  // Never downgrade these high-value statuses
  const protectedStatuses = ["interested", "meeting_booked", "replied", "unsubscribed"];
  if (protectedStatuses.includes(currentStatus)) return null;

  switch (result.level) {
    case "hot":
      return result.signals.some(s => s.name === "reply_confirmed")
        ? "replied"
        : "interested";
    case "warm":
      // Only upgrade from "new" or "contacted"
      return ["new", "contacted"].includes(currentStatus) ? "opened" : null;
    default:
      return null;
  }
}
