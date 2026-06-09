# Render Deployment Guide

This project works well on Render as two services:

- `library-management-api`: Node/Express backend
- `library-management-frontend`: React static site

## Before You Deploy

1. Push this repository to GitHub.
2. Rotate any real secrets that were previously committed.
3. Create a MongoDB database, usually with MongoDB Atlas.

## Recommended Setup

Render can read the included [render.yaml](/home/mahmudul/lib-management/Library-Management-System-MERN/render.yaml:1) and create both services for you.

In Render:

1. Open `Blueprints`.
2. Connect your GitHub repository.
3. Render will detect `render.yaml`.
4. Create the blueprint.

## Required Environment Values

Set these secret values when Render asks for them:

- `MONGO_URL`
- `JWT_SECRET`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `MAIL_FROM_EMAIL`
- `BREVO_API_KEY` if you use Brevo
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` if you use the Gmail API
- `LIBRARY_WEBSITE`
- `LIBRARY_CONTACT_EMAIL`
- `REACT_APP_API_URL`

Use the backend public URL for `REACT_APP_API_URL`, for example:

```text
https://library-management-api-sbve.onrender.com
```

Use the frontend public URL for `LIBRARY_WEBSITE`, for example:

```text
https://library-management-frontend.onrender.com
```

## Important Notes

- The frontend now supports root-path hosting on Render. It no longer assumes `/lms`.
- Client-side routing is handled by a rewrite rule in `render.yaml`.
- `ENABLE_DUE_REMINDER_JOB` is set to `false` by default in Render because free web services can sleep when idle.
- Render free web services also block outbound SMTP ports `25`, `465`, and `587`, so the Nodemailer SMTP fallback is not suitable for free production use.
- If you need reliable automatic reminder emails, use a paid always-on backend plan and SMTP, or use an HTTP API provider such as Gmail API or Brevo instead of SMTP.
- For Gmail API sending, set `MAIL_PROVIDER=gmail` and provide OAuth credentials with the `https://www.googleapis.com/auth/gmail.send` scope. The backend can also use `GMAIL_ACCESS_TOKEN` for short-lived local testing, but the refresh-token variables are better for deployment.

## Manual Render Setup

If you do not want to use `render.yaml`, create these services manually.

### Backend

- Environment: `Node`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend

- Environment: `Static Site`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`

Add a rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## After Deploy

1. Open the backend URL and confirm it returns `Welcome to LibraryApp`.
2. Set `REACT_APP_API_URL` on the frontend service to the backend URL if you did not set it during creation.
3. Redeploy the frontend after changing `REACT_APP_API_URL`.
