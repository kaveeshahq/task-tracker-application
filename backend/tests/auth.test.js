const request = require("supertest");
const app = require("../src/app");

describe("Auth endpoints", () => {
  const validUser = {
    name: "Alice",
    email: "alice@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("registers a new user and returns a token", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      // Password must never be returned
      expect(res.body.data.user.password).toBeUndefined();
      // New users are always USER role, never ADMIN
      expect(res.body.data.user.role).toBe("USER");
    });

    it("rejects duplicate emails with 409", async () => {
      await request(app).post("/api/auth/register").send(validUser);
      const res = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid input with 400", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "X", email: "bad", password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("logs in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects wrong password with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the current user with a valid token", async () => {
      const reg = await request(app)
        .post("/api/auth/register")
        .send(validUser);
      const token = reg.body.data.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validUser.email);
    });

    it("rejects requests with no token (401)", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});