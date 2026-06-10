# Deployment Guide

Server: `root@45.33.73.218`

This setup serves the React app from `/lms` with Nginx on port `80` and proxies `/api` requests to the Node backend on port `5000`.

## 1. Prepare Server

SSH into the server:

```bash
ssh root@45.33.73.218
```

Install Node.js, Nginx, Git, and PM2:

```bash
apt update
apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

## 2. Clone Project

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/mahmudulislam299/library-management.git library-management
cd /var/www/library-management
```

If the server already has the project:

```bash
cd /var/www/library-management
git pull
```

## 3. Backend Environment

Create backend `.env`:

```bash
nano /var/www/library-management/backend/.env
```

Use your real values:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=replace_with_a_strong_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=stamford.university.bd.library@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM_NAME=Stamford Library
SMTP_FROM_EMAIL=stamford.university.bd.library@gmail.com
MAIL_OVERRIDE_TO=
MAIL_COPY_TO=farhanaedu2024@gmail.com
TEST_EMAIL_TO=farhanaedu2024@gmail.com
DUE_REMINDER_DAYS_BEFORE=1
ENABLE_DUE_REMINDER_JOB=true

LIBRARY_NAME=Stamford Library
LIBRARY_WEBSITE=http://45.33.73.218/lms
LIBRARY_CONTACT_EMAIL=stamford.university.bd.library@gmail.com
LIBRARY_ADDRESS=Stamford University Bangladesh, Dhaka
LIBRARY_LOGO_URL=
```

## 4. Install And Run Backend

```bash
cd /var/www/library-management/backend
npm install
pm2 start server.js --name library-backend
pm2 save
pm2 startup
```

After `pm2 startup`, run the command PM2 prints.

## 5. Build Frontend

```bash
cd /var/www/library-management/frontend
npm install
npm run build
```

The production build uses `/lms` as the React base path. API calls use:

```env
REACT_APP_API_URL=http://45.33.73.218
```

from `frontend/.env.production`.

## 6. Configure Nginx

Create Nginx config:

```bash
nano /etc/nginx/sites-available/library-management
```

Paste:

```nginx
server {
    listen 80;
    server_name 45.33.73.218;

    index index.html;

    location / {
        return 404;
    }

    location = /lms {
        return 301 /lms/;
    }

    location /lms/ {
        alias /var/www/library-management/frontend/build/;
        try_files $uri $uri/ /lms/index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
ln -sf /etc/nginx/sites-available/library-management /etc/nginx/sites-enabled/library-management
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 7. Check Deployment

Open:

```text
http://45.33.73.218/lms
```

Check backend:

```bash
curl http://45.33.73.218/api/transactions/test-email
pm2 logs library-backend
```

## Update Later

```bash
cd /var/www/library-management
git pull
cd backend
npm install
pm2 restart library-backend
cd ../frontend
npm install
npm run build
systemctl reload nginx
```
