const { PrismaClient, RoleName } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { createPrismaOptions } = require("../lib/prismaOptions.cjs");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const prisma = new PrismaClient(createPrismaOptions());

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for prisma seed.");
  }

  const roles = [
    "SUPER_ADMIN",
    "ADMIN",
    "PRODUCT_MANAGER",
    "CONTENT_EDITOR",
    "ORDER_MANAGER",
    "SUPPORT_STAFF",
  ];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: name.replaceAll("_", " ").toLowerCase(),
      },
    });
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.SUPER_ADMIN },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      isActive: true,
      passwordHash: await bcrypt.hash(password, 12),
    },
    create: {
      email,
      name: "Super Admin",
      passwordHash: await bcrypt.hash(password, 12),
      isActive: true,
    },
  });

  await prisma.roleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superAdminRole.id,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "site.identity" },
    update: {},
    create: {
      key: "site.identity",
      group: "general",
      isPublic: true,
      value: {
        name: "JPSPARE",
        currency: "BDT",
        supportPhone: "01718914582",
      },
    },
  });

  console.log(`Seeded roles and super admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
