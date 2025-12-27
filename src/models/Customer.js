const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  mobile: String,
});

module.exports = mongoose.model("Customer", customerSchema);
