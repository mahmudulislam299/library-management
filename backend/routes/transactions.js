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


  const libraryName = process.env.LIBRARY_NAME || "Stamford Library";
  const libraryWebsite = process.env.LIBRARY_WEBSITE || "#";
  const libraryContactEmail = process.env.LIBRARY_CONTACT_EMAIL || "no-reply@stamford-library.com";
  const libraryAddress = process.env.LIBRARY_ADDRESS || "";
  const libraryLogoUrl = process.env.LIBRARY_LOGO_URL || "Stamford";

  // Use the strings as they are stored
  const fromStr = fromDate || "N/A";
  const toStr   = toDate   || "N/A";

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
      ? `Admission ID`
      : userType === "Employee"
      ? `Employee ID`
      : `Member ID`;

  const subject = `${titleLine}: ${bookName}`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(90deg,#1e88e5,#3949ab);padding:16px 24px;color:#ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="font-size:20px;font-weight:bold;">
                      ${libraryLogoUrl
                        ? `<img src="${libraryLogoUrl}" alt="${libraryLogoUrl} Logo" style="height:40px;vertical-align:middle;margin-right:10px;border-radius:4px;">`
                        : ""
                      }
                      <span style="vertical-align:middle;">${libraryName}</span>
                    </td>
                    <td align="right" style="font-size:12px;">
                      <a href="${libraryWebsite}" style="color:#c5e1ff;text-decoration:none;">Visit website</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="padding:24px 24px 8px 24px;">
                <h2 style="margin:0;font-size:20px;color:#333333;">${titleLine}</h2>
                <p style="margin:8px 0 0 0;font-size:14px;color:#555555;">
                  Dear ${borrowerName || "Member"},<br/>
                  You have a new <strong>${transactionType}</strong> transaction in <strong>${libraryName}</strong>.
                </p>
              </td>
            </tr>

            <!-- Member & Book info -->
            <tr>
              <td style="padding:16px 24px 8px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <!-- Member Details -->
                    <td valign="top" style="width:50%;padding-right:8px;">
                      <h3 style="margin:0 0 8px 0;font-size:16px;color:#333333;border-bottom:1px solid #eeeeee;padding-bottom:4px;">
                        Member Details
                      </h3>
                      <p style="margin:4px 0;font-size:13px;color:#555555;">
                        <strong>Name:</strong> ${borrowerName || "N/A"}<br/>
                        <strong>User Type:</strong> ${userType || "N/A"}<br/>
                        <strong>${idLabel}:</strong> ${memberId || "N/A"}
                      </p>
                    </td>

                    <!-- Book Details -->
                    <td valign="top" style="width:50%;padding-left:8px;">
                      <h3 style="margin:0 0 8px 0;font-size:16px;color:#333333;border-bottom:1px solid #eeeeee;padding-bottom:4px;">
                        Book Details
                      </h3>
                      <p style="margin:4px 0;font-size:13px;color:#555555;">
                        <strong>Book Name:</strong> ${bookName}<br/>
                        <strong>Author:</strong> ${author || "N/A"}<br/>
                        <strong>Transaction Type:</strong> ${transactionType}<br/>
                        <strong>${fromLabel}:</strong> ${fromStr}<br/>
                        <strong>${toLabel}:</strong> ${toStr}<br/>
                        <strong>Transaction ID:</strong> ${transactionId}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Info / note -->
            <tr>
              <td style="padding:8px 24px 16px 24px;">
                <div style="background-color:#fff8e1;border:1px solid #ffe082;border-radius:4px;padding:10px 12px;font-size:12px;color:#6d4c41;">
                  Please make sure to follow library rules and return/collect the book on time.
                  If you have any questions, contact us at
                  <a href="mailto:${libraryContactEmail}" style="color:#1e88e5;">${libraryContactEmail}</a>.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f5f5f5;padding:12px 24px;font-size:11px;color:#777777;text-align:center;border-top:1px solid #e0e0e0;">
                ${libraryName}${libraryAddress ? " · " + libraryAddress : ""}<br/>
                This is an automated notification. Please do not reply directly to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  console.log(`📧 Sending transaction email to ${to} for ${bookName} (${transactionType})`);

  await transporter.sendMail({
    from: `"${libraryName}" <${libraryContactEmail}>`,
    to,
    subject,
    html,
    replyTo: libraryContactEmail,
    // cc: "librarian@stamford-library.com", // optional: CC librarian
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
