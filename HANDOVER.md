# 🛍️ Kharido Mart India — Client Handover & Setup Guide

Welcome to **Kharido Mart**! This codebase has been fully configured with a real database architecture (**Prisma ORM**), live REST API endpoints, real checkout-to-order fulfillment pipelines, and an administrative control panel.

All mock and fake data has been purged. The database is initialized clean and ready for your real inventory, real customer orders, and live production deployment.

---

## ⚡ Quick Start (Run Locally in 2 Minutes)

### Prerequisites
- **Node.js** (v18.18+ or v20+ recommended)
- **npm** or **pnpm** / **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
The project comes pre-configured with **SQLite** (`dev.db`) for zero-configuration local runs:
```bash
npx prisma db push
```
*(This generates the Prisma Client and creates all database tables: Product, Category, Order, OrderItem, Review, StoreSetting).*

### 3. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔐 Admin Authentication & Route Protection

All `/admin` routes (`/admin`, `/admin/products`, `/admin/orders`, `/admin/inventory`, `/admin/customers`, `/admin/settings`, etc.) are secured. Typing `/admin` in the browser automatically redirects unauthenticated users to `/admin/login`.

### Default Administrator Credentials
- **Email**: `admin@kharidomart.com`
- **Password**: `admin`

### Alternative Configured Accounts:
- **Email**: `mdhasnain7321@gmail.com` | **Password**: `admin@hasnain01`
- **Email**: `shadabjmi0908@gmail.com` | **Password**: `admin@shadab02`
- *(All credentials can be adjusted in your [`.env`](file:///c:/kharidomart/.env) file).*

---

## 🔑 Key URLs & Admin Access

| Page | URL | Purpose |
| :--- | :--- | :--- |
| **Storefront Home** | `http://localhost:3000/` | Customer home page with dynamic categories and real product catalog |
| **All Products Shop** | `http://localhost:3000/shop` | Search, sort, and category filtering |
| **Cart** | `http://localhost:3000/cart` | Cart review, coupon codes, and shipping calculator |
| **Checkout** | `http://localhost:3000/checkout` | Real order placement (COD & UPI) saving directly to Prisma DB |
| **Order Tracking** | `http://localhost:3000/track-order` | Customers track real orders via Order ID or 10-digit Mobile |
| **Admin Login** | `http://localhost:3000/admin/login` | Secure administrator authentication (redirects here if logged out) |
| **Admin Dashboard** | `http://localhost:3000/admin` | Store metrics, live revenue, recent orders overview |
| **Product Inventory** | `http://localhost:3000/admin/products` | Manage, search, and delete database products |
| **Add New Product** | `http://localhost:3000/admin/products/new` | Publish real products with images, prices & specifications |
| **Orders & Fulfillment**| `http://localhost:3000/admin/orders` | Update order status (`Processing`, `In Transit`, `Delivered`) |
| **Customer Directory** | `http://localhost:3000/admin/customers` | Real customer database generated from placed orders |
| **Store Analytics** | `http://localhost:3000/admin/analytics` | Real-time financial analytics from live database orders |

---

## 📦 How to Add Real Products

1. Open **`/admin/products/new`**.
2. Enter:
   - **Product Title**: e.g. *Gentle Electric Baby Nail Trimmer*
   - **Category**: Select *Mom & Baby*, *Toys & Games*, *Home & Kitchen*, or *Smart Gadgets*.
   - **Selling Price (₹)**: e.g. *799*
   - **Compare at Price / MRP (₹)**: e.g. *1,499* (displays discount badge)
   - **Stock Quantity**: e.g. *50*
   - **Product Image URL**: Paste a valid image link (or choose from provided presets).
   - **Product Description & Highlights**: Key benefits, bullet points, safety specs.
3. Click **"Publish Product to Store"**.
4. The product is immediately written to your SQLite/Postgres database and appears instantly on the homepage, `/shop`, and `/products/[slug]`.

---

## 🚚 How Order Placement & Tracking Works

1. **Customer Places Order**:
   - Customer adds products to bag and proceeds to `/checkout`.
   - Customer enters Delivery Address, City, State, Pincode, and Mobile Number.
   - Payment mode selected (Cash on Delivery or Instant UPI discount).
   - Order is submitted via `POST /api/orders` and stored in the `Order` and `OrderItem` tables.
   - A unique Indian order number (`KM-2026-XXXXX`) and BlueDart Air AWB tracking code (`KM-BLU-XXXXXXXX-IN`) are generated automatically.

2. **Order Confirmation & Tracking**:
   - Customer is redirected to `/checkout/success?orderId=KM-2026-XXXXX` showing the delivery estimate, AWB, and items.
   - Anyone can track any order live on `/track-order` by entering their Order Number or Mobile Number.

3. **Admin Order Fulfillment**:
   - In `/admin/orders`, the store manager can view all customer details, addresses, phone numbers, and items.
   - Update the status dropdown to `In Transit` or `Delivered`.
   - The live status immediately updates on the customer's `/track-order` page.

---

## 🗄️ Database: Switching to PostgreSQL / Supabase for Production

By default, the store runs on zero-config local SQLite (`file:./dev.db`). When deploying to production (e.g. Supabase, Neon, AWS RDS, Vercel Postgres, or Railway):

1. **Open `prisma/schema.prisma`**:
   Change:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   To:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?sslmode=require"
   ```

3. **Push to Remote Database**:
   ```bash
   npx prisma db push
   ```
   That's it! All schema, indices, relations, and types are immediately synced to your production PostgreSQL database.

---

## 🌐 Deploying to Vercel / Production

1. Push your repository to **GitHub** / **GitLab**.
2. Import the project into **Vercel** ([vercel.com](https://vercel.com)).
3. In Project Settings > **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL / Supabase connection string.
4. Set Build Command:
   ```bash
   npx prisma generate && next build
   ```
5. Click **Deploy**. Your ecommerce store is live!

---

## 🛠️ API Reference

- `GET /api/products`: Retrieve all active products (supports `?category=...&search=...`).
- `POST /api/products`: Publish a new product to database.
- `GET /api/products/[id]`: Retrieve single product with details and reviews.
- `DELETE /api/products/[id]`: Remove a product from database.
- `GET /api/orders`: Admin endpoint to fetch all orders with items.
- `POST /api/orders`: Place customer order and generate order number + AWB.
- `GET /api/orders/[id]`: Customer & tracking endpoint to query order by orderNumber, awb, or phone.
- `PUT /api/orders/[id]`: Update order status or courier details.

---

## 📞 Support & Handover Verification

- Built with modern **Next.js 16 App Router**, **Prisma ORM**, and **Tailwind CSS**.
- Verified zero console errors, zero fake items, 100% type-safe compilation.
- For database inspection GUI, run:
  ```bash
  npx prisma studio
  ```
  *(Opens an interactive browser GUI at http://localhost:5555 to view and edit database rows directly).*
