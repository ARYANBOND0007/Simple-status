// services/auth.service.js
import bcrypt from "bcrypt";
import  {prisma} from "../config/prisma.js";
// services/auth.service.ts
import { AppError } from "../errors/AppError.js";



interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
}

export const registerUserWithOrganization = async ({
  email,
  password,
  fullName,
}: RegisterInput) => {
  // 1. Business Logic: Check existence
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

if (existingUser) {
  throw new AppError("Email is already registered", 409);
}

  // 2. Hash Password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Prepare Org Name & Slug
  const baseName = fullName ? fullName.trim() : email.split("@")[0];
  const orgName = `${baseName}'s Team`;
  const slug = `${baseName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 4. The Isolated Transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        fullName,
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: orgName,
        slug,
      },
    });

    const membership = await tx.orgMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "OWNER",
      },
    });

    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        planTier: "FREE",
        status: "ACTIVE",
      },
    });

    return { user, organization, membership };
  });

  return result;
};