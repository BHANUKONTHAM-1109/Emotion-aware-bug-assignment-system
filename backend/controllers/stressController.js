const stressService = require("../services/stressService");

exports.predictStress = async (req, res, next) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId, 10) : req.user.id;
    const { predicted_stress_score, model_version } = await stressService.predictStress(userId);
    res.json({ userId, predicted_stress_score, model_version });
  } catch (err) {
    next(err);
  }
};
