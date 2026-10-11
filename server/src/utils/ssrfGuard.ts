import dns from "dns/promises";
import ipaddr from "ipaddr.js";



export function isPrivateOrReservedIP(ipString: string): boolean {
  try {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();

    // Block all non-unicast/private ranges
    const blockedRanges = [
      "unspecified",      // 0.0.0.0/8, ::/128
      "broadcast",        // 255.255.255.255/32
      "multicast",        // 224.0.0.0/4, ff00::/8
      "linkLocal",        // 169.254.0.0/16, fe80::/10 (AWS/GCP metadata!)
      "loopback",         // 127.0.0.0/8, ::1/128 (localhost)
      "private",          // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
      "carrierGradeNat",  // 100.64.0.0/10
      "reserved",
    ];

    return blockedRanges.includes(range);
  } catch {
    // If it cannot be parsed as a valid IP, treat as dangerous
    return true;
  }
}

/**
 * Validates URLs at creation time
 */
export async function validateMonitorUrl(rawUrl: string): Promise<{ valid: boolean; error?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, error: "Malformed URL format." };
  }

  // 1. Enforce HTTP/HTTPS only (block file://, gopher://, ftp://)
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Only HTTP and HTTPS protocols are permitted." };
  }

  // 2. Reject credentials in URL (e.g., http://admin:pass@example.com)
  if (parsed.username || parsed.password) {
    return { valid: false, error: "Embedded credentials in URLs are not allowed." };
  }

  // 3. Reject bare 'localhost' hostname immediately
  if (parsed.hostname.toLowerCase() === "localhost") {
    return { valid: false, error: "Cannot monitor localhost." };
  }

  // 4. Resolve DNS and check all returned records
  try {
    const addresses = await dns.lookup(parsed.hostname, { all: true });

    for (const record of addresses) {
      if (isPrivateOrReservedIP(record.address)) {
        return { valid: false, error: "URL resolves to a restricted internal or private address." };
      }
    }
  } catch (err: any) {
    return { valid: false, error: `Could not resolve domain: ${err.message}` };
  }

  return { valid: true };
}