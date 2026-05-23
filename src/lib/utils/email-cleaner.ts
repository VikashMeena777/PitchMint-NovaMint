/**
 * Cleans an email body to only show the actual reply, stripping out
 * quoted threads, signatures, and headers.
 */
export function cleanEmailReply(body: string | null): string {
  if (!body) return "";

  // Normalize line endings
  let text = body.replace(/\r\n/g, "\n");

  // Patterns that usually mark the beginning of quoted text or email threads
  const quoteIndicators = [
    /^\s*On\s+.*\s+wrote:$/im, // On Sun, Jan 1, 2026 at 10:00 AM User <user@example.com> wrote:
    /^\s*On\s+.*wrote:\s*$/im,
    /^-+\s*Original Message\s*-+/im, // -----Original Message-----
    /^\s*From:\s*/im, // From: User <user@example.com>
    /^\s*To:\s*/im,
    /^\s*Sent:\s*/im,
    /^\s*Date:\s*/im,
    /^\s*Subject:\s*/im,
    /^-+\s*Forwarded message\s*-+/im, // ---------- Forwarded message ---------
    /^\s*_+\s*$/m, // ________________________________
    /^\s*>\s*/m, // Quoted lines starting with >
  ];

  let splitIndex = text.length;

  for (const regex of quoteIndicators) {
    const match = text.match(regex);
    if (match && match.index !== undefined && match.index < splitIndex) {
      splitIndex = match.index;
    }
  }

  // Slice off the quoted part
  let cleanText = text.substring(0, splitIndex).trim();

  // Strip trailing "On [date], [name] <[email]>:" if it wasn't matched fully by the regex
  cleanText = cleanText.replace(/On\s+[^:\n]+wrote:\s*$/i, "").trim();
  cleanText = cleanText.replace(/On\s+[^:\n]+at\s+[^:\n]+wrote:\s*$/i, "").trim();

  // Strip any trailing signature separators like "--" or "-- "
  cleanText = cleanText.replace(/\n--\s*$/i, "").trim();

  return cleanText || body; // Fallback to original body if cleaning resulted in empty string
}
