const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const rentalRoutes = require("./routes/rentalRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const app = express();

// ✅ CORS CONFIG (THIS FIXES YOUR ISSUE)
app.use(
  cors({
    origin: ["http://localhost:8081"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/ledger", ledgerRoutes);

app.use("/reports", reportRoutes);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/rentals", rentalRoutes);
app.use("/customers", customerRoutes);

app.get("/", (req, res) => {
  res.send("Timber backend running");
});

module.exports = app;
