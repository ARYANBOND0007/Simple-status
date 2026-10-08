import { Request, Response, NextFunction } from "express";
import prisma  from "../config/prisma.js";

export const requireRole = (...allowedRoles : string[]) => {
    return (req: Request, res: Response, next : NextFunction) => {
        if(!req.orgMember){
            return res.status(403).json({
        message: "Organization membership required",
      });
        }
        if(!allowedRoles.includes(req.orgMember.role)){

              return res.status(403).json({
        message: "Insufficient permissions",
      });

        }
        next();
    }
}