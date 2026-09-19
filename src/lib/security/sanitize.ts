/**
 * PostgREST & Query Input Sanitization (SEC-06)
 *
 * Sanitizes search terms and filter parameters to prevent:
 * - PostgREST filter injection (operator altering via commas, parentheses, dots)
 * - Wildcard expansion abuse (% and _)
 * - Null byte injection
 * - SQL meta-character disruption
 */

export function sanitizePostgrestSearch(input: string | null | undefined): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[';%_\\]/g, "") // Strip SQL wildcard and delimiter characters
    .replace(/[,()."{}]/g, " ") // PostgREST logical operators and groupers
    .replace(/[\u0000-\u001F\u007F]/g, "") // Control characters
    .trim()
    .slice(0, 100); // Limit maximum query length
}

/**
 * Escapes PostgREST query delimiter characters (, and parens) to prevent query injection.
 */
export function escapePostgrestFilter(input: string | null | undefined): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/\0/g, "")
    .replace(/[,()]/g, "\\$&")
    .trim()
    .slice(0, 100);
}

export function sanitizeCsvFormula(value: string | null | undefined): string {
  if (!value || typeof value !== "string") {
    return value || "";
  }

  // Neutralize CSV formula injection (DDE attacks)
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }

  return value;
}
