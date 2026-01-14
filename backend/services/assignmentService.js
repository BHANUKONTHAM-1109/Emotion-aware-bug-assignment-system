const pool = require("../utils/db");

exports.assignBug = async (bugId, developerId) => {
  const devResult = await pool.query(
    "SELECT id FROM developers WHERE id=$1",
    [developerId]
  );

  if (devResult.rows.length === 0) {
    throw new Error("Developer not found");
  }

  const dev = devResult.rows[0];

  await pool.query(
    "INSERT INTO assignments(bug_id, developer_id) VALUES($1,$2)",
    [bugId, dev.id]
  );

  await pool.query(
    "UPDATE bugs SET status='ASSIGNED' WHERE id=$1",
    [bugId]
  );

  return { message: "Bug assigned successfully" };
};
