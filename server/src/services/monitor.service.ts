import {prisma}  from "../config/prisma.js"

import { createMonitorSchema } from "../schemas/monitor.schemas.js"
import { validateMonitorUrl } from "../utils/ssrfGuard.js";
import { AppError } from "../errors/AppError.js";

interface CreateMonitorInput {
  name: string;
  url: string;
  intervalSeconds: number;
  organizationId: string;
}

export async function createMonitor(input: CreateMonitorInput) {
     const ssrfCheck = await validateMonitorUrl(input.url);

  if (!ssrfCheck.valid) {
    throw new AppError(
      ssrfCheck.error ?? "Invalid URL destination",
      400
    );
  }
  return prisma.monitor.create({
    data: {
      name: input.name,
      url: input.url,
      intervalSeconds: input.intervalSeconds,
      organization: {
        connect: {
          id: input.organizationId,
        },
      },
    },
  });
}