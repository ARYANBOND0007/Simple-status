import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as invitationService from "../services/inviteCreate.service.js";

export const createInvite = async(req : Request, res: Response,next : NextFunction) => {

    try{
    const {email,role} = req.body;
    const organizationId = req.orgMember!.organizationId;
    const invitedById = req.user!.id;
     
    const invite = await invitationService.createInvitation({
        email,
      role,
      organizationId,
      invitedById,
    });
     return res.status(201).json({
      message: "Invitation created successfully",
      inviteLink: invite.inviteLink,
    });
  } catch (error) {
    next(error);
  }


    }



