import { validateMonitorUrl } from "./ssrfGuard";

export async function pingWebsite(url:string) {
    const controller = new AbortController();
    
    const timeout = setInterval(() => {
        controller.abort();
    },10000);

      const ssrfCheck = await validateMonitorUrl(url);

  if (!ssrfCheck.valid) {
    return {
      isUp: false,
      statusCode: null,
      error: "SSRF_BLOCKED",
    };
  }
    
}