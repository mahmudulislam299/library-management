import express from "express";
import Book from "../models/Book.js";
import BookCategory from "../models/BookCategory.js";

const router = express.Router();

/* Get all books in the db */
router.get("/allbooks", async (req, res) => {
  try {
    const books = await Book.find({})
      .populate("transactions")
      .sort({ _id: -1 });
    res.status(200).json(books);
  } catch (err) {
    return res.status(504).json(err);
  }
});

/* Get Book by book Id */
router.get("/getbook/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("transactions");
    res.status(200).json(book);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* Get books by category name */
router.get("/", async (req, res) => {
  const category = req.query.category;
  try {
    const books = await BookCategory.findOne({
      categoryName: category,
    }).populate("books");
    res.status(200).json(books);
  } catch (err) {
    return res.status(504).json(err);
  }
});

/* Adding book */
router.post("/addbook", async (req, res) => {
  if (!req.body.isAdmin) {
    return res
      .status(403)
      .json("You dont have permission to add a book!");
  }

  try {
    const newbook = new Book({
      bookName: req.body.bookName,
      alternateTitle: req.body.alternateTitle,
      author: req.body.author,
      bookCountAvailable: req.body.bookCountAvailable,
      language: req.body.language,
      publisher: req.body.publisher,
      // frontend should send `bookStatus`
      bookStatus: req.body.bookStatus,
      categories: req.body.categories,
      // ⭐ shelf number
      shelfNumber: req.body.shelfNumber,
    });

    const book = await newbook.save();

    if (book.categories && book.categories.length > 0) {
      await BookCategory.updateMany(
        { _id: { $in: book.categories } },
        { $push: { books: book._id } }
      );
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(504).json(err);
  }
});

/* Add multiple books at once (for bulk import via Insomnia) */
router.post("/addmanybooks", async (req, res) => {
  if (!req.body.isAdmin) {
    return res
      .status(403)
      .json("You dont have permission to add books!");
  }

  try {
    const booksData = req.body.books; // expect an array of book objects

    if (!Array.isArray(booksData) || booksData.length === 0) {
      return res
        .status(400)
        .json({ message: "books must be a non-empty array" });
    }

    const createdBooks = [];

    for (const b of booksData) {
      const newBook = new Book({
        bookName: b.bookName,
        alternateTitle: b.alternateTitle,
        author: b.author,
        bookCountAvailable: b.bookCountAvailable,
        language: b.language,
        publisher: b.publisher,
        bookStatus: b.bookStatus || "Available",
        categories: b.categories || [],
        // ⭐ shelf number for bulk add
        shelfNumber: b.shelfNumber,
      });

      const saved = await newBook.save();
      createdBooks.push(saved);

      if (saved.categories && saved.categories.length > 0) {
        await BookCategory.updateMany(
          { _id: { $in: saved.categories } },
          { $push: { books: saved._id } }
        );
      }
    }

    res.status(201).json({
      message: `✅ Added ${createdBooks.length} books successfully`,
      books: createdBooks,
    });
  } catch (err) {
    console.error("Error in /addmanybooks:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

/* Updating book */
router.put("/updatebook/:id", async (req, res) => {
  const isAdmin = req.body && req.body.isAdmin;

  if (!isAdmin) {
    return res
      .status(403)
      .json("You dont have permission to update a book!");
  }

  // remove isAdmin so it doesn't get stored in DB
  const { isAdmin: _, ...rest } = req.body;

  // Only allow specific fields to be updated
  const allowedFields = [
    "bookName",
    "alternateTitle",
    "author",
    "language",
    "publisher",
    "bookCountAvailable",
    "bookStatus",
    "shelfNumber",
    "categories",
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (rest[field] !== undefined) {
      updateData[field] = rest[field];
    }
  });

  try {
    await Book.findByIdAndUpdate(req.params.id, { $set: updateData });
    res.status(200).json("Book details updated successfully");
  } catch (err) {
    res.status(504).json(err);
  }
});

/* Remove book */
router.delete("/removebook/:id", async (req, res) => {
  // ⚠️ SAFE: don't destructure; req.body might be undefined
  const isAdmin =
    (req.body && req.body.isAdmin) ||
    (req.query && req.query.isAdmin === "true");

  if (!isAdmin) {
    return res
      .status(403)
      .json("You dont have permission to delete a book!");
  }

  try {
    const _id = req.params.id;
    const book = await Book.findById(_id);

    if (!book) {
      return res.status(404).json("Book not found");
    }

    await book.remove();

    if (book.categories && book.categories.length > 0) {
      await BookCategory.updateMany(
        { _id: { $in: book.categories } },
        { $pull: { books: book._id } }
      );
    }

    res.status(200).json("Book has been deleted");
  } catch (err) {
    return res.status(504).json(err);
  }
});

export default router;
