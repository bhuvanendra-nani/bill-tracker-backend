const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          user: req.user._id,
        });

      const people = {};

      transactions.forEach((t) => {
        const name = t.title;

        if (!people[name]) {
          people[name] = {
            name,
            received: 0,
            sent: 0,
            balance: 0,
          };
        }

        if (t.type === "received") {
          people[name].received += t.amount;
        }

        if (t.type === "sent") {
          people[name].sent += t.amount;
        }

        people[name].balance =
          people[name].received -
          people[name].sent;
      });

      res.json(
        Object.values(people)
      );
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

router.get(
  "/:name",
  authMiddleware,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          user: req.user._id,
          title: req.params.name,
        }).sort({
          createdAt: -1,
        });

      res.json(transactions);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router;