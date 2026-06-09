const Transaction = require("../models/Transaction");

const getPeopleSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({
      user: userId,
    });

    const summary = {};

    transactions.forEach((t) => {
      if (!summary[t.title]) {
        summary[t.title] = {
          title: t.title,
          received: 0,
          sent: 0,
        };
      }

      if (t.type === "received") {
        summary[t.title].received += Number(t.amount || 0);
      }

      if (t.type === "sent") {
        summary[t.title].sent += Number(t.amount || 0);
      }
    });

    const result = Object.values(summary).map((person) => ({
      ...person,
      balance: person.received - person.sent,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to generate people summary",
    });
  }
};

const getPersonLedger = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      title: req.params.title,
    }).sort({ date: -1 });

    return res.json(transactions.map((item) => item.toJSON()));
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to fetch person ledger",
    });
  }
};

module.exports = {
  getPeopleSummary,
  getPersonLedger,
};