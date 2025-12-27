function calculateRent(startDate, quantity, dailyRate, tillDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(tillDate);

  const days =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    days,
    rent: days * quantity * dailyRate,
  };
}

module.exports = calculateRent;
