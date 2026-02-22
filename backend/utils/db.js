require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production" ||
          (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase"))
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
);

pool.on("connect", () => console.log("✅ DB connected"));
pool.on("error", (err) => console.error("❌ Unexpected DB pool error", err));

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);

  if (process.env.NODE_ENV !== "production") {
    console.log("Query", {
      text: text.slice(0, 60),
      duration: Date.now() - start,
      rows: result.rowCount,
    });
  }

  return result;
}

module.exports = { pool, query };