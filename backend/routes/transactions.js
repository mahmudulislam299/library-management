// routes/transactionRoutes.js
import express from "express";
import nodemailer from "nodemailer";
import Book from "../models/Book.js";
import BookTransaction from "../models/BookTransaction.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* ===================== EMAIL SETUP ===================== */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                 // sandbox.smtp.mailtrap.io
  port: Number(process.env.SMTP_PORT),         // 2525
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("✅ SMTP server is ready to take messages");
  }
});

async function sendTransactionEmail({
  to,
  borrowerName,
  userType,
  memberId,
  bookName,
  author,
  transactionType,
  fromDate,
  toDate,
  transactionId,
}) {
  if (!to) {
    console.warn("sendTransactionEmail: no recipient email, skipping");
    return;
  }

  // Format dates nicely (if they are ISO strings)
  const fromStr = fromDate ? new Date(fromDate).toLocaleDateString("en-GB") : "N/A";
  const toStr   = toDate   ? new Date(toDate).toLocaleDateString("en-GB")   : "N/A";

  let titleLine = "";
  let fromLabel = "";
  let toLabel = "";

  if (transactionType === "Issue") {
    titleLine = "Book Issued";
    fromLabel = "Issue Date";
    toLabel = "Return Date";
  } else if (transactionType === "Reservation") {
    titleLine = "Book Reserved";
    fromLabel = "Reservation Start";
    toLabel = "Reservation End / Expected Return";
  } else {
    titleLine = "Book Transaction";
    fromLabel = "From Date";
    toLabel = "To Date";
  }

  const idLabel =
    userType === "Student"
      ? `Admission ID: ${memberId}`
      : userType === "Employee"
      ? `Employee ID: ${memberId}`
      : `Member ID: ${memberId}`;

  const subject = `${titleLine}: ${bookName}`;

  const html = `
    <h2>Dear ${borrowerName || "Member"},</h2>
    <p>You have a new <strong>${transactionType}</strong> transaction in <strong>Stamford Library</strong>.</p>

    <h3>Member Details</h3>
    <ul>
      <li><strong>Name:</strong> ${borrowerName || "N/A"}</li>
      <li><strong>User Type:</strong> ${userType || "N/A"}</li>
      <li><strong>${idLabel}</strong></li>
    </ul>

    <h3>Book Details</h3>
    <ul>
      <li><strong>Book Name:</strong> ${bookName}</li>
      <li><strong>Author:</strong> ${author || "N/A"}</li>
      <li><strong>Transaction Type:</strong> ${transactionType}</li>
      <li><strong>${fromLabel}:</strong> ${fromStr}</li>
      <li><strong>${toLabel}:</strong> ${toStr}</li>
      <li><strong>Transaction ID:</strong> ${transactionId}</li>
    </ul>

    <p>Please make sure to follow library rules and return/collect the book on time.</p>

    <p>Best regards,<br/>Stamford Library</p>
  `;

  console.log(`📧 Sending transaction email to ${to} for ${bookName} (${transactionType})`);

  await transporter.sendMail({
    from: `"Stamford Library" <no-reply@stamford-library.com>`,
    to,
    subject,
    html,
  });
}

/* ===================== TEST EMAIL ROUTE ===================== */

// GET http://localhost:5000/api/transactions/test-email
router.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Stamford Library" <no-reply@stamford-library.com>`,
      to: "mahmudulislam299@gmail.com",
      subject: "Mailtrap Test",
      text: "This is a test email from the Library system using Mailtrap.",
    });

    res.send("Email sent (check your Mailtrap inbox)");
  } catch (err) {
    console.error("SMTP Error:", err);
    res.status(500).send("Error sending email");
  }
});

/* ===================== TRANSACTION ROUTES ===================== */

// ADD TRANSACTION (Issue / Reservation)
router.post("/add-transaction", async (req, res) => {
  try {
    if (req.body.isAdmin === true) {
      const {
        bookId,
        borrowerId,     // memberId (Admission / Employee ID)
        bookName,
        borrowerName,
        transactionType, // "Issue" or "Reservation"
        fromDate,
        toDate,
      } = req.body;

      // 1) Create transaction
      const newTransaction = new BookTransaction({
        bookId,
        borrowerId,
        bookName,
        borrowerName,
        transactionType,
        fromDate,
        toDate,
      });

      const transaction = await newTransaction.save();

      // 2) Attach transaction to Book
      const book = await Book.findById(bookId);
      if (book) {
        await book.updateOne({ $push: { transactions: transaction._id } });
      }

    
      // 3) Get borrower info from User collection
        let borrower = await User.findOne({ memberId: borrowerId }); // case 1: borrowerId is memberId

        if (!borrower) {
        // case 2: borrowerId is actually the MongoDB _id
        try {
            borrower = await User.findById(borrowerId);
        } catch (e) {
            // invalid ObjectId format, ignore
        }
        }

        if (!borrower) {
        console.warn(`No borrower found with memberId or _id = ${borrowerId}, skipping email`);
        } else {
        // 4) Prepare data for email
        const emailPayload = {
            to: borrower.email,
            borrowerName: borrower.userFullName || borrowerName,
            userType: borrower.userType,
            memberId: borrower.memberId,                 // use real memberId here
            bookName: bookName || book?.bookName,
            author: book?.author,
            transactionType,
            fromDate,
            toDate,
            transactionId: transaction._id.toString(),
        };

        // 5) Send email (Issue & Reservation)
        sendTransactionEmail(emailPayload).catch((err) => {
            console.error("Failed to send transaction email:", err);
        });
        }


      return res.status(200).json(transaction);
    } else {
      return res
        .status(403)
        .json("You are not allowed to add a Transaction");
    }
  } catch (err) {
    console.error(err);
    return res.status(504).json(err);
  }
});

// GET ALL TRANSACTIONS
router.get("/all-transactions", async (req, res) => {
  try {
    const transactions = await BookTransaction.find({}).sort({ _id: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    return res.status(504).json(err);
  }
});

// UPDATE TRANSACTION
router.put("/update-transaction/:id", async (req, res) => {
  try {
    if (req.body.isAdmin) {
      await BookTransaction.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Transaction details updated successfully");
    } else {
      res.status(403).json("You are not allowed to update a Transaction");
    }
  } catch (err) {
    res.status(504).json(err);
  }
});

// DELETE TRANSACTION
router.delete("/remove-transaction/:id", async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const data = await BookTransaction.findByIdAndDelete(req.params.id);
      if (data) {
        const book = await Book.findById(data.bookId);
        if (book) {
          await book.updateOne({ $pull: { transactions: req.params.id } });
        }
      }
      res.status(200).json("Transaction deleted successfully");
    } catch (err) {
      return res.status(504).json(err);
    }
  } else {
    return res
      .status(403)
      .json("You dont have permission to delete a book!");
  }
});

export default router;
