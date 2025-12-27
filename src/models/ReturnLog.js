const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rental",
  },
  quantityReturned: Number,
  returnDate: Date,
});

module.exports = mongoose.model("ReturnLog", returnSchema);
