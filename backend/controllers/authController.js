const bcrypt = require("bcrypt");
const { query } = require("../utils/db");
const { signToken } = require("../utils/jwt");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = "DEVELOPER" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User with this email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashed, role]
    );
    const user = result.rows[0];
    await query(
      "INSERT INTO developer_metrics (user_id, open_bug_count, avg_resolution_time_hours, current_stress_score) VALUES ($1, 0, 0, 0) ON CONFLICT (user_id) DO NOTHING",
      [user.id]
    );
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    // Helpful message when DB schema is old or missing (e.g. column/table does not exist)
    const code = err.code;
    if (code === "42703" || code === "42P01" || (err.message && err.message.includes("does not exist"))) {
      console.error("Registration DB error (schema mismatch?):", err.message);
      return next({
        statusCode: 503,
        message:
          "Database schema is outdated or missing. Run db/schema.sql on your PostgreSQL/Supabase database, then try again.",
      });
    }
    if (code === "23505") {
      return res.status(409).json({ message: "User with this email already exists" });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    const { password_hash, ...safeUser } = user;
    const token = signToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const result = await query("SELECT id, name, email, role FROM users WHERE id = $1", [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
