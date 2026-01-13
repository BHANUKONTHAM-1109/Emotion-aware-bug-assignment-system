const express = require("express");
const router = express.Router();
const { updateStress } = require("../controllers/stressController");

router.post("/calculate", updateStress);

module.exports = router;
