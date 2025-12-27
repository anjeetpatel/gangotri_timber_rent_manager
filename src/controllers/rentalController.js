const Customer = require("../models/Customer");
const Rental = require("../models/Rental");
const ReturnLog = require("../models/ReturnLog");
const calculateRent = require("../utils/calculateRent");

// GIVE MATERIAL
exports.giveMaterial = async (req, res) => {
  try {
    const { name, mobile, material, quantity, dailyRate } = req.body;

    if (
      typeof name !== "string" ||
      typeof mobile !== "string" ||
      typeof material !== "string" ||
      typeof quantity !== "number" ||
      typeof dailyRate !== "number"
    ) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    if (
      name.trim() === "" ||
      mobile.trim() === "" ||
      material.trim() === "" ||
      quantity <= 0 ||
      dailyRate <= 0
    ) {
      return res.status(400).json({ error: "Invalid values" });
    }

    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      customer = await Customer.create({ name, mobile });
    }

    const rental = await Rental.create({
      customerId: customer._id,
      material,
      quantityGiven: quantity,
      dailyRate,
      startDate: new Date(),
    });

    res.status(201).json({ success: true, rental });
  } catch (error) {
    console.error("❌ ERROR IN giveMaterial:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET PENDING RENTALS
exports.getPendingRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ status: "ACTIVE" }).populate(
      "customerId"
    );

    const result = [];

    for (let rental of rentals) {
      const returns = await ReturnLog.find({ rentalId: rental._id });
      const returnedQty = returns.reduce((s, r) => s + r.quantityReturned, 0);
      const pendingQty = rental.quantityGiven - returnedQty;

      if (pendingQty <= 0) continue;

      const { days, rent } = calculateRent(
        rental.startDate,
        pendingQty,
        rental.dailyRate
      );

      result.push({
        rentalId: rental._id,
        customer: rental.customerId.name,
        material: rental.material,
        pendingQty,
        days,
        rent,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("❌ ERROR IN getPendingRentals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.returnMaterial = async (req, res) => {
  try {
    const { rentalId, quantityReturned } = req.body;

    if (
      typeof rentalId !== "string" ||
      typeof quantityReturned !== "number" ||
      quantityReturned <= 0
    ) {
      return res.status(400).json({ error: "Invalid return data" });
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ error: "Rental not found" });
    }

    const returns = await ReturnLog.find({ rentalId });
    const returnedSoFar = returns.reduce(
      (sum, r) => sum + r.quantityReturned,
      0
    );

    const pendingQty = rental.quantityGiven - returnedSoFar;

    if (quantityReturned > pendingQty) {
      return res.status(400).json({
        error: "Return quantity exceeds pending quantity",
      });
    }

    await ReturnLog.create({
      rentalId,
      quantityReturned,
      returnDate: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("❌ ERROR IN returnMaterial:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
