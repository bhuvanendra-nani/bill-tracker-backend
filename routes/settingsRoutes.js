const express = require("express");
const Setting = require("../models/Setting");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    let settings = await Setting.findOne({ user: req.user._id });

    if (!settings) {
      settings = await Setting.create({
        user: req.user._id,
        businessName: "Bill Manager",
        currency: "INR",
        theme: "light",
      });
    }

    return res.json(settings.toJSON());
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch settings",
    });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const { businessName, currency, theme } = req.body;

    const settings = await Setting.findOneAndUpdate(
      { user: req.user._id },
      { businessName, currency, theme },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ settings: settings.toJSON() });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to save settings",
    });
  }
});

module.exports = router;