const request = require("supertest");
const app = require("../app");
const { pool } = require("../utils/db");

test("Health endpoint responds", async () => {
  const res = await request(app).get("/health");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
});

afterAll(async () => {
  await pool.end();
});
