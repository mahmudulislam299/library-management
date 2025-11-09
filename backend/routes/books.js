import express from "express"
import Book from "../models/Book.js"
import BookCategory from "../models/BookCategory.js"

const router = express.Router()

/* Get all books in the db */
router.get("/allbooks", async (req, res) => {
    try {
        const books = await Book.find({}).populate("transactions").sort({ _id: -1 })
        res.status(200).json(books)
    }
    catch (err) {
        return res.status(504).json(err);
    }
})

/* Get Book by book Id */
router.get("/getbook/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate("transactions")
        res.status(200).json(book)
    }
    catch {
        return res.status(500).json(err)
    }
})

/* Get books by category name*/
router.get("/", async (req, res) => {
    const category = req.query.category
    try {
        const books = await BookCategory.findOne({ categoryName: category }).populate("books")
        res.status(200).json(books)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

/* Adding book */
router.post("/addbook", async (req, res) => {
    if (req.body.isAdmin) {
        try {
            const newbook = await new Book({
                bookName: req.body.bookName,
                alternateTitle: req.body.alternateTitle,
                author: req.body.author,
                bookCountAvailable: req.body.bookCountAvailable,
                language: req.body.language,
                publisher: req.body.publisher,
                bookStatus: req.body.bookSatus,
                categories: req.body.categories
            })
            const book = await newbook.save()
            await BookCategory.updateMany({ '_id': book.categories }, { $push: { books: book._id } });
            res.status(200).json(book)
        }
        catch (err) {
            res.status(504).json(err)
        }
    }
    else {
        return res.status(403).json("You dont have permission to add a book!");
    }
})

/* Add multiple books at once (for bulk import via Insomnia) */
router.post("/addmanybooks", async (req, res) => {
  if (!req.body.isAdmin) {
    return res.status(403).json("You dont have permission to add books!");
  }

  try {
    const booksData = req.body.books;  // expect an array of book objects

    if (!Array.isArray(booksData) || booksData.length === 0) {
      return res.status(400).json({ message: "books must be a non-empty array" });
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
        categories: b.categories || []
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
      books: createdBooks
    });
  } catch (err) {
    console.error("Error in /addmany:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});


/* Addding book */
router.put("/updatebook/:id", async (req, res) => {
    if (req.body.isAdmin) {
        try {
            await Book.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Book details updated successfully");
        }
        catch (err) {
            res.status(504).json(err);
        }
    }
    else {
        return res.status(403).json("You dont have permission to delete a book!");
    }
})

/* Remove book  */
router.delete("/removebook/:id", async (req, res) => {
    if (req.body.isAdmin) {
        try {
            const _id = req.params.id
            const book = await Book.findOne({ _id })
            await book.remove()
            await BookCategory.updateMany({ '_id': book.categories }, { $pull: { books: book._id } });
            res.status(200).json("Book has been deleted");
        } catch (err) {
            return res.status(504).json(err);
        }
    } else {
        return res.status(403).json("You dont have permission to delete a book!");
    }
})

export default router