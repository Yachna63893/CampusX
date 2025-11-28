// routes/contactRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "SkillX Contact",
          email: process.env.EMAIL_FROM, // e.g. no-reply@yourdomain.com or your Brevo-verified email
        },
        to: [{ email: process.env.RECEIVER_EMAIL }],
        subject: `SkillX Contact Form - ${name}`,
        htmlContent: `
          <h2>📩 New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Brevo API Error:", error?.response?.data || error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send email" });
  }
});

export default router;
