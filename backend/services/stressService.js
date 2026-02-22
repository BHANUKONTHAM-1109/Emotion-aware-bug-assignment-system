const axios = require("axios");
const { query } = require("../utils/db");

async function getDeveloperFeatures(userId) {
  const result = await query(
    `SELECT dm.open_bug_count, dm.avg_resolution_time_hours, dm.current_stress_score, u.role
     FROM developer_metrics dm
     JOIN users u ON dm.user_id = u.id
     WHERE dm.user_id = $1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    open_bug_count: row.open_bug_count,
    avg_resolution_time_hours: Number(row.avg_resolution_time_hours),
    current_stress_score: Number(row.current_stress_score),
    role: row.role,
  };
}

async function predictStress(userId) {
  const features = await getDeveloperFeatures(userId);
  if (!features) {
    return { predicted_stress_score: 0.3, model_version: "fallback-heuristic" };
  }
  const mlUrl = process.env.ML_SERVICE_URL;
  if (!mlUrl) {
    const score = Math.min(
      1,
      0.2 + features.open_bug_count * 0.05 + features.current_stress_score * 0.5
    );
    return { predicted_stress_score: score, model_version: "no-ml-url-heuristic" };
  }
  try {
    const response = await axios.post(mlUrl, { developer_id: userId, features }, { timeout: 5000 });
    return {
      predicted_stress_score: response.data.predicted_stress_score,
      model_version: response.data.model_version || "ml-v1",
    };
  } catch (err) {
    console.error("ML service error, using heuristic:", err.message);
    const score = Math.min(
      1,
      0.2 + features.open_bug_count * 0.05 + features.current_stress_score * 0.5
    );
    return { predicted_stress_score: score, model_version: "ml-fallback-heuristic" };
  }
}

async function updateStressScore(userId, score) {
  await query(
    "UPDATE developer_metrics SET current_stress_score = $1, updated_at = NOW() WHERE user_id = $2",
    [score, userId]
  );
}

module.exports = {
  getDeveloperFeatures,
  predictStress,
  updateStressScore,
};
