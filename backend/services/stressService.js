const { exec } = require("child_process");
const pool = require("../utils/db");

exports.calculateStress = async (developerId, workload, reopenRate, lateCommits) => {

  return new Promise((resolve, reject) => {

    exec(
      `python ml_api.py ${workload} ${reopenRate} ${lateCommits}`,
      async (error, stdout) => {

        if (error) return reject(error);

        const score = parseFloat(stdout);

        await pool.query(
          "INSERT INTO stress_history(developer_id, score) VALUES($1,$2)",
          [developerId, score]
        );

        await pool.query(
          "UPDATE developers SET stress_score=$1 WHERE id=$2",
          [score, developerId]
        );

        resolve(score);
      }
    );

  });
};
