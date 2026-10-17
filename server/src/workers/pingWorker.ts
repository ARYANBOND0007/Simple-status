import http from "http";
import https from "https";
import dns from "dns";
import axios, { AxiosInstance } from "axios";
import { isPrivateOrReservedIP } from "../utils/ssrfGuard";

function ssrfSafeLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string | dns.LookupAddress[],
    family?: number
  ) => void
) {
  dns.lookup(hostname, options, (err, address, family) => {
    // DNS resolution itself failed
    if (err) {
      return callback(err, address, family);
    }

    // Case 1: DNS returned multiple addresses
    if (Array.isArray(address)) {
      for (const addr of address) {
        if (isPrivateOrReservedIP(addr.address)) {
          const ssrfError = new Error(
            `SSRF Blocked: IP ${addr.address} is forbidden.`
          ) as NodeJS.ErrnoException;

          ssrfError.code = "ERR_SSRF_PROHIBITED";

          return callback(ssrfError, address, family);
        }
      }

      // All addresses are safe
      return callback(null, address, family);
    }

    // Case 2: DNS returned a single address
    if (isPrivateOrReservedIP(address)) {
      const ssrfError = new Error(
        `SSRF Blocked: IP ${address} is forbidden.`
      ) as NodeJS.ErrnoException;

      ssrfError.code = "ERR_SSRF_PROHIBITED";

      return callback(ssrfError, address, family);
    }

    // Single address is safe
    return callback(null, address, family);
  });
}

// HTTP agent using our custom DNS lookup
const safeHttpAgent = new http.Agent({
  lookup: ssrfSafeLookup,
});

// HTTPS agent using our custom DNS lookup
const safeHttpsAgent = new https.Agent({
  lookup: ssrfSafeLookup,
});

// Axios client
export const safeHttpClient: AxiosInstance = axios.create({
  httpAgent: safeHttpAgent,
  httpsAgent: safeHttpsAgent,

  // Don't allow a request to hang forever
  timeout: 10000,

  // Limit redirect chain
  maxRedirects: 3,

  // Treat every HTTP status as a valid response
  validateStatus: () => true,
});

// Handle SSRF errors cleanly
safeHttpClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.code === "ERR_SSRF_PROHIBITED") {
      return Promise.reject(
        new Error(
          "Request rejected: Target resolved to an internal address."
        )
      );
    }

    return Promise.reject(error);
  }
);