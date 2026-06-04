const Transaction = require("../models/Transaction");

const getPeopleSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions =
      await Transaction.find({
        user: userId,
      });

    const summary = {};

    transactions.forEach((t) => {
      if (!summary[t.name]) {
        summary[t.name] = {
          name: t.name,
          received: 0,
          given: 0,
        };
      }

      if (t.type === "received") {
        summary[t.name].received += t.amount;
      }

      if (t.type === "given") {
        summary[t.name].given += t.amount;
      }
    });

    const result = Object.values(summary)
      .map((person) => ({
        ...person,
        balance:
          person.received -
          person.given,
      }));

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getPersonLedger = async (
  req,
  res
) => {
  try {
    const transactions =
      await Transaction.find({
        user: req.user._id,
        name: req.params.name,
      }).sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getPeopleSummary,
  getPersonLedger,
};