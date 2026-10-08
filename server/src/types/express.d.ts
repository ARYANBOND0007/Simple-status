import { OrgMember, User } from "../../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };

      orgMember?: OrgMember;
    }
  }
}

export {};