require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { pool } = require("./utils/db");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const bugRoutes = require("./routes/bugRoutes");
const stressRoutes = require("./routes/stressRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const developersRoutes = require("./routes/developersRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Emotion-aware bug assignment API" });
});

// DB connectivity check (startup only, optional)
pool.query("SELECT 1").catch((err) => console.error("DB check:", err.message));

// API routes (frontend uses baseURL + /api/...)
app.use("/api/auth", authRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/stress", stressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/developers", developersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
