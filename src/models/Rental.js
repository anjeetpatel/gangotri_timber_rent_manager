const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  material: String,
  quantityGiven: Number,
  dailyRate: Number,
  startDate: Date,
  status: { type: String, default: "ACTIVE" },
});

module.exports = mongoose.model("Rental", rentalSchema);
