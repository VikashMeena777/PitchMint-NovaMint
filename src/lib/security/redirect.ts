/**
 * Redirect URL Security Validation (SEC-01)
 *
 * Enforces strict validation on open redirect vectors:
 * - Rejects non-HTTP(S) schemes (e.g. javascript:, data:, file:)
 * - Prevents protocol-relative bypasses (//evil.com, /\\evil.com)
 * - Guards against SSRF via private IP / localhost redirection
 * - Allows verified safe relative paths and valid public external domains
 */

const PRIVATE_IP_REGEX = /^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|169\.254\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|localhost)$/i;

export function isSafeRedirectUrl(urlStr: string | null | undefined): boolean {
  if (!urlStr || typeof urlStr !== "string") {
    return false;
  }

  const trimmed = urlStr.trim();
  if (!trimmed) return false;

  // Null byte injection check
  if (trimmed.includes("\0")) {
    return false;
  }

  // Safe relative path: starts with single '/', not followed by '/' or '\'
  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("/\\\\")) {
      return false;
    }
    // Disallow control characters in path
    if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
      return false;
    }
    return true;
  }

  // Absolute URL validation
  try {
    const parsed = new URL(trimmed);

    // Protocol must strictly be http: or https: (blocks javascript:, data:, vbscript:, etc.)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check for SSRF / loopback / private IP bypass
    const isLocalhost =
      hostname === "localhost" ||
      hostname.endsWith(".localhost");

    if (isLocalhost) {
      // In local development, localhost web dev server is allowed for testing
      const port = parsed.port;
      const isDangerousPort = ["5432", "6379", "27017", "9200", "22", "25", "3306"].includes(port);
      if (isDangerousPort) return false;
      return process.env.NODE_ENV !== "production";
    }

    // IP addresses, link-local cloud metadata (169.254.x.x), and private LAN ranges are strictly forbidden
    if (
      hostname.endsWith(".local") ||
      PRIVATE_IP_REGEX.test(hostname)
    ) {
      return false;
    }

    // Require valid domain name with at least one dot
    if (!hostname.includes(".") && hostname !== "localhost") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function getSafeRedirectUrl(
  urlStr: string | null | undefined,
  fallbackUrl: string = "/"
): string {
  if (urlStr && isSafeRedirectUrl(urlStr)) {
    return urlStr.trim();
  }
  return fallbackUrl;
}
