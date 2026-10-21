
const express = require("express");
const User = require("../models/User");
const Token = require("../models/Token");
const {
  protect,
  allowRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// All admin endpoints require an authenticated admin.
router.use(protect, allowRoles("admin"));

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    // Calculate the start of the last seven UTC calendar days.
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [
      totalUsers,
      totalStaff,
      totalAdmins,
      totalTokens,
      waitingTokens,
      servingTokens,
      completedTokens,
      cancelledTokens,
      serviceStats,
      recentTokens,
      dailyStats
    ] = await Promise.all([
      // User role statistics
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "staff" }),
      User.countDocuments({ role: "admin" }),

      // Token status statistics
      Token.countDocuments(),
      Token.countDocuments({ status: "Waiting" }),
      Token.countDocuments({ status: "Serving" }),
      Token.countDocuments({ status: "Completed" }),
      Token.countDocuments({ status: "Cancelled" }),

      // Tokens grouped by service
      Token.aggregate([
        {
          $group: {
            _id: "$service",
            total: { $sum: 1 }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]),

      // Most recently created tokens
      Token.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Token creation counts for the last seven UTC dates
      Token.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC"
              }
            },
            total: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
    ]);

    // Include dates with zero tokens so the chart always has seven points.
    const dailyTokenStats = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(date.getUTCDate() - (6 - index));

        const dateKey = date.toISOString().slice(0, 10);

        const found = dailyStats.find(
          (item) => item._id === dateKey
        );

        return {
          date: dateKey,
          total: found ? found.total : 0
        };
      }
    );

    // Format service statistics for the frontend charts.
    const formattedServiceStats = serviceStats.map((item) => ({
      service: item._id || "Other",
      total: item.total
    }));

    res.status(200).json({
      stats: {
        totalUsers,
        totalStaff,
        totalAdmins,
        totalTokens,
        waitingTokens,
        servingTokens,
        completedTokens,
        cancelledTokens
      },
      serviceStats: formattedServiceStats,
      dailyStats: dailyTokenStats,
      recentTokens
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      message: "Unable to load admin statistics"
    });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Admin users error:", error);

    res.status(500).json({
      message: "Unable to load users"
    });
  }
});

module.exports = router;
