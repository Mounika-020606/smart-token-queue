
const express = require("express");
const mongoose = require("mongoose");
const Token = require("../models/Token");
const {
  protect,
  allowRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const allowedServices = [
  "Banking",
  "Government",
  "Customer Support",
  "Healthcare",
];

const allowedStatuses = [
  "Waiting",
  "Serving",
  "Completed",
  "Cancelled",
];

// Recalculate waiting positions for one service.
async function refreshQueue(service) {
  const tokens = await Token.find({
    service,
    status: { $in: ["Waiting", "Serving"] },
  }).sort({ createdAt: 1, _id: 1 });

  let peopleAhead = 0;

  for (const token of tokens) {
    if (token.status === "Serving") {
      token.peopleAhead = 0;
      token.waitTime = 0;
    } else {
      token.peopleAhead = peopleAhead;
      token.waitTime = (peopleAhead + 1) * 4;
      peopleAhead++;
    }

    await token.save();
  }
}

// Generate a sequential token number.
async function generateTokenNumber() {
  const existing = await Token.find({}, { tokenNumber: 1 });

  const highestNumber = existing.reduce((max, item) => {
    const match = item.tokenNumber?.match(/^A-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 108);

  return `A-${highestNumber + 1}`;
}

// 1. Generate a token for the authenticated user.
router.post(
  "/generate",
  protect,
  allowRoles("user"),
  async (req, res) => {
    try {
      const { service } = req.body;
      const userId = req.user._id;

      if (!allowedServices.includes(service)) {
        return res.status(400).json({
          message: "Please select a valid service",
        });
      }

      const peopleAhead = await Token.countDocuments({
        service,
        status: { $in: ["Waiting", "Serving"] },
      });

      const tokenNumber = await generateTokenNumber();

      const token = await Token.create({
        tokenNumber,
        service,
        userId,
        peopleAhead,
        waitTime: (peopleAhead + 1) * 4,
        status: "Waiting",
      });

      await refreshQueue(service);

      const savedToken = await Token.findById(token._id);

      return res.status(201).json({
        message: "Token generated successfully",
        token: {
          id: savedToken._id,
          token: savedToken.tokenNumber,
          service: savedToken.service,
          peopleAhead: savedToken.peopleAhead,
          waitTime: savedToken.waitTime,
          status: savedToken.status,
        },
      });
    } catch (error) {
      console.error("Token generation error:", error.message);
      return res.status(500).json({
        message: "Unable to generate token",
      });
    }
  }
);

// 2. Get token history.
router.get(
  "/my-tokens/:userId",
  protect,
  allowRoles("user", "staff", "admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (
        req.user.role === "user" &&
        req.user._id.toString() !== userId
      ) {
        return res.status(403).json({
          message: "You can only view your own tokens",
        });
      }

      const tokens = await Token.find({ userId }).sort({
        createdAt: -1,
      });

      return res.json({ tokens });
    } catch (error) {
      console.error("Fetch tokens error:", error.message);
      return res.status(500).json({
        message: "Unable to fetch tokens",
      });
    }
  }
);

// 3. Authenticated users, staff, and admins can READ active queue.
// Optional query: /api/tokens/active-queue?service=Healthcare
router.get(
  "/active-queue",
  protect,
  allowRoles("user", "staff", "admin"),
  async (req, res) => {
    try {
      const { service } = req.query;

      const filter = {
        status: { $in: ["Waiting", "Serving"] },
      };

      if (service) {
        if (!allowedServices.includes(service)) {
          return res.status(400).json({
            message: "Please select a valid service",
          });
        }

        filter.service = service;
      }

      const tokens = await Token.find(filter)
        .sort({ createdAt: 1, _id: 1 })
        .select("tokenNumber service status peopleAhead waitTime createdAt");

      return res.json({ tokens });
    } catch (error) {
      console.error("Active queue error:", error.message);
      return res.status(500).json({
        message: "Unable to load active queue",
      });
    }
  }
);

// 4. Staff and admin: View the staff queue.
router.get(
  "/staff/queue",
  protect,
  allowRoles("staff", "admin"),
  async (req, res) => {
    try {
      const { service } = req.query;

      const filter = {
        status: { $in: ["Waiting", "Serving"] },
      };

      if (service) {
        if (!allowedServices.includes(service)) {
          return res.status(400).json({
            message: "Please select a valid service",
          });
        }

        filter.service = service;
      }

      const tokens = await Token.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: 1, _id: 1 });

      return res.json({ tokens });
    } catch (error) {
      console.error("Staff queue error:", error.message);
      return res.status(500).json({
        message: "Unable to load the staff queue",
      });
    }
  }
);

// 5. Staff and admin: Update token status.
router.patch(
  "/:tokenId/status",
  protect,
  allowRoles("staff", "admin"),
  async (req, res) => {
    try {
      const { tokenId } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(tokenId)) {
        return res.status(400).json({
          message: "Invalid token ID",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid token status",
        });
      }

      const token = await Token.findById(tokenId);

      if (!token) {
        return res.status(404).json({
          message: "Token not found",
        });
      }

      if (["Completed", "Cancelled"].includes(token.status)) {
        return res.status(400).json({
          message: "This token has already been closed",
        });
      }

      if (status === "Serving") {
        if (token.status !== "Waiting") {
          return res.status(400).json({
            message: "Only waiting tokens can be called",
          });
        }

        const existingServing = await Token.findOne({
          service: token.service,
          status: "Serving",
          _id: { $ne: token._id },
        });

        if (existingServing) {
          return res.status(409).json({
            message: `Token ${existingServing.tokenNumber} is already being served for ${token.service}. Complete it first.`,
          });
        }
      }

      if (status === "Completed" && token.status !== "Serving") {
        return res.status(400).json({
          message: "Only a serving token can be completed",
        });
      }

      if (status === "Cancelled" && token.status !== "Waiting") {
        return res.status(400).json({
          message: "Only a waiting token can be cancelled",
        });
      }

      token.status = status;
      await token.save();

      await refreshQueue(token.service);

      const updatedToken = await Token.findById(token._id)
        .populate("userId", "name email");

      return res.json({
        message: `Token status updated to ${status}`,
        token: updatedToken,
      });
    } catch (error) {
      console.error("Update token status error:", error.message);
      return res.status(500).json({
        message: "Unable to update token status",
      });
    }
  }
);

module.exports = router;
