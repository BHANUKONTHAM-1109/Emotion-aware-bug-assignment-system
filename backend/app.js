require("dotenv").config();
console.log("DB URL:", process.env.DATABASE_URL);

const express = require("express");
const pool = require("./utils/db");

const app = express();
//DB TEST
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("DB Error:", err);
  else console.log("DB Connected:", res.rows[0]);
});

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Emotion Aware Bug System API Running");
});

app.listen(5000, ()=>console.log("Server running on port 5000"));

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const bugRoutes = require("./routes/bugRoutes");
app.use("/bugs", bugRoutes);