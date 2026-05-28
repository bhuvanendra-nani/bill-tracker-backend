const express = require("express");
const Transaction = require("../models/Transaction");
const Setting = require("../models/Setting");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/export", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const settings = await Setting.findOne({ user: req.user._id });

    return res.json({
      user: req.user.toJSON(),
      settings: settings ? settings.toJSON() : null,
      transactions: transactions.map((item) => item.toJSON()),
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to export backup",
    });
  }
});

router.post("/import", authMiddleware, async (req, res) => {
  try {
    const { settings, transactions } = req.body;

    if (settings) {
      await Setting.findOneAndUpdate(
        { user: req.user._id },
        {
          businessName: settings.businessName || "Bill Manager",
          currency: settings.currency || "INR",
          theme: settings.theme || "light",
        },
        { new: true, upsert: true }
      );
    }

    if (Array.isArray(transactions)) {
      await Transaction.deleteMany({ user: req.user._id });

      const preparedTransactions = transactions.map((item) => ({
        user: req.user._id,
        title: item.title || "",
        amount: Number(item.amount || 0),
        type: item.type || "received",
        category: item.category || "",
        date: item.date || "",
        note: item.note || "",
        photo: item.photo || "",
      }));

      if (preparedTransactions.length > 0) {
        await Transaction.insertMany(preparedTransactions);
      }
    }

    return res.json({ message: "Backup imported successfully" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to import backup",
    });
  }
});

module.exports = router;