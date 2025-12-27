const Customer = require("../models/Customer");
const Rental = require("../models/Rental");
const ReturnLog = require("../models/ReturnLog");
const calculateRent = require("../utils/calculateRent");
const generateLedgerPdf = require("../utils/ledgerPdf");

exports.getCustomerLedger = async (req, res) => {
  try {
    const { name } = req.params;

    const customer = await Customer.findOne({ name });
    if (!customer) {
      return res.json({ ledger: [], total: 0 });
    }

    const rentals = await Rental.find({ customerId: customer._id });

    const ledger = [];
    let total = 0;

    for (let rental of rentals) {
      // GIVEN entry
      ledger.push({
        date: rental.startDate,
        type: "GIVEN",
        material: rental.material,
        quantity: rental.quantityGiven,
        dailyRate: rental.dailyRate,
      });

      const returns = await ReturnLog.find({ rentalId: rental._id });
      const returnedQty = returns.reduce(
        (sum, r) => sum + r.quantityReturned,
        0
      );

      const pendingQty = rental.quantityGiven - returnedQty;

      if (pendingQty > 0) {
        const { rent } = calculateRent(
          rental.startDate,
          pendingQty,
          rental.dailyRate
        );
        total += rent;
      }

      // RETURN entries
      for (let r of returns) {
        ledger.push({
          date: r.returnDate,
          type: "RETURN",
          material: rental.material,
          quantity: r.quantityReturned,
        });
      }
    }

    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      ledger,
      total,
    });
  } catch (error) {
    console.error("❌ LEDGER ERROR:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.downloadLedgerPdf = async (req, res) => {
  try {
    const { name } = req.params;

    const customer = await Customer.findOne({ name });
    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    const rentals = await Rental.find({ customerId: customer._id });
    const ledger = [];
    let total = 0;

    for (let rental of rentals) {
      ledger.push({
        date: rental.startDate,
        type: "GIVEN",
        material: rental.material,
        quantity: rental.quantityGiven,
        dailyRate: rental.dailyRate,
      });

      const returns = await ReturnLog.find({ rentalId: rental._id });
      const returnedQty = returns.reduce((s, r) => s + r.quantityReturned, 0);
      const pendingQty = rental.quantityGiven - returnedQty;

      if (pendingQty > 0) {
        const { rent } = calculateRent(
          rental.startDate,
          pendingQty,
          rental.dailyRate
        );
        total += rent;
      }

      returns.forEach((r) => {
        ledger.push({
          date: r.returnDate,
          type: "RETURN",
          material: rental.material,
          quantity: r.quantityReturned,
        });
      });
    }

    const doc = generateLedgerPdf(name, ledger, total);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${name}-ledger.pdf"`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("PDF generation failed");
  }
};
