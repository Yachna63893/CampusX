// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import alumniRoutes from "./routes/Alumni.js";
import mlRoutes from "./routes/mlRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import linkedinImageUpdater from "./routes/linkedinImageUpdater.js";

dotenv.config();

const app = express();

/* ---------------- Middleware ---------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ---------------- Routes ---------------- */
app.use("/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/evaluation", evaluationRoutes);
// you probably want a different base path for linkedinImageUpdater,
// but keeping your original line:
app.use("/api/alumni", linkedinImageUpdater);

app.get("/", (req, res) => {
  res.json({ message: "🚀 Backend is running!" });
});

/* ---------------- MongoDB Connection ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ---------------- Start Server ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🔥 Server running at http://localhost:${PORT}`)
);
