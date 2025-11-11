import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

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
      isAdmin,
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
      isAdmin: !!isAdmin,
    });

    // Save and return safe user (without password)
    const savedUser = await newUser.save();
    const { password: _, __v, updatedAt, ...safeUser } = savedUser.toObject();

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
