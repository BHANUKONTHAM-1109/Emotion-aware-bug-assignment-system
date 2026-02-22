const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { predictStress } = require("../controllers/stressController");

router.use(authMiddleware);
// /me must be before /:userId so "me" is not parsed as userId
router.get("/me", (req, res, next) => {
  req.params.userId = undefined;
  return predictStress(req, res, next);
});
router.get("/:userId", predictStress);

module.exports = router;
