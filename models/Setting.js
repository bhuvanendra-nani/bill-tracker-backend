const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      default: "Bill Manager",
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    theme: {
      type: String,
      default: "light",
    },
  },
  { timestamps: true }
);

settingSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    ret.user = ret.user?.toString?.() || ret.user;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Setting", settingSchema);