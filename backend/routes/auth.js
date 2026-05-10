import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  libraryAddress,
  libraryContactEmail,
  libraryName,
  sendLibraryEmail,
} from "../utils/mail.js";

const router = express.Router();

async function sendWelcomeEmail(user) {
  const idLabel = user.userType === "Student" ? "Admission ID" : "Employee ID";
  const subject = `Welcome to ${libraryName}`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">
    <div style="max-width:620px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="background:#1e3a8a;color:#ffffff;padding:18px 24px;">
        <h2 style="margin:0;">${libraryName}</h2>
        <p style="margin:6px 0 0;">Library Membership Created</p>
      </div>
      <div style="padding:24px;color:#374151;">
        <p>Dear ${user.userFullName},</p>
        <p>Your library account has been created successfully.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${user.userFullName}</td></tr>
          <tr><td><strong>User Type</strong></td><td>${user.userType}</td></tr>
          <tr><td><strong>${idLabel}</strong></td><td>${user.memberId}</td></tr>
          <tr><td><strong>Email</strong></td><td>${user.email}</td></tr>
          <tr><td><strong>Mobile</strong></td><td>${user.mobileNumber}</td></tr>
          <tr><td><strong>Department</strong></td><td>${user.department || "N/A"}</td></tr>
        </table>
        <p style="margin-top:18px;">You can now sign in with your member ID or email and use the library services.</p>
        <p>For help, contact <a href="mailto:${libraryContactEmail}">${libraryContactEmail}</a>.</p>
      </div>
      <div style="background:#f9fafb;padding:14px 24px;color:#6b7280;font-size:12px;text-align:center;">
        ${libraryName}${libraryAddress ? " · " + libraryAddress : ""}
      </div>
    </div>
  </div>`;

  await sendLibraryEmail({
    to: user.email,
    subject,
    html,
  });
}

/* ===========================
   User Registration
   =========================== */
router.post("/register", async (req, res) => {
  try {
    const {
      userType,
      userFullName,
      memberId,
      age,
      dob,
      gender,
      department,
      address,
      mobileNumber,
      email,
      password,
    } = req.body;

    // Basic validation (you can adjust as needed)
    if (!userType || !userFullName || !memberId || !mobileNumber || !email || !password) {
      return res.status(400).json({
        message: "userType, userFullName, memberId, mobileNumber, email and password are required",
      });
    }

    // Check if email or memberId already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { memberId }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Member ID already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      userType,
      userFullName,
      memberId,
      age,
      dob,
      gender,
      department,
      address,
      mobileNumber,
      email,
      password: hashedPass,
      isAdmin: false,
    });

    // Save and return safe user (without password)
    const savedUser = await newUser.save();
    const { password: _, __v, updatedAt, ...safeUser } = savedUser.toObject();

    sendWelcomeEmail(safeUser).catch((emailErr) => {
      console.error("Failed to send welcome email:", emailErr);
    });

    return res.status(201).json(safeUser);
  } catch (err) {
    console.error("Error in /register:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ===========================
   User Login
   - Login with memberId OR email + password
   =========================== */
router.post("/signin", async (req, res) => {
  try {
    const { memberId, email, password } = req.body;

    // 1) Validate input
    if (!password || (!memberId && !email)) {
      return res
        .status(400)
        .json({ message: "Provide memberId or email AND password" });
    }

    // 2) Build query: prefer memberId if provided, else email
    const query = memberId ? { memberId } : { email };

    const user = await User.findOne(query);

    // 3) User not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4) Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 5) Remove password before sending
    const { password: _, __v, updatedAt, ...safeUser } = user.toObject();

    // 6) (Optional) here you could generate and return JWT
    return res.status(200).json(safeUser);
  } catch (err) {
    console.error("Error in /signin:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* Simple health check */
router.get("/ping", (req, res) => res.json({ ok: true, scope: "auth" }));

export default router;
