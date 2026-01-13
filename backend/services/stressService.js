const pool = require("../utils/db");

exports.calculateStress = async (developerId, workload, reopenRate, lateCommits) => {
  let score = 0;

  score += workload * 0.4;
  score += reopenRate * 0.3;
  score += lateCommits * 0.3;

  await pool.query(
    "INSERT INTO stress_history(developer_id, score) VALUES($1,$2)",
    [developerId, score]
  );

  await pool.query(
    "UPDATE developers SET stress_score=$1 WHERE id=$2",
    [score, developerId]
  );

  return score;
};
