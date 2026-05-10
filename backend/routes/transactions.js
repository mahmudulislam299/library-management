// routes/transactionRoutes.js
import express from "express";
import Book from "../models/Book.js";
import BookTransaction from "../models/BookTransaction.js";
import User from "../models/User.js";
import { syncTransactionFine, syncTransactionFines } from "../utils/fines.js";
import {
  getMailRecipient,
  libraryAddress,
  libraryContactEmail,
  libraryLogoUrl,
  libraryName,
  libraryWebsite,
  sendLibraryEmail,
  sleep,
} from "../utils/mail.js";

const router = express.Router();

/* ===================== ISSUE / RESERVE EMAIL ===================== */

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
  const recipient = getMailRecipient(to);

  if (!recipient) {
    console.warn("sendTransactionEmail: no recipient email, skipping");
    return;
  }

  const fromStr = fromDate || "N/A";
  const toStr = toDate || "N/A";

  let titleLine = "";
  let fromLabel = "";
  let toLabel = "";

  if (transactionType === "Issue" || transactionType === "Issued") {
    titleLine = "Book Issued";
    fromLabel = "Issue Date";
    toLabel = "Return Date";
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
                      ${
                        libraryLogoUrl
                          ? `<img src="${libraryLogoUrl}" alt="${libraryName} Logo" style="height:40px;vertical-align:middle;margin-right:10px;border-radius:4px;">`
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

  console.log(`📧 Sending transaction email to ${recipient} for ${bookName} (${transactionType})`);

    // 👉 add small delay to avoid Mailtrap per-second limit
  await sleep(1000); // 1 seconds

  await sendLibraryEmail({
    to,
    subject,
    html,
  });
}

/* ===================== RETURN EMAIL ===================== */

async function sendReturnEmail({
  to,
  borrowerName,
  userType,
  memberId,
  bookName,
  author,
  fromDate,
  toDate,
  returnDate,
  transactionId,
}) {
  const recipient = getMailRecipient(to);

  if (!recipient) {
    console.warn("sendReturnEmail: no recipient email, skipping");
    return;
  }

  const fromStr = fromDate || "N/A";
  const toStr = toDate || "N/A";
  const returnStr = returnDate || "N/A";

  const idLabel =
    userType === "Student"
      ? `Admission ID`
      : userType === "Employee"
      ? `Employee ID`
      : `Member ID`;

  const subject = `Book Returned: ${bookName}`;

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
              <td style="background:linear-gradient(90deg,#43a047,#1e88e5);padding:16px 24px;color:#ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="font-size:20px;font-weight:bold;">
                      ${
                        libraryLogoUrl
                          ? `<img src="${libraryLogoUrl}" alt="${libraryName} Logo" style="height:40px;vertical-align:middle;margin-right:10px;border-radius:4px;">`
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
                <h2 style="margin:0;font-size:20px;color:#333333;">Book Returned</h2>
                <p style="margin:8px 0 0 0;font-size:14px;color:#555555;">
                  Dear ${borrowerName || "Member"},<br/>
                  This is a confirmation that the following book has been successfully <strong>returned</strong>.
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
                        <strong>Issue Date:</strong> ${fromStr}<br/>
                        <strong>Due Date:</strong> ${toStr}<br/>
                        <strong>Return Date:</strong> ${returnStr}<br/>
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
                <div style="background-color:#e8f5e9;border:1px solid #a5d6a7;border-radius:4px;padding:10px 12px;font-size:12px;color:#2e7d32;">
                  Thank you for returning the book.
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

  console.log(`📧 Sending return email to ${recipient} for ${bookName}`);

  await sendLibraryEmail({
    to,
    subject,
    html,
  });
}

async function sendFinePaymentEmail({
  to,
  borrowerName,
  userType,
  memberId,
  bookName,
  paidAmount,
  totalPaid,
  dueAmount,
  totalFine,
  paymentMethod,
  paymentReference,
  paidAt,
  transactionId,
}) {
  const recipient = getMailRecipient(to);

  if (!recipient) {
    console.warn("sendFinePaymentEmail: no recipient email, skipping");
    return;
  }

  const subject = `Fine Payment Received: ${bookName}`;
  const paymentDate = paidAt ? new Date(paidAt).toLocaleDateString("en-GB") : "N/A";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">
    <div style="max-width:620px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="background:#0f766e;color:#ffffff;padding:18px 24px;">
        <h2 style="margin:0;">${libraryName}</h2>
        <p style="margin:6px 0 0;">Fine Payment Confirmation</p>
      </div>
      <div style="padding:24px;color:#374151;">
        <p>Dear ${borrowerName || "Member"},</p>
        <p>Your library fine payment has been recorded successfully.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${borrowerName || "N/A"}</td></tr>
          <tr><td><strong>User Type</strong></td><td>${userType || "N/A"}</td></tr>
          <tr><td><strong>Member ID</strong></td><td>${memberId || "N/A"}</td></tr>
          <tr><td><strong>Book</strong></td><td>${bookName || "N/A"}</td></tr>
          <tr><td><strong>Paid Amount</strong></td><td>${paidAmount || 0} BDT</td></tr>
          <tr><td><strong>Total Fine</strong></td><td>${totalFine || 0} BDT</td></tr>
          <tr><td><strong>Total Paid</strong></td><td>${totalPaid || 0} BDT</td></tr>
          <tr><td><strong>Remaining Due</strong></td><td>${dueAmount || 0} BDT</td></tr>
          <tr><td><strong>Payment Method</strong></td><td>${paymentMethod || "N/A"}</td></tr>
          <tr><td><strong>Reference</strong></td><td>${paymentReference || "No reference"}</td></tr>
          <tr><td><strong>Payment Date</strong></td><td>${paymentDate}</td></tr>
          <tr><td><strong>Transaction ID</strong></td><td>${transactionId || "N/A"}</td></tr>
        </table>
        <p style="margin-top:18px;">If any information looks incorrect, contact <a href="mailto:${libraryContactEmail}">${libraryContactEmail}</a>.</p>
      </div>
      <div style="background:#f9fafb;padding:14px 24px;color:#6b7280;font-size:12px;text-align:center;">
        ${libraryName}${libraryAddress ? " · " + libraryAddress : ""}
      </div>
    </div>
  </div>`;

  console.log(`📧 Sending fine payment email to ${recipient} for ${bookName}`);
  await sendLibraryEmail({ to, subject, html });
}

async function sendDueReminderEmail({
  to,
  borrowerName,
  userType,
  memberId,
  bookName,
  fromDate,
  toDate,
  daysRemaining,
  transactionId,
}) {
  const recipient = getMailRecipient(to);

  if (!recipient) {
    console.warn("sendDueReminderEmail: no recipient email, skipping");
    return;
  }

  const dayText = daysRemaining === 0 ? "today" : `in ${daysRemaining} day(s)`;
  const subject = `Book Due Reminder: ${bookName}`;
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;padding:20px;">
    <div style="max-width:620px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="background:#b45309;color:#ffffff;padding:18px 24px;">
        <h2 style="margin:0;">${libraryName}</h2>
        <p style="margin:6px 0 0;">Book Due Reminder</p>
      </div>
      <div style="padding:24px;color:#374151;">
        <p>Dear ${borrowerName || "Member"},</p>
        <p>This is a reminder that your issued book is due <strong>${dayText}</strong>.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${borrowerName || "N/A"}</td></tr>
          <tr><td><strong>User Type</strong></td><td>${userType || "N/A"}</td></tr>
          <tr><td><strong>Member ID</strong></td><td>${memberId || "N/A"}</td></tr>
          <tr><td><strong>Book</strong></td><td>${bookName || "N/A"}</td></tr>
          <tr><td><strong>Issue Date</strong></td><td>${fromDate || "N/A"}</td></tr>
          <tr><td><strong>Due Date</strong></td><td>${toDate || "N/A"}</td></tr>
          <tr><td><strong>Transaction ID</strong></td><td>${transactionId || "N/A"}</td></tr>
        </table>
        <p style="margin-top:18px;">Please return the book on time to avoid fines. For help, contact <a href="mailto:${libraryContactEmail}">${libraryContactEmail}</a>.</p>
      </div>
      <div style="background:#f9fafb;padding:14px 24px;color:#6b7280;font-size:12px;text-align:center;">
        ${libraryName}${libraryAddress ? " · " + libraryAddress : ""}
      </div>
    </div>
  </div>`;

  console.log(`📧 Sending due reminder email to ${recipient} for ${bookName}`);
  await sendLibraryEmail({ to, subject, html });
}

/* ===================== TEST EMAIL ROUTE ===================== */

// GET http://localhost:5000/api/transactions/test-email
router.get("/test-email", async (req, res) => {
  try {
    const testRecipient = getMailRecipient(
      req.query.to || process.env.TEST_EMAIL_TO || libraryContactEmail
    );

    await sendLibraryEmail({
      to: testRecipient,
      subject: "Stamford Library Email Test",
      text: `This is a test email from ${libraryName}.`,
    });

    res.send(`Email sent to ${testRecipient}`);
  } catch (err) {
    console.error("SMTP Error:", err);
    res.status(500).send("Error sending email");
  }
});

const parseLibraryDate = (dateValue) => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) return dateValue;

  const raw = String(dateValue).trim();
  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(
      Number(ddmmyyyy[3]),
      Number(ddmmyyyy[2]) - 1,
      Number(ddmmyyyy[1])
    );
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStartOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getDaysUntilDue = (dateValue) => {
  const dueDate = parseLibraryDate(dateValue);
  if (!dueDate) return null;

  const today = getStartOfDay(new Date());
  const due = getStartOfDay(dueDate);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const findBorrowerForTransaction = async (transaction) => {
  let borrower = await User.findOne({ memberId: transaction.borrowerId });

  if (!borrower) {
    try {
      borrower = await User.findById(transaction.borrowerId);
    } catch (e) {
      // ignore invalid ObjectId
    }
  }

  return borrower;
};

const processDueReminders = async (daysBefore) => {
  const transactions = await BookTransaction.find({
    transactionType: "Issued",
    transactionStatus: "Active",
  });

  const dueSoon = transactions.filter((transaction) => {
    const daysRemaining = getDaysUntilDue(transaction.toDate);
    return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= daysBefore;
  });

  let sent = 0;

  for (const transaction of dueSoon) {
    const borrower = await findBorrowerForTransaction(transaction);

    if (!borrower?.email) {
      console.warn(`Due reminder skipped: no borrower email for ${transaction._id}`);
      continue;
    }

    await sendDueReminderEmail({
      to: borrower.email,
      borrowerName: borrower.userFullName || transaction.borrowerName,
      userType: borrower.userType,
      memberId: borrower.memberId,
      bookName: transaction.bookName,
      fromDate: transaction.fromDate,
      toDate: transaction.toDate,
      daysRemaining: getDaysUntilDue(transaction.toDate),
      transactionId: transaction._id.toString(),
    });
    sent += 1;
    await sleep(500);
  }

  return { matched: dueSoon.length, sent };
};

let lastDueReminderRunDate = "";
const runAutomaticDueReminders = async () => {
  const today = new Date().toISOString().slice(0, 10);

  if (lastDueReminderRunDate === today) return;

  lastDueReminderRunDate = today;

  try {
    const daysBefore = Number(process.env.DUE_REMINDER_DAYS_BEFORE || 1);
    const result = await processDueReminders(daysBefore);
    console.log(
      `📧 Automatic due reminders processed: ${result.sent}/${result.matched} sent`
    );
  } catch (err) {
    console.error("Automatic due reminder job failed:", err);
  }
};

if (process.env.ENABLE_DUE_REMINDER_JOB === "true") {
  setTimeout(runAutomaticDueReminders, 60 * 1000);
  setInterval(runAutomaticDueReminders, 60 * 60 * 1000);
}

/* ===================== TRANSACTION ROUTES ===================== */

// ADD TRANSACTION (Issue only)
router.post("/add-transaction", async (req, res) => {
  try {
    if (req.body.isAdmin === true) {
      const {
        bookId,
        borrowerId,     // MemberId or Mongo _id
        bookName,
        borrowerName,
        transactionType,
        fromDate,
        toDate,
      } = req.body;

      if (transactionType !== "Issued" && transactionType !== "Issue") {
        return res.status(400).json({
          message: "Reservation is no longer supported. Please issue the book directly.",
        });
      }

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

      // 3) Get borrower info (memberId or _id)
      let borrower = await User.findOne({ memberId: borrowerId });
      if (!borrower) {
        try {
          borrower = await User.findById(borrowerId);
        } catch (e) {
          // ignore invalid ObjectId
        }
      }

      if (!borrower) {
        console.warn(
          `sendTransactionEmail: no borrower found with memberId or _id = ${borrowerId}`
        );
      } else {
        const emailPayload = {
          to: borrower.email,
          borrowerName: borrower.userFullName || borrowerName,
          userType: borrower.userType,
          memberId: borrower.memberId,
          bookName: bookName || book?.bookName,
          author: book?.author,
          transactionType,
          fromDate,
          toDate,
          transactionId: transaction._id.toString(),
        };

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
    await syncTransactionFines(transactions);
    res.status(200).json(transactions);
  } catch (err) {
    return res.status(504).json(err);
  }
});

// UPDATE TRANSACTION (used for return)
router.put("/update-transaction/:id", async (req, res) => {
  try {
    if (!req.body.isAdmin) {
      return res
        .status(403)
        .json("You are not allowed to update a Transaction");
    }

    const transactionId = req.params.id;

    // 1) Get existing transaction before update
    const existing = await BookTransaction.findById(transactionId);
    if (!existing) {
      return res.status(404).json("Transaction not found");
    }

    // 2) Perform update
    const updated = await BookTransaction.findByIdAndUpdate(
      transactionId,
      { $set: req.body },
      { new: true }
    );
    await syncTransactionFine(updated);

    res.status(200).json("Transaction details updated successfully");

    // 3) Decide if we should send "Book Returned" email
    let shouldSendReturnEmail = false;

    // a) If transactionStatus changed to Returned / Completed
    if (req.body.transactionStatus) {
      const newStatus = String(req.body.transactionStatus).toLowerCase();
      const oldStatus = String(existing.transactionStatus || "").toLowerCase();

      if (
        (newStatus === "returned" || newStatus === "completed") &&
        newStatus !== oldStatus
      ) {
        shouldSendReturnEmail = true;
      }
    }

    // b) Or if returnDate was added where previously none
    if (req.body.returnDate && !existing.returnDate) {
      shouldSendReturnEmail = true;
    }

    if (!shouldSendReturnEmail) {
      return;
    }

    // 4) Fetch borrower & book
    const borrowerId = updated.borrowerId;
    const bookId = updated.bookId;

    let borrower = await User.findOne({ memberId: borrowerId });
    if (!borrower) {
      try {
        borrower = await User.findById(borrowerId);
      } catch (e) {
        // ignore invalid ObjectId
      }
    }

    if (!borrower) {
      console.warn(
        `sendReturnEmail: no borrower found with memberId or _id = ${borrowerId}`
      );
      return;
    }

    const book = await Book.findById(bookId);

    const emailPayload = {
      to: borrower.email,
      borrowerName: borrower.userFullName || updated.borrowerName,
      userType: borrower.userType,
      memberId: borrower.memberId,
      bookName: updated.bookName || book?.bookName,
      author: book?.author,
      fromDate: updated.fromDate,
      toDate: updated.toDate,
      returnDate: updated.returnDate || req.body.returnDate,
      transactionId: updated._id.toString(),
    };

    sendReturnEmail(emailPayload).catch((err) => {
      console.error("Failed to send return email:", err);
    });
  } catch (err) {
    console.error(err);
    res.status(504).json(err);
  }
});

// DEMO FINE PAYMENT
router.put("/pay-fine/:id", async (req, res) => {
  try {
    const { userId, amount, paymentMethod, paymentReference } = req.body;
    const allowedMethods = ["bKash", "Mobile Banking", "Regular Banking"];

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const transaction = await BookTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const payer = await User.findById(userId);
    const ownsTransaction =
      transaction.borrowerId === userId || transaction.borrowerId === payer?.memberId;

    if (!ownsTransaction) {
      return res.status(403).json({ message: "You can only pay your own fine" });
    }

    await syncTransactionFine(transaction);

    const paidAmount = Number(amount);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({ message: "A valid fine amount is required" });
    }

    if (transaction.fineAmountDue <= 0) {
      return res.status(400).json({ message: "No unpaid fine is available" });
    }

    transaction.fineAmountPaid = (transaction.fineAmountPaid || 0) + paidAmount;
    transaction.finePaymentMethod = paymentMethod;
    transaction.finePaymentReference = paymentReference || "";
    transaction.finePaidAt = new Date();
    transaction.finePayments.push({
      amount: paidAmount,
      method: paymentMethod,
      reference: paymentReference || "",
      paidAt: new Date(),
      recordedBy: userId,
      recordedByRole: "Member",
    });

    await syncTransactionFine(transaction);
    const updated = await transaction.save();
    sendFinePaymentEmail({
      to: payer?.email,
      borrowerName: payer?.userFullName || transaction.borrowerName,
      userType: payer?.userType,
      memberId: payer?.memberId,
      bookName: transaction.bookName,
      paidAmount,
      totalPaid: updated.fineAmountPaid,
      dueAmount: updated.fineAmountDue,
      totalFine: updated.fineTotalAccrued,
      paymentMethod,
      paymentReference,
      paidAt: transaction.finePaidAt,
      transactionId: updated._id.toString(),
    }).catch((err) => {
      console.error("Failed to send fine payment email:", err);
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error in /pay-fine/:id:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ADMIN DEMO FINE PAYMENT / MANUAL PAYMENT RECORD
router.put("/admin-record-fine-payment/:id", async (req, res) => {
  try {
    const {
      isAdmin,
      adminId,
      amount,
      paymentMethod,
      paymentReference,
    } = req.body;
    const allowedMethods = ["bKash", "Mobile Banking", "Regular Banking"];

    if (!isAdmin) {
      return res.status(403).json({ message: "Only admin can record payments" });
    }

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const transaction = await BookTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await syncTransactionFine(transaction);

    const paidAmount = Number(amount);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({ message: "A valid fine amount is required" });
    }

    if (transaction.fineAmountDue <= 0) {
      return res.status(400).json({ message: "No unpaid fine is available" });
    }

    transaction.fineAmountPaid = (transaction.fineAmountPaid || 0) + paidAmount;
    transaction.finePaymentMethod = paymentMethod;
    transaction.finePaymentReference = paymentReference || "";
    transaction.finePaidAt = new Date();
    transaction.finePayments.push({
      amount: paidAmount,
      method: paymentMethod,
      reference: paymentReference || "",
      paidAt: new Date(),
      recordedBy: adminId || "",
      recordedByRole: "Admin",
    });

    await syncTransactionFine(transaction);
    const updated = await transaction.save();
    const borrower = await findBorrowerForTransaction(updated);
    sendFinePaymentEmail({
      to: borrower?.email,
      borrowerName: borrower?.userFullName || updated.borrowerName,
      userType: borrower?.userType,
      memberId: borrower?.memberId,
      bookName: updated.bookName,
      paidAmount,
      totalPaid: updated.fineAmountPaid,
      dueAmount: updated.fineAmountDue,
      totalFine: updated.fineTotalAccrued,
      paymentMethod,
      paymentReference,
      paidAt: updated.finePaidAt,
      transactionId: updated._id.toString(),
    }).catch((err) => {
      console.error("Failed to send admin fine payment email:", err);
    });
    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error in /admin-record-fine-payment/:id:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// SEND DUE REMINDERS FOR ISSUED BOOKS DUE SOON
router.post("/send-due-reminders", async (req, res) => {
  try {
    const daysBefore = Number(req.body.daysBefore ?? process.env.DUE_REMINDER_DAYS_BEFORE ?? 1);

    if (!req.body.isAdmin) {
      return res.status(403).json({ message: "Only admin can send due reminders" });
    }

    if (!Number.isFinite(daysBefore) || daysBefore < 0) {
      return res.status(400).json({ message: "daysBefore must be zero or more" });
    }

    const result = await processDueReminders(daysBefore);

    return res.status(200).json({
      message: "Due reminder emails processed",
      matched: result.matched,
      sent: result.sent,
    });
  } catch (err) {
    console.error("Error in /send-due-reminders:", err);
    return res.status(500).json({ message: "Server error" });
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
