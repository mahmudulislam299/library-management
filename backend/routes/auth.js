import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* User Registration */
router.post("/register", async (req, res) => {
  try {
    /* Salting and Hashing the Password */
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    /* Create a new user */
    const newuser = await new User({
      userType: req.body.userType,
      userFullName: req.body.userFullName,
      admissionId: req.body.admissionId,
      employeeId: req.body.employeeId,
      age: req.body.age,
      dob: req.body.dob,
      gender: req.body.gender,
      address: req.body.address,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      password: hashedPass,
      isAdmin: req.body.isAdmin,
    });

    /* Save User and Return */
    const user = await newuser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

// /* User Login */
// router.post("/signin", async (req, res) => {
//   try {
//     console.log(req.body, "req");
//     const user = req.body.admissionId
//       ? await User.findOne({
//           admissionId: req.body.admissionId,
//         })
//       : await User.findOne({
//           employeeId: req.body.employeeId,
//         });

//     console.log(user, "user");

//     !user && res.status(404).json("User not found");

//     const validPass = await bcrypt.compare(req.body.password, user.password);
//     !validPass && res.status(400).json("Wrong Password");

//     res.status(200).json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

router.post("/signin", async (req, res) => {
  try {
    const { admissionId, employeeId, email, password } = req.body;

    // 1) Validate inputs
    if (!password || (!admissionId && !employeeId && !email)) {
      return res
        .status(400)
        .json({ message: "Provide admissionId/employeeId/email and password" });
    }

    // 2) Build a flexible query (login with admissionId OR employeeId OR email)
    const or = [];
    if (admissionId) or.push({ admissionId });
    if (employeeId) or.push({ employeeId });
    if (email)      or.push({ email });

    const user = await User.findOne({ $or: or });

    // 3) Handle "user not found" and STOP execution
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4) Verify password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 5) (Optional) Remove password from response
    const { password: _, ...safeUser } = user.toObject();

    // 6) Return user (or generate and return a JWT here)
    return res.status(200).json(safeUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});




router.get("/ping", (req, res) => res.json({ ok: true, scope: "auth" }));



export default router;
