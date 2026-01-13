const stressService = require("../services/stressService");

exports.updateStress = async (req, res) => {
  const { developerId, workload, reopenRate, lateCommits } = req.body;

  const score = await stressService.calculateStress(
    developerId,
    workload,
    reopenRate,
    lateCommits
  );

  res.json({ stressScore: score });
};
