const bugModel = require("../models/bugModel");

exports.createBug = async (req, res) => {
  const { title, description, severity } = req.body;
  const bug = await bugModel.createBug(title, description, severity);
  res.json(bug);
};

exports.getBugs = async (req, res) => {
  const bugs = await bugModel.getAllBugs();
  res.json(bugs);
};

exports.closeBug = async (req, res) => {
  await bugModel.updateStatus(req.params.id, "CLOSED");
  res.json({ message: "Bug closed" });
};
