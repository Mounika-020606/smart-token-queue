
const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true
    },
    service: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    peopleAhead: {
      type: Number,
      default: 0
    },
    waitTime: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Waiting", "Serving", "Completed", "Cancelled"],
      default: "Waiting"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
