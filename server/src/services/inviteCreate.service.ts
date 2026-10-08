import crypto from "crypto";
import bcrypt from "bcrypt";
import  prisma  from "../config/prisma.js"

// admin or owner creates invitation link

export const createInvitation = async ({email,role,organizationId,invitedById}) => {
    const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

const invitation = await prisma.invitation.create({
    data : {
        email,
        role : role || "MEMBER",
        token,
        expiresAt,
        organizationId,
        invitedById,
    },
    
});
 const inviteLink =
    `http://localhost:5173/join?token=${token}`;

  return {
    invitation,
    inviteLink,
  };
}
