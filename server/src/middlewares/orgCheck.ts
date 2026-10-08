import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";

export const requireOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string") {
      return res.status(400).json({
        message: "Invalid organization ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const membership = await prisma.orgMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: organizationId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this organization",
      });
    }

    req.orgMember = membership;

    next();
  } catch (error) {
    next(error);
  }
};