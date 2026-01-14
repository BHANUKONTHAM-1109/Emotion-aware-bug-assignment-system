const assignmentService = require("../services/assignmentService");

exports.assignBug = async (req, res) => {
  const dev = await assignmentService.assignBug(req.params.bugId);
  res.json(dev);
};
