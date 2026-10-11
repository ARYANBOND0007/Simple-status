import { prisma } from "../config/prisma";
import { AppError } from "../errors/AppError";
import bcrypt from "bcrypt";

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser({
  email,
  password,
}: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return user;
}