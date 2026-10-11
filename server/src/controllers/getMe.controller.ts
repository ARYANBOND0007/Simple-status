import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { prisma } from "../config/prisma.js";


export const getMe = async (req:Request,res:Response,next : NextFunction) => {

    try {
         if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
       const user = await prisma.user.findUnique({
  where: {
    id: req.user.id,
  },
  select: {
    id: true,
    email: true,
    fullName: true,
    memberships: {
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  },
});
          if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
    }
