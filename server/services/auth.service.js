export const registerUserWithOrganization = async function (
  email,
  password,
  fullname
) {
  const existingUser = await prisma.User.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const baseName = fullname
    ? fullname.trim()
    : email.split("@")[0];

  const orgName = `${baseName}'s Team`;

  const slug = `${baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.User.create({
      data: {
        email,
        passwordHash,
        fullname,
      },
    });

    const organization = await tx.Organization.create({
      data: {
        name: orgName,
        slug,
      },
    });

    const membership = await tx.OrgMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "OWNER",
      },
    });

    const subscription = await tx.Subscription.create({
      data: {
        organizationId: organization.id,
        planTier: "FREE",
        status: "ACTIVE",
      },
    });

    return {
      user,
      organization,
      membership,
      subscription,
    };
  });

  return result;
};