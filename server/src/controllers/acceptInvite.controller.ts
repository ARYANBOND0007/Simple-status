import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as invitationService from "../services/acceptInvite.service.js";



export const acceptInvite = async (req: Request, res: Response, next:NextFunction) => {
  try {
    const { token, fullName, password } = req.body;

    const result = await invitationService.acceptInvitation({
      token,
      fullName,
      password,
    });

    return res.status(201).json({
      message: "Joined organization successfully",
      user: result.user,
      organizationId: result.organizationId,
    });
  } catch (error) {
    next(error);
  }
};