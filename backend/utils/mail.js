import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
const mailProvider = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();
const brevoApiKey = process.env.BREVO_API_KEY || "";
const brevoApiUrl =
  process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";
const resendApiKey = process.env.RESEND_API_KEY || "";
const resendApiUrl =
  process.env.RESEND_API_URL || "https://api.resend.com/emails";

export const libraryName = process.env.LIBRARY_NAME || "Stamford Library";
export const libraryWebsite = process.env.LIBRARY_WEBSITE || "#";
export const libraryContactEmail =
  process.env.LIBRARY_CONTACT_EMAIL || process.env.SMTP_USER;
export const libraryAddress = process.env.LIBRARY_ADDRESS || "";
export const libraryLogoUrl = process.env.LIBRARY_LOGO_URL || "";
export const mailFromEmail =
  process.env.MAIL_FROM_EMAIL ||
  process.env.SMTP_FROM_EMAIL ||
  process.env.SMTP_USER ||
  libraryContactEmail;
export const mailFromName =
  process.env.MAIL_FROM_NAME || process.env.SMTP_FROM_NAME || libraryName;
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

const shouldUseBrevoApi = mailProvider === "brevo" && Boolean(brevoApiKey);
const shouldUseResendApi = mailProvider === "resend" && Boolean(resendApiKey);

export const transporter = shouldUseBrevoApi || shouldUseResendApi
  ? null
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

if (shouldUseBrevoApi) {
  console.log("✅ Mail provider configured: Brevo API");
} else if (shouldUseResendApi) {
  console.log("✅ Mail provider configured: Resend API");
} else if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error("SMTP Verify Error:", error);
    } else {
      console.log("✅ SMTP server is ready to take messages");
    }
  });
}

async function sendViaBrevoApi({
  recipient,
  copyRecipients,
  subject,
  html,
  text,
}) {
  const payload = {
    sender: {
      name: mailFromName,
      email: mailFromEmail,
    },
    to: normalizeEmailList(recipient).map((email) => ({ email })),
    subject,
    replyTo: {
      email: libraryContactEmail,
      name: libraryName,
    },
  };

  if (copyRecipients.length > 0) {
    payload.bcc = copyRecipients.map((email) => ({ email }));
  }

  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;

  const response = await fetch(brevoApiUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Brevo API request failed (${response.status}): ${errorText}`
    );
  }

  return response.json().catch(() => ({}));
}

async function sendViaResendApi({
  recipient,
  copyRecipients,
  subject,
  html,
  text,
}) {
  const payload = {
    from: `${mailFromName} <${mailFromEmail}>`,
    to: normalizeEmailList(recipient),
    subject,
    reply_to: libraryContactEmail,
  };

  if (copyRecipients.length > 0) {
    payload.bcc = copyRecipients;
  }

  if (html) payload.html = html;
  if (text !== undefined) {
    payload.text = text;
  }

  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Resend API request failed (${response.status}): ${errorText}`
    );
  }

  return response.json().catch(() => ({}));
}

export async function sendLibraryEmail({ to, subject, html, text }) {
  const recipient = getMailRecipient(to);
  const copyRecipients = getCopyRecipients(recipient);

  if (!recipient) {
    console.warn(`sendLibraryEmail: no recipient for "${subject}", skipping`);
    return;
  }

  if (shouldUseBrevoApi) {
    return sendViaBrevoApi({
      recipient,
      copyRecipients,
      subject,
      html,
      text,
    });
  }

  if (shouldUseResendApi) {
    return sendViaResendApi({
      recipient,
      copyRecipients,
      subject,
      html,
      text,
    });
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
