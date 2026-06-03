const express = require("express");
const uploadVoice = require("../middleware/uploadVoice");

const router = express.Router();

router.post("/upload", uploadVoice.single("voiceNote"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No voice note uploaded",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Voice note uploaded successfully",
      filePath: `/uploads/voice-notes/${req.file.filename}`,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Voice upload failed",
    });
  }
});

module.exports = router;