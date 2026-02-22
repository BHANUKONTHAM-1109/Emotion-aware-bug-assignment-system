const bugModel = require("../models/bugModel");

exports.createBug = async (req, res, next) => {
  try {
    const { title, description, severity } = req.body;
    if (!title || !description || !severity) {
      return res.status(400).json({ message: "Title, description and severity are required" });
    }
    const bug = await bugModel.createBug({
      title,
      description,
      severity,
      reporterId: req.user.id,
    });
    res.status(201).json({ bug });
  } catch (err) {
    next(err);
  }
};

exports.listBugs = async (req, res, next) => {
  try {
    const status = req.query.status;
    const mine = req.query.mine === "true" ? req.user.id : undefined;
    const bugs = await bugModel.listBugs({ status, assigneeId: mine });
    res.json({ bugs });
  } catch (err) {
    next(err);
  }
};

exports.getBug = async (req, res, next) => {
  try {
    const bug = await bugModel.getBugById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json({ bug });
  } catch (err) {
    next(err);
  }
};

exports.updateBug = async (req, res, next) => {
  try {
    const allowed = ["title", "description", "severity", "status"];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const bug = await bugModel.updateBug(req.params.id, updates);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    res.json({ bug });
  } catch (err) {
    next(err);
  }
};
