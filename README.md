# 👔 Vamshi Fashion – Tailoring Management System

A **full-stack tailoring management system** built to digitize tailoring shop operations including customer management, measurements, orders, billing, and garment status tracking.

Customers can **scan a QR code on their bill to check the status of their garments online**.

---

# 🌐 Live Application

Frontend (Netlify)

https://vamshi-fashion.netlify.app

Backend API (Render)

https://vamshi-fashion.onrender.com

---

# 🎥 Demo Video

A full walkthrough of the application is available here:

Google Drive Demo Video:

[ video link to be developed ]



---

# 📦 GitHub Repository

https://github.com/VamshiRealm/VF

---

# ✨ Features

## Admin Features

* Customer management
* Measurement entry and history
* Order creation
* Garment status tracking
* Billing and payment tracking
* Printable measurement sheets
* Printable invoices
* QR code generation for order tracking
* Orders dashboard
* Bills history
* Customer search

---

## Customer Features

Customers can:

* Scan QR code from bill
* View order progress online
* Track garment production stages

---

# 🪡 Order Status Flow

Garments move through the following stages:

```
RECEIVED
CUTTING
STITCHING
FINISHING
READY
```

Admins update garment status from the **Orders Dashboard**.

---

# 🛠 Tech Stack

## Frontend

* React (Vite)
* React Router
* Axios
* TailwindCSS
* QRCode React

---

## Backend

* Node.js
* Express.js
* Prisma ORM

---

## Database

* SQLite (local development)

---

## Deployment

| Service  | Platform |
| -------- | -------- |
| Frontend | Netlify  |
| Backend  | Render   |
| Database | SQLite   |

---

# 🏗 System Architecture

```
Frontend (React / Vite)
        │
        │ API Calls
        ▼
Backend (Node.js / Express)
        │
        ▼
Database (SQLite via Prisma)
```

---

# 📂 Project Structure

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

# ⚙️ Local Development Setup

## Prerequisites

Install:

* Node.js
* Git

Check installation:

```
node -v
npm -v
git --version
```

---

# 📥 Clone Repository

```
git clone https://github.com/VamshiRealm/VF.git
cd VF
```

---

# 🔧 Backend Setup

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

Start backend:

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

# 💻 Frontend Setup

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

Run development server:

```
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔐 Admin Login

Default accounts:

| Username | Password   |
| -------- | ---------- |
| admin    | admin123   |
| vamshi   | fashion123 |
| alekhya  | alekhya123 |

---

# 🧾 Application Workflow

Admin workflow:

```
Login
 → Add Customer
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

# 📡 API Endpoints

## Customers

```
GET /api/customers
POST /api/customers
GET /api/customers/:id
DELETE /api/customers/:id
```

---

## Measurements

```
GET /api/customers/:id/measurements
POST /api/customers/:id/measurements
```

---

## Orders

```
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status
```

---

## Bills

```
POST /api/bills
GET /api/bills
```

---

# 🚀 Deployment

## Backend Deployment (Render)

Configuration:

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
VITE_API_BASE=https://vamshi-fashion.onrender.com/api
```

---

# 📱 QR Order Tracking

Each printed bill contains a QR code linking to:

```
/track/order/{orderId}
```

Example:

```
https://vamshi-fashion.netlify.app/track/order/10
```

Customers can scan this QR code to check order status.

---

# 🔮 Future Improvements

* SMS notifications when order is ready
* Customer login using mobile number
* PDF invoice download
* Analytics dashboard
* PostgreSQL database migration
* Role-based admin permissions

---

# 👨‍💻 Author

Developed for **Vamshi Fashion Tailoring Management System**

---

# 📄 License

This project is licensed under the MIT License.
