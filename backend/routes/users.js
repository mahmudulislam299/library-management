import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* Get user by database _id */
router.get("/getuser/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("activeTransactions")
      .populate("prevTransactions")
      .select("-password -updatedAt -__v"); // hide sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /getuser/:id:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ✅ Get user by memberId (common ID for Student + Employee) */
router.get("/by-memberid/:memberId", async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.params.memberId })
      .populate("activeTransactions")
      .populate("prevTransactions")
      .select("-password -updatedAt -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error in /by-memberid/:memberId:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* Get all members in the library */
router.get("/allmembers", async (req, res) => {
  try {
    const users = await User.find({})
      .populate("activeTransactions")
      .populate("prevTransactions")
      .sort({ _id: -1 })
      .select("-password -updatedAt -__v");

    res.status(200).json(users);
  } catch (err) {
    console.error("Error in /allmembers:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* 🔒 Update user by id (SAFE: does NOT allow isAdmin to be modified) */
router.put("/updateuser/:id", async (req, res) => {
  // only owner or admin can update, based on what frontend sends
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const updateData = { ...req.body };

      // ❌ Never allow client to change these via this route
      delete updateData.isAdmin;
      delete updateData.userId;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.__v;

      // Handle password hashing if password is being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      await User.findByIdAndUpdate(req.params.id, { $set: updateData });
      res.status(200).json("Account has been updated");
    } catch (err) {
      console.error("Error in /updateuser/:id:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

/* Add transaction to activeTransactions list */
router.put("/:id/move-to-activetransactions", async (req, res) => {
  // Frontend passes isAdmin in body – still used for now
  if (req.body.isAdmin) {
    try {
      const user = await User.findById(req.body.userId);
      if (!user) {
        return res.status(404).json("User not found");
      }

      await user.updateOne({ $push: { activeTransactions: req.params.id } });
      res.status(200).json("Added to Active Transaction");
    } catch (err) {
      console.error("Error in /:id/move-to-activetransactions:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(403).json("Only Admin can add a transaction");
  }
});

/* Move transaction from active → previous */
router.put("/:id/move-to-prevtransactions", async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const user = await User.findById(req.body.userId);
      if (!user) {
        return res.status(404).json("User not found");
      }

      await user.updateOne({ $pull: { activeTransactions: req.params.id } });
      await user.updateOne({ $push: { prevTransactions: req.params.id } });
      res.status(200).json("Added to previous transaction");
    } catch (err) {
      console.error("Error in /:id/move-to-prevtransactions:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(403).json("Only Admin can do this");
  }
});

/* Delete user by id */
router.delete("/deleteuser/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      console.error("Error in /deleteuser/:id:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

export default router;
