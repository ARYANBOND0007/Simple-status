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
//create monitor
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
};
//delete monitor

export async function deleteMonitor(
  id: string,
  organizationId: string
) {
  return prisma.monitor.deleteMany({
    where: {
      id: id,
      organizationId,
    },
  });
}
// get all monitors
export async function getAllMonitors(organizationId: string) {
  return prisma.monitor.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function updateMonitor(
  monitorId: string,
  organizationId: string,
  data: {
    name?: string;
    url?: string;
    intervalSeconds?: number;
  }
) {
  if (data.url !== undefined) {
    const ssrfCheck = await validateMonitorUrl(data.url);

    if (!ssrfCheck.valid) {
      throw new AppError(
        ssrfCheck.error ?? "Invalid URL destination",
        400
      );
    }
  }

  return prisma.monitor.updateMany({
    where: {
      id: monitorId,
      organizationId,
    },
    data,
  });
}