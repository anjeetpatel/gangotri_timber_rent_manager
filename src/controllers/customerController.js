const Customer = require("../models/Customer");

exports.getCustomerByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;

    if (!mobile) {
      return res.status(400).json({ error: "Mobile number required" });
    }

    const customer = await Customer.findOne({ mobile });

    if (!customer) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      name: customer.name,
    });
  } catch (error) {
    console.error("❌ ERROR IN getCustomerByMobile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
