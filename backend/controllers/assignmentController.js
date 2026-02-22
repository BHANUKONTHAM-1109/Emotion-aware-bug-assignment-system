const assignmentService = require("../services/assignmentService");
const bugModel = require("../models/bugModel");

exports.autoAssignBug = async (req, res, next) => {
  try {
    const bugId = parseInt(req.params.bugId, 10);
    const bug = await bugModel.getBugById(bugId);
    if (!bug) return res.status(404).json({ message: "Bug not found" });
    const result = await assignmentService.chooseAssignee();
    if (!result) {
      return res.status(400).json({ message: "No developer candidates available" });
    }
    const assignment = await bugModel.assignBug(bugId, result.assignee.id, req.user.id);
    res.status(201).json({
      assignment,
      strategy: "emotion-aware-workload-optimized",
      assignee: { id: result.assignee.id, name: result.assignee.name, email: result.assignee.email },
      scoring: result.details,
    });
  } catch (err) {
    next(err);
  }
};

exports.listAssignments = async (req, res, next) => {
  try {
    const assignments = await bugModel.listAssignments();
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
};
