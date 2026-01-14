const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

// POST /assignments/:bugId
router.post("/:bugId", async (req, res) => {
  const bugId = req.params.bugId;
  const { id, name, stress_score } = req.body;

  try {
    await pool.query(
      "UPDATE bugs SET status='ASSIGNED' WHERE id=$1",
      [bugId]
    );

    await pool.query(
      "INSERT INTO assignments(bug_id, developer_id) VALUES($1,$2)",
      [bugId, id]
    );

    res.json({ message: "Bug assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
