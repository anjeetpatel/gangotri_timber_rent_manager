const PDFDocument = require("pdfkit");

module.exports = function generateLedgerPdf(customerName, ledger, total) {
  const doc = new PDFDocument({ margin: 40 });

  /* ===== HEADER ===== */
  doc.fontSize(20).text("GANGOTRI TIMBER", { align: "center" });

  doc.moveDown();
  doc
    .fontSize(12)
    .text("---------------------------------------", { align: "center" });

  doc.moveDown();

  /* ===== CUSTOMER INFO ===== */
  doc.fontSize(14).text(`Customer Name : ${customerName}`);
  doc.moveDown();

  /* ===== TOTAL ===== */
  doc.fontSize(16).text(`TOTAL BAKI AMOUNT : ₹ ${total}`, {
    underline: true,
  });

  doc.moveDown();
  doc.moveDown();

  /* ===== DETAILS ===== */
  doc.fontSize(14).text("DETAILS:");
  doc.moveDown();

  doc.fontSize(12);

  ledger.forEach((l) => {
    const date = new Date(l.date).toDateString();

    doc.text("---------------------------------------");
    doc.moveDown(0.5);

    doc.text(`Date : ${date}`);
    doc.text(`Material : ${l.material}`);

    if (l.type === "GIVEN") {
      doc.text(`DIYA (Given) : ${l.quantity}`);
      doc.text(`Rate : ₹ ${l.dailyRate} per day`);
    } else {
      doc.text(`WAPAS (Returned) : ${l.quantity}`);
    }

    doc.moveDown();
  });

  doc.text("---------------------------------------");
  doc.moveDown();

  doc.fontSize(10).text("This is a computer generated ledger.", {
    align: "center",
  });

  return doc;
};
