const express = require("express");
const router = express.Router();
const controller = require("../controllers/ledgerController");

router.get("/:name", controller.getCustomerLedger);

router.get("/:name/pdf", controller.downloadLedgerPdf);


module.exports = router;
