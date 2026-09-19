import crypto from "crypto";

/**
 * Unsubscribe HMAC Signature Verification (SEC-02)
 *
 * Generates and verifies HMAC-SHA256 signed tokens for CAN-SPAM compliant
 * unsubscribe links, preventing parameter tampering and unauthorized opt-outs.
 */

function getUnsubscribeSecret(): string {
  return (
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.ENCRYPTION_KEY ||
    "pitchmint_unsubscribe_salt_secret_2026"
  );
}

export function generateUnsubscribeToken(
  prospectId: string,
  userId: string
): string {
  const secret = getUnsubscribeSecret();
  const payload = `${prospectId}:${userId}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyUnsubscribeToken(
  token: string | null | undefined,
  prospectId: string,
  userId: string
): boolean {
  if (!token || typeof token !== "string" || !prospectId || !userId) {
    return false;
  }

  const expectedToken = generateUnsubscribeToken(prospectId, userId);

  try {
    const tokenBuf = Buffer.from(token.trim(), "hex");
    const expectedBuf = Buffer.from(expectedToken, "hex");

    if (tokenBuf.length === 0 || tokenBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}
