const { execSync } = require("child_process");
const prisma = require("../src/config/prisma");

// Before any tests: ensure the test DB schema matches prisma/schema.prisma
beforeAll(() => {
  execSync("npx prisma db push --skip-generate", {
    env: process.env,
    stdio: "ignore",
  });
});

// Clean all data before each test file's tests run
beforeEach(async () => {
  // Order matters: tasks reference users
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});