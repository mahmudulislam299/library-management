import express from "express";
import BookCategory from "../models/BookCategory.js";

const router = express.Router();

router.get("/allcategories", async (req, res) => {
  try {
    const categories = await BookCategory.find({});
    res.status(200).json(categories);
  } catch (err) {
    return res.status(504).json(err);
  }
});

// router.post("/addcategory", async (req, res) => {
//   try {
//     const newcategory = await new BookCategory({
//       categoryName: req.body.categoryName,
//     });
//     const category = await newcategory.save();
//     res.status(200).json(category);
//   } catch (err) {
//     return res.status(504).json(err);
//   }
// });


router.post("/addcategory", async (req, res) => {
  if (!req.body.isAdmin) {
    return res.status(403).json("You don't have permission to add categories!");
  }

  try {
    const categories = req.body.categories; // expect array of strings

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: "categories must be a non-empty array" });
    }

    const newCategories = [];

    for (const name of categories) {
      const existing = await BookCategory.findOne({ categoryName: name });
      if (!existing) {
        const newCat = new BookCategory({ categoryName: name });
        const saved = await newCat.save();
        newCategories.push(saved);
      }
    }

    res.status(201).json({
      message: `✅ Added ${newCategories.length} new categories`,
      categories: newCategories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
