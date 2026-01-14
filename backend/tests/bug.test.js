const request = require("supertest");
const app = require("../app");
const pool = require("../utils/db");   // 🔥 MISSING LINE

test("Bug API should respond", async () => {
  const res = await request(app).get("/");
  expect(res.statusCode).toBe(200);
});

afterAll(async () => {
  await pool.end();
});
