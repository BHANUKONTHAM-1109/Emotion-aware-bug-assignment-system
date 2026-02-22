const { query } = require("../utils/db");
const stressService = require("./stressService");

async function getDeveloperCandidates() {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, dm.open_bug_count, dm.avg_resolution_time_hours, dm.current_stress_score
     FROM users u
     JOIN developer_metrics dm ON dm.user_id = u.id
     WHERE u.role = 'DEVELOPER'`
  );
  return result.rows.map((r) => ({
    ...r,
    open_bug_count: Number(r.open_bug_count),
    avg_resolution_time_hours: Number(r.avg_resolution_time_hours),
    current_stress_score: Number(r.current_stress_score),
  }));
}

async function scoreDeveloper(dev) {
  const { predicted_stress_score } = await stressService.predictStress(dev.id);
  const workloadScore = dev.open_bug_count / 10;
  const productivityScore = dev.avg_resolution_time_hours > 0 ? 1 / dev.avg_resolution_time_hours : 1;
  const composite = 0.5 * workloadScore + 0.4 * predicted_stress_score - 0.1 * productivityScore;
  return { developerId: dev.id, compositeScore: composite, predictedStress: predicted_stress_score };
}

async function chooseAssignee() {
  const candidates = await getDeveloperCandidates();
  if (!candidates.length) return null;
  const scored = await Promise.all(candidates.map((d) => scoreDeveloper(d)));
  scored.sort((a, b) => a.compositeScore - b.compositeScore);
  const best = scored[0];
  const bestDev = candidates.find((d) => d.id === best.developerId);
  return { assignee: bestDev, details: best };
}

module.exports = {
  getDeveloperCandidates,
  chooseAssignee,
};
