import crypto from "crypto";
import bcrypt from "bcrypt";
import  prisma  from "../config/prisma.js"
import { AppError } from "../errors/AppError.js";

export const acceptInvitation = async({token,fullName,password}) => {

     const invitation = await prisma.invitation.findUnique({
        where: {
            token,
        }
     });

     if(!invitation){
        throw new AppError("Invitation not found", 400)

     }

     if(new Date() > invitation.expiresAt){
        throw new AppError("Invitation Expire", 409)
     }

     const passwordHash = await bcrypt.hash(password, 10);

     const result = await prisma.$transaction(async(tx) => {

        const user = await tx.user.create({
            data: {
                email : invitation.email,
                fullName,
                passwordHash,

            }
        });
         const membership = await tx.orgMember.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

     await tx.invitation.delete({
      where: {
        id: invitation.id,
      },
    });
     return {
      user,
      membership,
      organizationId: invitation.organizationId,
    };
     })
     return result;

}