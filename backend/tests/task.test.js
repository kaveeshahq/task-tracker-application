const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

// Helper: register a user and return { token, user }
const createUser = async (overrides = {}) => {
  const user = {
    name: "User",
    email: `user${Date.now()}${Math.random()}@example.com`,
    password: "password123",
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(user);
  return { token: res.body.data.token, user: res.body.data.user };
};

// Helper: create an admin directly in the DB, then log in
const createAdmin = async () => {
  const email = `admin${Date.now()}@example.com`;
  const hashed = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Admin", email, password: hashed, role: "ADMIN" },
  });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return { token: res.body.data.token, user: res.body.data.user };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("Task endpoints", () => {
  it("creates a task for the authenticated user", async () => {
    const { token, user } = await createUser();
    const res = await request(app)
      .post("/api/tasks")
      .set(auth(token))
      .send({ title: "Test task", status: "TODO" });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Test task");
    expect(res.body.data.ownerId).toBe(user.id);
  });

  it("rejects task creation without a token (401)", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "No auth" });
    expect(res.status).toBe(401);
  });

  it("rejects invalid task input (400)", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/api/tasks")
      .set(auth(token))
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("lists only the user's own tasks with pagination", async () => {
    const { token } = await createUser();
    await request(app).post("/api/tasks").set(auth(token)).send({ title: "A" });
    await request(app).post("/api/tasks").set(auth(token)).send({ title: "B" });

    const res = await request(app)
      .get("/api/tasks?page=1&limit=10")
      .set(auth(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.totalPages).toBe(1);
  });

  it("filters tasks by status", async () => {
    const { token } = await createUser();
    await request(app).post("/api/tasks").set(auth(token)).send({ title: "A", status: "TODO" });
    await request(app).post("/api/tasks").set(auth(token)).send({ title: "B", status: "DONE" });

    const res = await request(app)
      .get("/api/tasks?status=DONE")
      .set(auth(token));

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe("DONE");
  });

  it("prevents a user from accessing another user's task (403)", async () => {
    const owner = await createUser();
    const created = await request(app)
      .post("/api/tasks")
      .set(auth(owner.token))
      .send({ title: "Private" });

    const other = await createUser();
    const res = await request(app)
      .get(`/api/tasks/${created.body.data.id}`)
      .set(auth(other.token));

    expect(res.status).toBe(403);
  });

  it("lets an admin see all users' tasks", async () => {
    const user = await createUser();
    await request(app).post("/api/tasks").set(auth(user.token)).send({ title: "User task" });

    const admin = await createAdmin();
    const res = await request(app).get("/api/tasks").set(auth(admin.token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("updates a task", async () => {
    const { token } = await createUser();
    const created = await request(app)
      .post("/api/tasks")
      .set(auth(token))
      .send({ title: "Before" });

    const res = await request(app)
      .patch(`/api/tasks/${created.body.data.id}`)
      .set(auth(token))
      .send({ title: "After", status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("After");
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  it("deletes a task", async () => {
    const { token } = await createUser();
    const created = await request(app)
      .post("/api/tasks")
      .set(auth(token))
      .send({ title: "To delete" });

    const del = await request(app)
      .delete(`/api/tasks/${created.body.data.id}`)
      .set(auth(token));
    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/tasks/${created.body.data.id}`)
      .set(auth(token));
    expect(get.status).toBe(404);
  });
});