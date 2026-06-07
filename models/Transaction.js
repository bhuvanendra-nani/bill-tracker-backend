const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["received", "sent"],
      required: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    dueDate: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "partial", "completed"],
      default: "completed",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    voiceNote: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() || ret.user;

    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);