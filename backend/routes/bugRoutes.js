const express = require("express");
const router = express.Router();
const {
  createBug,
  getBugs,
  closeBug
} = require("../controllers/bugController");

router.post("/", createBug);
router.get("/", getBugs);
router.put("/:id/close", closeBug);

module.exports = router;
