import { createMonitorSchema } from "../schemas/monitor.schemas";
import { Prisma } from "../../generated/prisma/client";
import { validateMonitorUrl } from "../utils/ssrfGuard";
import { safeHttpClient } from "../workers/pingWorker";
import { Url } from "url";
import axios from "axios";

;

export async function pingWebsite(monitorUrl: string) {
    validateMonitorUrl(monitorUrl);

    const response = await safeHttpClient.get(monitorUrl);

    return {
        responseStatus: response.status,
    };
}