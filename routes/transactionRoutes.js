const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(transactions.map((item) => item.toJSON()));
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch transactions",
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ transaction: transaction.toJSON() });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch transaction",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, amount, type, category, date, note, photo } = req.body;

    if (!title || amount === undefined || !type || !date) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date,
      note,
      photo,
    });

    return res.status(201).json({ transaction: transaction.toJSON() });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create transaction",
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, amount, type, category, date, note, photo } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title,
        amount,
        type,
        category,
        date,
        note,
        photo,
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ transaction: transaction.toJSON() });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update transaction",
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to delete transaction",
    });
  }
});

module.exports = router;