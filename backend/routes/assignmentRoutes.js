const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { autoAssignBug, listAssignments } = require("../controllers/assignmentController");

router.use(authMiddleware);
router.post("/auto/:bugId", autoAssignBug);
router.get("/", listAssignments);

module.exports = router;
