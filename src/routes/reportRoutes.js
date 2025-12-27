const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportController");

router.get("/customers", controller.getCustomerOutstanding);
router.get("/total", controller.getTotalOutstanding);

module.exports = router;
