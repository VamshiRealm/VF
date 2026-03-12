# Vamshi Fashion – Tailoring Management System

A full-stack tailoring management system built for **Vamshi Fashion** to manage customers, measurements, orders, billing, and garment status tracking.

The system also allows customers to **scan a QR code on their bill to check order status online**.

---

# Features

## Admin Features

* Customer management
* Measurement entry and history
* Order creation
* Garment status tracking
* Billing and payment tracking
* Printable measurement sheets
* Printable bills
* QR code generation for order tracking
* Orders dashboard
* Bills history

## Customer Features

* Scan QR code from bill
* Track garment status online

---

# Tech Stack

## Frontend

* React (Vite)
* React Router
* Axios
* TailwindCSS
* QRCode React

## Backend

* Node.js
* Express.js
* Prisma ORM

## Database

* SQLite (local development)

## Deployment

* Frontend: Netlify
* Backend: Render

---

# Project Structure

```
VF
 ├── vamshi-frontend
 │   ├── src
 │   ├── public
 │   ├── package.json
 │   └── vite.config.js
 │
 ├── vamshi-backend
 │   ├── src
 │   ├── prisma
 │   │   ├── schema.prisma
 │   │   └── dev.db
 │   └── package.json
 │
 └── README.md
```

---

# Local Installation

## Prerequisites

Install:

* Node.js
* Git

Verify installation:

```
node -v
npm -v
git --version
```

---

# Clone Repository

```
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd VF
```

---

# Backend Setup

Navigate to backend:

```
cd vamshi-backend
```

Install dependencies:

```
npm install
```

Create `.env`

```
DATABASE_URL="file:./prisma/dev.db"
PORT=4000
```

Generate Prisma client:

```
npx prisma generate
```

Run database migration:

```
npx prisma migrate dev
```

Start backend server:

```
npm run dev
```

Backend runs at:

```
http://localhost:4000
```

Test API:

```
http://localhost:4000/api/health
```

---

# Frontend Setup

Open a new terminal.

Navigate to frontend:

```
cd vamshi-frontend
```

Install dependencies:

```
npm install
```

Create `.env`

```
VITE_API_BASE=http://localhost:4000/api
```

Start development server:

```
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# Admin Login

Default admin accounts:

| Username | Password   |
| -------- | ---------- |
| admin    | admin123   |
| vamshi   | fashion123 |
| alekhya  | alekhya123 |

---

# System Workflow

Admin workflow:

```
Login
 → Customers
 → Enter Measurements
 → Create Order
 → Billing
 → Print Bill
 → Customer scans QR to track order
```

Customer workflow:

```
Scan QR code
 → Open tracking page
 → View garment status
```

---

# Order Status Stages

```
RECEIVED
CUTTING
STITCHING
FINISHING
READY
```

Admins update status from the **Orders dashboard**.

---

# API Endpoints

## Customers

```
GET /api/customers
POST /api/customers
GET /api/customers/:id
DELETE /api/customers/:id
```

## Measurements

```
GET /api/customers/:id/measurements
POST /api/customers/:id/measurements
```

## Orders

```
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status
```

## Bills

```
POST /api/bills
GET /api/bills
```

---

# Deployment

## Backend Deployment (Render)

1. Create Web Service
2. Connect GitHub repo
3. Configure:

```
Root Directory: vamshi-backend
Build Command: npm install
Start Command: npm start
```

Environment variables:

```
DATABASE_URL=file:./prisma/dev.db
PORT=10000
```

---

## Frontend Deployment (Netlify)

Configuration:

```
Base Directory: vamshi-frontend
Build Command: npm run build
Publish Directory: dist
```

Environment variable:

```
VITE_API_BASE=https://YOUR_RENDER_URL/api
```

---

# QR Order Tracking

Each printed bill contains a QR code that links to:

```
/track/order/{orderId}
```

Customers can scan this to check order status.

---

# Future Improvements

* SMS order notifications
* Customer login via phone number
* PDF invoice download
* Analytics dashboard
* PostgreSQL database migration
* Role-based admin permissions

---

# Author

Developed for **Vamshi Fashion Tailoring Management System**.

---

# License

This project is licensed under the MIT License.
