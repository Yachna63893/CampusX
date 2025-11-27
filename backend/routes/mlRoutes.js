import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer for file uploads
const upload = multer({ dest: "uploads/" });

// IMPORTANT: Full python path
const PYTHON_PATH = "C:\\Program Files\\Python310\\python.exe";

// POST /api/ml/score-resume
router.post("/score-resume", upload.single("resume"), async (req, res) => {
  try {
    const { jobText } = req.body;

    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No resume uploaded." });
    }

    // FIXED: Use absolute paths for both script and resume
    const resumePath = path.join(process.cwd(), req.file.path);
    const scriptPath = path.join(process.cwd(), "ml", "train_skill_matcher.py");

    console.log("📄 Resume Path Passed to Python:", resumePath);
    console.log("📝 Job Description Passed:", jobText);

    // Run Python script
    execFile(
      PYTHON_PATH, 
      [scriptPath, resumePath, jobText],
      { maxBuffer: 1024 * 1024 * 20 },
      (error, stdout, stderr) => {

        console.log("🐍 Python stdout:", stdout);
        console.log("🐍 Python stderr:", stderr);

        // Clean file AFTER python runs (important!)
        try { fs.unlinkSync(resumePath); } catch {}

        if (error) {
          console.error("❌ Python Execution Error:", error);
          return res.status(500).json({
            status: "error",
            message: "Python model execution failed",
            stderr: stderr,
          });
        }

        try {
          // Python output lines
          const lines = stdout.trim().split("\n");

          const scoreLine = lines.find(l => l.startsWith("Score:"));
          const matchedLine = lines.find(l => l.startsWith("Matched:"));
          const missingLine = lines.find(l => l.startsWith("Missing:"));

          // Extract score
          const score = scoreLine ? parseFloat(scoreLine.split(":")[1]) : 0;

          // Extract matched keywords
          const matched = matchedLine
            ? matchedLine
                .replace("Matched:", "")
                .replace(/\[|\]|'/g, "")
                .split(",")
                .map(s => s.trim())
                .filter(Boolean)
            : [];

          // Extract missing keywords
          const missing = missingLine
            ? missingLine
                .replace("Missing:", "")
                .replace(/\[|\]|'/g, "")
                .split(",")
                .map(s => s.trim())
                .filter(Boolean)
            : [];

          return res.json({
            status: "success",
            result: {
              score,
              matched_keywords: matched,
              missing_keywords: missing,
            },
          });

        } catch (parseError) {
          console.error("❌ Parse Error:", parseError);
          return res.status(500).json({
            status: "error",
            message: "Could not parse Python output",
            raw: stdout
          });
        }
      }
    );
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

export default router;
