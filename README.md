# Kharido Mart – Next.js E-Commerce Web Application

A modern, fast, and feature-rich e-commerce web application inspired by and replicated from [kharidomart.com](https://kharidomart.com), built using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and the **Reicon** icon system.

---

## 🌟 Highlights & Features

- **Replicated Design & Real Assets**: Includes all authentic high-resolution product photography, logos, category banners, brand storytelling, and product specifications from Kharido Mart.
- **Icon Library**: Built strictly following the **Reicon** icon system (`reicon-react`) with outline/filled state weights.
- **Interactive Slide-out Cart Drawer**:
  - Live item counter and cart subtotal.
  - Stepper controls (`+` / `-` quantity) and instant removal.
  - Dynamic **Free Shipping Progress Meter** (e.g. *"Add ₹X more to unlock Free Express Delivery!"*).
  - Promo code system with discount calculation (`KHARIDO10` for 10% off).
  - Full simulated **Checkout Modal** supporting **Cash on Delivery (COD)** and **UPI**.
- **Interactive Quick View Modal**: Preview full product details, multi-image gallery thumbnails, key highlights, and add to cart without leaving the page.
- **Predictive Search Modal**: Instant auto-suggestions for products, collections, and smart gadgets with keyboard shortcut support (`Escape` to close).
- **Dedicated Product Pages (`/products/[slug]`)**:
  - Multi-angle gallery with thumbnail switcher.
  - Live stock urgency indicator (*"Only 7 left in stock - order soon!"*).
  - 1-click **"Buy It Now"** and **"Add to Cart"** flows.
  - Interactive specification tables, usage instructions, and Pan-India shipping guarantees.
  - Related product recommendations.
- **Category / Collection Filters (`/collections/[category]` & `/shop`)**: Filter and sort by category (*Mom & Baby*, *Home & Kitchen*, *Fun & Clever Finds*, *Smart Gadgets*), price, and ratings.
- **Interactive Wishlist**: Save favorite items with persistent local storage.
- **Interactive Customer Support & Contact (`/contact`)**: Pre-filled inquiry form, live response confirmation, customer care channels, and FAQs.
- **Store Policies (`/policies/[policy]`)**: Privacy Policy, Refund & Replacement Policy, Terms of Service, Shipping Policy, Contact Information, and Legal Notice.

---

## 🚀 Getting Started & Client Setup

> 📘 **Full Client Setup & Architecture Guide**: See [HANDOVER.md](file:///c:/kharidomart/HANDOVER.md) for complete instructions on adding products, managing orders, and connecting to production PostgreSQL.

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database (Prisma ORM)
```bash
npx prisma db push
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront or [http://localhost:3000/admin](http://localhost:3000/admin) for the Store Admin Panel.

---

## 🗄️ Database & Admin Architecture
- **Database Engine**: Prisma ORM with SQLite (`dev.db`) out-of-the-box, 1-line switchable to PostgreSQL / Supabase via `.env`.
- **Zero Fake Data**: The database is initialized clean and ready for real client products and customer orders.
- **Admin Dashboard**: `/admin`
- **Product Management**: `/admin/products` and `/admin/products/new`
- **Order Fulfillment**: `/admin/orders`
- **Customer Tracking**: `/track-order`

---

## 📁 Directory Structure

```text
src/
├── app/
│   ├── layout.tsx              # Root layout with StoreProvider, Header, Footer & Modals
│   ├── page.tsx                # Homepage (Hero, Collections, Best Sellers, Know Us, Reviews)
│   ├── globals.css             # Tailwind CSS tokens, typography, and custom scrollbars
│   ├── shop/page.tsx           # Full product catalog with filters and search
│   ├── products/[slug]/page.tsx# Product details with interactive gallery and buy box
│   ├── collections/[category]/page.tsx # Category collection view
│   ├── about/page.tsx          # "Know Us!" brand storytelling and company pillars
│   ├── contact/page.tsx        # Customer care hub, interactive form, and FAQs
│   └── policies/[policy]/page.tsx # Dynamic store policies (privacy, refund, shipping)
├── components/
│   ├── AnnouncementBar.tsx     # Rotating announcement ticker with discount codes
│   ├── Header.tsx              # Sticky navigation, logo, search, wishlist & cart badges
│   ├── Footer.tsx              # Trust guarantees, newsletter box, links & payment badges
│   ├── ProductCard.tsx         # Product card with hover quick-view and add-to-cart
│   ├── CategoryCard.tsx        # Curated collection card with zoom effect
│   ├── CartDrawer.tsx          # Slide-out drawer with free shipping meter & checkout
│   ├── SearchModal.tsx         # Predictive search modal with instant results
│   ├── QuickViewModal.tsx      # Modal preview for fast product browsing
│   └── Toast.tsx               # Toast notification system
├── context/
│   └── StoreContext.tsx        # Cart, wishlist, coupon, and modal state management
└── data/
    ├── products.ts             # Kharido Mart products database & specs
    ├── categories.ts           # Categories & collections data
    └── policies.ts             # Legal, refund, privacy, and shipping policies
public/
└── assets/
    └── images/                 # 80+ original high-res Kharido Mart product photos & logos
```

---

## 🎨 Design Philosophy
- **Colors**: Warm saffron gold (`#F59E0B`), rich amber, clean stone tones, and crisp typography (`Plus Jakarta Sans`).
- **Icons**: [Reicon](https://reicon.dev) (`reicon-react`) icons configured with uniform sizing and filled/outline hierarchy.
- **Fast & Responsive**: Fully optimized for mobile, tablet, and desktop screens.
