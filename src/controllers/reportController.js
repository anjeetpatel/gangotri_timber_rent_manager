const Rental = require("../models/Rental");
const ReturnLog = require("../models/ReturnLog");
const calculateRent = require("../utils/calculateRent");

exports.getCustomerOutstanding = async (req, res) => {
  try {
    const rentals = await Rental.find({ status: "ACTIVE" }).populate(
      "customerId"
    );

    const report = {};

    for (let rental of rentals) {
      const returns = await ReturnLog.find({ rentalId: rental._id });
      const returnedQty = returns.reduce((s, r) => s + r.quantityReturned, 0);
      const pendingQty = rental.quantityGiven - returnedQty;

      if (pendingQty <= 0) continue;

      const { rent } = calculateRent(
        rental.startDate,
        pendingQty,
        rental.dailyRate
      );

      const name = rental.customerId.name;

      if (!report[name]) {
        report[name] = 0;
      }

      report[name] += rent;
    }

    res.json(report);
  } catch (error) {
    console.error("❌ ERROR IN getCustomerOutstanding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTotalOutstanding = async (req, res) => {
  try {
    const rentals = await Rental.find({ status: "ACTIVE" });

    let total = 0;

    for (let rental of rentals) {
      const returns = await ReturnLog.find({ rentalId: rental._id });
      const returnedQty = returns.reduce((s, r) => s + r.quantityReturned, 0);
      const pendingQty = rental.quantityGiven - returnedQty;

      if (pendingQty <= 0) continue;

      const { rent } = calculateRent(
        rental.startDate,
        pendingQty,
        rental.dailyRate
      );

      total += rent;
    }

    res.json({ totalOutstanding: total });
  } catch (error) {
    console.error("❌ ERROR IN getTotalOutstanding:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
