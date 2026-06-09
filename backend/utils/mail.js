import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
const mailProvider = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();
const brevoApiKey = process.env.BREVO_API_KEY || "";
const brevoApiUrl =
  process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";
const gmailApiUrl =
  process.env.GMAIL_API_URL ||
  `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(
    process.env.GMAIL_USER_ID || "me"
  )}/messages/send`;
const gmailAccessToken = process.env.GMAIL_ACCESS_TOKEN || "";
const gmailClientId = process.env.GMAIL_CLIENT_ID || "";
const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET || "";
const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN || "";

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
const shouldUseGmailApi =
  mailProvider === "gmail" &&
  (Boolean(gmailAccessToken) ||
    Boolean(gmailClientId && gmailClientSecret && gmailRefreshToken));
const requestedApiProviderWithoutKey =
  (mailProvider === "brevo" && !brevoApiKey) ||
  (mailProvider === "gmail" && !shouldUseGmailApi);

export const transporter = shouldUseBrevoApi || shouldUseGmailApi
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
} else if (shouldUseGmailApi) {
  console.log("✅ Mail provider configured: Gmail API");
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

const encodeHeaderValue = (value) => {
  const normalized = String(value || "").replace(/[\r\n]+/g, " ").trim();
  return /[^\x20-\x7E]/.test(normalized)
    ? `=?UTF-8?B?${Buffer.from(normalized, "utf8").toString("base64")}?=`
    : normalized;
};

const formatAddress = (email, name = "") => {
  const safeEmail = String(email || "").replace(/[\r\n<>]/g, "").trim();
  const safeName = encodeHeaderValue(name);
  return safeName ? `${safeName} <${safeEmail}>` : safeEmail;
};

const encodeBase64Url = (value) =>
  Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const encodeMimeBody = (value) =>
  Buffer.from(String(value || ""), "utf8").toString("base64");

function buildGmailRawMessage({
  recipient,
  copyRecipients,
  subject,
  html,
  text,
}) {
  const headers = [
    `From: ${formatAddress(mailFromEmail, mailFromName)}`,
    `To: ${normalizeEmailList(recipient).join(", ")}`,
    copyRecipients.length > 0 ? `Bcc: ${copyRecipients.join(", ")}` : null,
    `Subject: ${encodeHeaderValue(subject)}`,
    `Reply-To: ${formatAddress(
      libraryContactEmail || mailFromEmail,
      libraryName
    )}`,
    "MIME-Version: 1.0",
  ].filter(Boolean);

  if (html && text !== undefined) {
    const boundary = `library-boundary-${Date.now().toString(36)}`;

    return [
      ...headers,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      encodeMimeBody(text),
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      encodeMimeBody(html),
      `--${boundary}--`,
      "",
    ].join("\r\n");
  }

  return [
    ...headers,
    `Content-Type: ${html ? "text/html" : "text/plain"}; charset="UTF-8"`,
    "Content-Transfer-Encoding: base64",
    "",
    encodeMimeBody(html || text || ""),
    "",
  ].join("\r\n");
}

async function getGmailAccessToken() {
  if (gmailAccessToken) return gmailAccessToken;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: gmailClientId,
      client_secret: gmailClientSecret,
      refresh_token: gmailRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gmail OAuth token request failed (${response.status}): ${errorText}`
    );
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

async function sendViaGmailApi({
  recipient,
  copyRecipients,
  subject,
  html,
  text,
}) {
  const rawMessage = buildGmailRawMessage({
    recipient,
    copyRecipients,
    subject,
    html,
    text,
  });

  const response = await fetch(gmailApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getGmailAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodeBase64Url(rawMessage) }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gmail API request failed (${response.status}): ${errorText}`
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

  if (requestedApiProviderWithoutKey) {
    throw new Error(
      `Mail provider "${mailProvider}" is selected but required credentials are missing`
    );
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

  if (shouldUseGmailApi) {
    return sendViaGmailApi({
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
