import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

export const libraryName = process.env.LIBRARY_NAME || "Stamford Library";
export const libraryWebsite = process.env.LIBRARY_WEBSITE || "#";
export const libraryContactEmail =
  process.env.LIBRARY_CONTACT_EMAIL || process.env.SMTP_USER;
export const libraryAddress = process.env.LIBRARY_ADDRESS || "";
export const libraryLogoUrl = process.env.LIBRARY_LOGO_URL || "";
export const mailFromEmail =
  process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || libraryContactEmail;
export const mailFromName = process.env.SMTP_FROM_NAME || libraryName;
export const mailOverrideTo = process.env.MAIL_OVERRIDE_TO || "";
export const mailCopyTo = process.env.MAIL_COPY_TO || "";

export const getMailRecipient = (to) => mailOverrideTo || to;

const normalizeEmailList = (value) =>
  String(value || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const getCopyRecipients = (recipient) => {
  if (mailOverrideTo) return [];

  const primaryRecipients = new Set(
    normalizeEmailList(recipient).map((email) => email.toLowerCase())
  );

  return normalizeEmailList(mailCopyTo).filter(
    (email) => !primaryRecipients.has(email.toLowerCase())
  );
};

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("✅ SMTP server is ready to take messages");
  }
});

export async function sendLibraryEmail({ to, subject, html, text }) {
  const recipient = getMailRecipient(to);
  const copyRecipients = getCopyRecipients(recipient);

  if (!recipient) {
    console.warn(`sendLibraryEmail: no recipient for "${subject}", skipping`);
    return;
  }

  return transporter.sendMail({
    from: `"${mailFromName}" <${mailFromEmail}>`,
    to: recipient,
    bcc: copyRecipients.length > 0 ? copyRecipients : undefined,
    subject,
    html,
    text,
    replyTo: libraryContactEmail,
  });
}

export const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
