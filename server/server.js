
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check required environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing from server/.env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing from server/.env");
  process.exit(1);
}

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/admin", adminRoutes);

// Backend health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "SmartQueue Backend is Running 🚀",
    status: "OK",
  });
});

// Connect to MongoDB, then start the server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `🚀 SmartQueue server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");

    if (error.message.includes("bad auth")) {
      console.error(
        "Check your MongoDB username, password, and authentication settings."
      );
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

startServer();
