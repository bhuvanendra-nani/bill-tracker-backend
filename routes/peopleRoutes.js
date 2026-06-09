const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    });

    const people = {};

    transactions.forEach((t) => {
      const title = (t.title || "").trim();

      if (!title) return;

      const key = title.toLowerCase();

      if (!people[key]) {
        people[key] = {
          title,
          received: 0,
          sent: 0,
          balance: 0,
        };
      }

      if (t.type === "received") {
        people[key].received += Number(t.amount || 0);
      }

      if (t.type === "sent") {
        people[key].sent += Number(t.amount || 0);
      }

      people[key].balance = people[key].received - people[key].sent;
    });

    return res.json(Object.values(people));
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to fetch people summary",
    });
  }
});

router.get("/:title", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      title: req.params.title,
    }).sort({
      createdAt: -1,
    });

    return res.json(transactions.map((item) => item.toJSON()));
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to fetch person ledger",
    });
  }
});

module.exports = router;