const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getDevelopers } = require("../controllers/developersController");

router.use(authMiddleware);
router.get("/", getDevelopers);

module.exports = router;
