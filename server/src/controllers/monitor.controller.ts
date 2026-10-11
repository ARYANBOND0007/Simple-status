import type { Request, Response, NextFunction } from "express";

import { createMonitorSchema } from "../schemas/monitor.schemas.js"
import { createMonitor } from "../services/monitor.service.js";

export async function createMonitorController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.orgMember) {
  return res.status(403).json({
    message: "Organization membership required",
  });
}
    const result = createMonitorSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid monitor details",
        errors: result.error.flatten(),
      });
    }

    const { name, url, intervalSeconds } = result.data;


    // Get organization ID from authentication middleware
    const organizationId = req.orgMember.organizationId;

    const monitor = await createMonitor({
      name,
      url,
      intervalSeconds,
      organizationId,
    });

    return res.status(201).json({
      message: "Monitor created successfully",
      monitor,
    });
  } catch (error) {
    next(error);
  }
}