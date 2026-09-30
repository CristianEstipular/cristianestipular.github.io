const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

// === Middleware ===
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin =
      process.env.NODE_ENV !== "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

    if (!origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

// === Static Files ===
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// === Routes ===
app.use("/api/auth", require("./routes/auth.js"));
app.use("/assign", require("./routes/assignroute"));
app.use("/admin", require("./routes/adminroute"));
app.use("/user", require("./routes/Userroute"));
app.use("/prof", require("./routes/Profroute"));
app.use("/incidents", require("./routes/Incidentroute.js"));


// === Export App ===
module.exports = app;
