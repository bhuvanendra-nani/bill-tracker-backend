const multer = require("multer");
const path = require("path");
const fs = require("fs");

const voiceDir = path.join(__dirname, "..", "uploads", "voice-notes");

if (!fs.existsSync(voiceDir)) {
  fs.mkdirSync(voiceDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, voiceDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const allowedMimeTypes = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed"), false);
  }
};

const uploadVoice = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = uploadVoice;