import type { Request, Response, NextFunction } from "express";

import { createMonitorSchema,updateMonitorSchema } from "../schemas/monitor.schemas.js"
import { createMonitor,deleteMonitor,updateMonitor } from "../services/monitor.service.js";

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

export async function deleteMonitorController(
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

    const { id } = req.params;

if (typeof id !== "string") {
  return res.status(400).json({
    message: "Invalid monitor ID",
  });
}
    const organizationId = req.orgMember.organizationId;

    const result = await deleteMonitor(
       id,
      organizationId
    );

    if (result.count === 0) {
      return res.status(404).json({
        message: "Monitor not found",
      });
    }

    return res.status(200).json({
      message: "Monitor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMonitorController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Validate organization membership
    if (!req.orgMember) {
      return res.status(403).json({
        message: "Organization membership required",
      });
    }

    // 2. Validate request body
    const result = updateMonitorSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid monitor details",
        errors: result.error.flatten(),
      });
    }

    // 3. Get validated fields
    const { name, url, intervalSeconds } = result.data;

    // 4. Get monitor ID from URL
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid monitor ID",
      });
    }

    // 5. Get verified organization ID
    const organizationId = req.orgMember.organizationId;

    // 6. Update monitor
    const updateResult = await updateMonitor(
      id,
      organizationId,
     { name, url, intervalSeconds }
    );

    if (updateResult.count === 0) {
      return res.status(404).json({
        message: "Monitor not found",
      });
    }

    return res.status(200).json({
      message: "Monitor updated successfully",
    });
  } catch (error) {
    next(error);
  }
}
