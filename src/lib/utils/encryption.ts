import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const [ivHex, authTagHex, encrypted] = parts;

  if (
    !ivHex ||
    !authTagHex ||
    ivHex.length !== IV_LENGTH * 2 ||
    authTagHex.length !== AUTH_TAG_LENGTH * 2 ||
    encrypted === undefined
  ) {
    throw new Error("Invalid encrypted text format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Transparently decrypts AES-256-GCM tokens with backward-compatible fallback.
 * If token is already plaintext (legacy) or decryption fails, returns token as-is.
 */
export function safeDecrypt(token: string | null | undefined): string | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(":");
  if (
    parts.length === 3 &&
    parts[0].length === IV_LENGTH * 2 &&
    parts[1].length === AUTH_TAG_LENGTH * 2 &&
    /^[0-9a-fA-F]+$/.test(parts[0]) &&
    /^[0-9a-fA-F]+$/.test(parts[1])
  ) {
    try {
      return decrypt(token);
    } catch {
      // Fallback: return token directly if decryption fails
      return token;
    }
  }

  // Not in encrypted format — legacy plaintext token
  return token;
}

/**
 * Safely encrypts a secret with AES-256-GCM, returning the encrypted text,
 * or the plaintext if ENCRYPTION_KEY is not configured in non-production environments.
 */
export function safeEncrypt(text: string | null | undefined): string | null {
  if (text === null || text === undefined) return null;
  try {
    return encrypt(text);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Encryption] ENCRYPTION_KEY missing in non-production - using plaintext fallback", err);
      return text;
    }
    throw err;
  }
}
