const express = require("express");
const router = express.Router();
const controller = require("../controllers/rentalController");

router.post("/", controller.giveMaterial);
router.get("/pending", controller.getPendingRentals);
router.post("/return", controller.returnMaterial);


module.exports = router;
