// controllers/auth.controller.js
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as authService from "../services/auth.service.js";

export const signup = async (  req: Request,
    res: Response,
    next: NextFunction
) => {
  try {
    const { email, password, fullName } = req.body;

    // 1. Delegate business logic & transaction to Service
    const { user, organization } = await authService.registerUserWithOrganization({
      email,
      password,
      fullName,
    });

    // 2. HTTP specific work: JWT token generation
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 3. HTTP specific work: Cookie handling
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4. HTTP Response
    return res.status(201).json({
      message: "Account created successfully",
      user: { id: user.id, email: user.email, fullName: user.fullName },
      organization: { id: organization.id, name: organization.name, slug: organization.slug },
    });
  } catch (error) {
    // Pass to global error middleware
    next(error);
  }
};