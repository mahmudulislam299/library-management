# Library Management System

A full-stack Library Management System web application designed to manage books, users, borrowing records, returns, and library operations efficiently. The project includes a modern frontend, a backend REST API, and MongoDB database integration.

## Overview

The Library Management System is built to simplify and organize the daily activities of a library. It allows users or administrators to manage books, track issued and returned books, maintain user/member records, and monitor library activity from a web-based interface.

This project demonstrates full-stack web development using React.js, Node.js, Express.js, and MongoDB.

## Features

### Book Management

* Add new books
* View all books
* Update book information
* Delete books
* Search and filter books
* Track book availability

### User / Member Management

* Register users or members
* View user information
* Manage user details
* Track books borrowed by each user

### Borrow and Return Management

* Issue books to users
* Return borrowed books
* Track borrowing history
* Update book availability automatically
* Manage due dates and return status

### Authentication

* User registration
* User login
* Protected routes
* Secure API access
* JWT-based authentication

### Dashboard

* View total books
* View available books
* View borrowed books
* View registered users
* Monitor recent library activities

## Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* dotenv
* CORS

### Database

* MongoDB
* MongoDB Atlas or local MongoDB

## Project Structure

```bash
library-management-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## Installation and Setup

Follow the steps below to run the project locally.

## 1. Clone the Repository

```bash
git clone https://github.com/mahmudulislam299/library-management-system.git
cd library-management-system
```

> If your repository name is different, replace `library-management-system` with your actual repository name.

## 2. Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder and add the following environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm run dev
```

The backend server will run on:

```bash
http://localhost:5000
```

## 3. Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` folder and add:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm start
```

The frontend will run on:

```bash
http://localhost:3000
```

## API Routes

Example API routes used in the project:

```bash
POST   /api/auth/register
POST   /api/auth/login

GET    /api/books
POST   /api/books
GET    /api/books/:id
PUT    /api/books/:id
DELETE /api/books/:id

GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id

POST   /api/borrow
GET    /api/borrow
GET    /api/borrow/:id
PUT    /api/borrow/return/:id
DELETE /api/borrow/:id
```

> API routes may vary depending on the final implementation.

## Environment Variables

### Backend `.env`

| Variable     | Description                            |
| ------------ | -------------------------------------- |
| `PORT`       | Backend server port                    |
| `MONGO_URI`  | MongoDB database connection string     |
| `JWT_SECRET` | Secret key used for JWT authentication |

### Frontend `.env`

| Variable            | Description          |
| ------------------- | -------------------- |
| `REACT_APP_API_URL` | Backend API base URL |

## Deployment

This project can be deployed using:

* Vercel for frontend
* Render for backend
* MongoDB Atlas for database

For deployment, update the frontend environment variable with the deployed backend URL:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

Also add the backend environment variables in the hosting platform dashboard.

## Screenshots

Add project screenshots here after deployment or UI completion.

```md
![Dashboard](./screenshots/dashboard.png)
![Books Page](./screenshots/books.png)
![Borrow Page](./screenshots/borrow.png)
```

## Future Improvements

* Email notification for due dates
* Fine calculation system
* Advanced book search and filtering
* Book category management
* Separate admin and user dashboards
* Report generation
* QR code or barcode-based book tracking
* Online book reservation system
* Export reports as PDF or Excel

## Author

**Mahmudul Islam (Robince)**
Embedded Software Engineer | IoT | Firmware | Embedded System | Hardware Design | PCB Design

* GitHub: https://github.com/mahmudulislam299
* LinkedIn: https://www.linkedin.com/in/mahmudulrobince/
* Location: Dhaka, Bangladesh

## License

This project is licensed under the MIT License.

## Conclusion

The Library Management System is a complete full-stack web application that provides an organized and efficient way to manage library operations. It demonstrates practical knowledge of frontend development, backend API design, authentication, database management, and full-stack project deployment.
