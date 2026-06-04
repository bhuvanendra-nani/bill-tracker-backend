const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const uploadVoice = require("../middleware/uploadVoice");

const router = express.Router();

const uploadDir = path.join(
  __dirname,
  "../uploads/transactions"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(
      file.originalname || ""
    );

    const safeExt = ext || ".jpg";

    cb(
      null,
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${safeExt}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype &&
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function buildPhotoUrl(req, filename) {
  return `${req.protocol}://${req.get(
    "host"
  )}/uploads/transactions/${filename}`;
}

/*
|--------------------------------------------------------------------------
| GET ALL TRANSACTIONS
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          user: req.user._id,
        }).sort({
          createdAt: -1,
        });

      return res.json(
        transactions.map((item) =>
          item.toJSON()
        )
      );
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch transactions",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE TRANSACTION
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const transaction =
        await Transaction.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!transaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }

      return res.json({
        transaction:
          transaction.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch transaction",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE TRANSACTION
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
const {
  title,
  personName,
  amount,
  type,
  category,
  date,
  note,
  photoUrl,
  dueDate,
  status,
} = req.body;

      if (
        !title ||
        amount === undefined ||
        !type ||
        !date
      ) {
        return res.status(400).json({
          message:
            "Required fields are missing",
        });
      }

      let photo = "";

      if (req.file) {
        photo = buildPhotoUrl(
          req,
          req.file.filename
        );
      } else if (photoUrl) {
        photo = photoUrl;
      }

      const transaction =
        await Transaction.create({
          user: req.user._id,
          title,
          personName,
          amount,
          type,
          category,
          date,
          dueDate,
          status,
          note,
          photo,
        });

      return res.status(201).json({
        transaction:
          transaction.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to create transaction",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE TRANSACTION
|--------------------------------------------------------------------------
*/
router.put(
  "/:id",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      const {
        title,
        personName,
        amount,
        type,
        category,
        date,
        dueDate,
        status,
        note,
        photoUrl,
      } = req.body;

      const existingTransaction =
        await Transaction.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!existingTransaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }

      let photo =
        existingTransaction.photo || "";

      if (req.file) {
        photo = buildPhotoUrl(
          req,
          req.file.filename
        );
      } else if (
        photoUrl !== undefined
      ) {
        photo = photoUrl;
      }

      existingTransaction.title =
        title ??
        existingTransaction.title;

      existingTransaction.personName =
        personName ??
        existingTransaction.personName;

      existingTransaction.amount =
        amount ??
        existingTransaction.amount;

      existingTransaction.type =
        type ??
        existingTransaction.type;

      existingTransaction.category =
        category ??
        existingTransaction.category;

      existingTransaction.date =
        date ??
        existingTransaction.date;

      existingTransaction.dueDate =
        dueDate ??
        existingTransaction.dueDate;

      existingTransaction.status =
        status ??
        existingTransaction.status;

      existingTransaction.note =
        note ??
        existingTransaction.note;

      existingTransaction.photo =
        photo;

      await existingTransaction.save();

      return res.json({
        transaction:
          existingTransaction.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to update transaction",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| ADD / UPDATE VOICE NOTE
|--------------------------------------------------------------------------
*/
router.put(
  "/:id/voice",
  authMiddleware,
  uploadVoice.single("voiceNote"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "No voice note uploaded",
        });
      }

      const existingTransaction =
        await Transaction.findOne({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!existingTransaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }

      existingTransaction.voiceNote =
        `${req.protocol}://${req.get(
          "host"
        )}/uploads/voice-notes/${
          req.file.filename
        }`;

      await existingTransaction.save();

      return res.json({
        message:
          "Voice note added successfully",
        transaction:
          existingTransaction.toJSON(),
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to attach voice note",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE TRANSACTION
|--------------------------------------------------------------------------
*/
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const transaction =
        await Transaction.findOneAndDelete({
          _id: req.params.id,
          user: req.user._id,
        });

      if (!transaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }

      return res.json({
        message:
          "Transaction deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "Failed to delete transaction",
      });
    }
  }
);

module.exports = router;