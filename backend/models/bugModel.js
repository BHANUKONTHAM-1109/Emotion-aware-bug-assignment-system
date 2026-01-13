const pool = require("../utils/db");

exports.createBug = async (title, description, severity) => {
  const res = await pool.query(
    "INSERT INTO bugs(title,description,severity) VALUES($1,$2,$3) RETURNING *",
    [title, description, severity]
  );
  return res.rows[0];
};

exports.getAllBugs = async () => {
  const res = await pool.query("SELECT * FROM bugs ORDER BY created_at DESC");
  return res.rows;
};

exports.updateStatus = async (id, status) => {
  await pool.query("UPDATE bugs SET status=$1 WHERE id=$2", [status, id]);
};
