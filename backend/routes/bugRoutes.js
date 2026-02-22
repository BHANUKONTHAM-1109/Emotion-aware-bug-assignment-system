const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { createBug, listBugs, getBug, updateBug } = require("../controllers/bugController");

router.use(authMiddleware);
router.get("/", listBugs);
router.post("/", createBug);
router.get("/:id", getBug);
router.put("/:id", updateBug);

module.exports = router;
