const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");
const env = require("../src/config/env");

async function main() {
  const email = env.admin.email;
  const password = env.admin.password;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${email}`);
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });