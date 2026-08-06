# 🖥️ Adamjee Computers — Full-Stack E-Commerce Platform

A premium custom gaming & tech hardware e-commerce store built with **Next.js 16 App Router**, featuring a complete admin panel, real-time storefront sync, AI chatbot, invoice generation, and full MongoDB + mock-database fallback.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| Language | TypeScript 5 |
| Styling | TailwindCSS 4 |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI Chatbot | Google Gemini (via `@google/genai`) |
| Animations | Motion (Framer Motion v12) |
| Icons | Lucide React |

---

## 📁 Project Structure

```
adamjee-next/
├── src/
│   ├── app/                  # Next.js App Router pages + API
│   │   ├── api/[...route]/   # Unified catch-all API handler
│   │   ├── admin/            # Admin panel page
│   │   ├── product/          # Product detail pages
│   │   ├── checkout/         # Checkout flow
│   │   └── ...               # Other route pages
│   ├── components/           # Reusable UI components
│   │   ├── AdminChatbot.tsx  # Admin AI assistant (blue theme)
│   │   ├── AIChatbot.tsx     # Customer AI chatbot
│   │   ├── Header.tsx        # Site header
│   │   └── ...
│   ├── views/                # Full page view components
│   │   ├── AdminPage.tsx     # Shopify-style admin dashboard
│   │   ├── ProductListingPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── mongodb.ts        # DB connection handler
│   │   ├── mockDb.ts         # In-memory mock data (offline fallback)
│   │   ├── auth.ts           # JWT auth utilities
│   │   └── models/           # Mongoose models (User, Product, Order, etc.)
│   ├── context/
│   │   └── AppContext.tsx    # Global React context (cart, auth, products)
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions (storage, helpers)
│   ├── data.ts               # Static product catalogue data
│   └── types.ts              # TypeScript type definitions
├── public/                   # Static assets (images, icons)
├── .env                      # Environment variables (local only)
├── .env.example              # Environment template
└── next.config.ts            # Next.js configuration
```

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
cd adamjee-next
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/adamjee?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-google-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** The app works in **mock mode** if `MONGO_URI` is not set or fails to connect. All features function using in-memory data.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Admin Panel

Access the admin panel at: **`/admin`**

### Default Admin Credentials (Mock Mode)
| Field | Value |
|---|---|
| Email | `admin@admin.gmail.com` |
| Password | `admin@admin.gmail.com` |

### Admin Features
- 📊 **Dashboard** — Revenue, orders, users, product stats with live charts
- 📦 **Products** — Add/edit/delete products, inventory management, bulk import
- 🛒 **Orders** — View, filter, update order & payment status, print invoices
- 👥 **Customers** — User management, account status, order history
- 🧾 **Invoices** — Create invoices with tax/discount calculation, print/download PDF
- 💬 **Messages** — View customer contact form submissions
- 📝 **Blog** — Create and manage blog posts
- 🏷️ **Discounts** — Discount codes (percentage, fixed, free shipping)
- 📈 **Reports** — Revenue reports, CSV export
- ⚙️ **Settings** — Store name, address, tax rates, notification preferences
- 🤖 **AdminBot** — AI business intelligence chatbot with live store data

---

## 🌐 Frontend Pages

| Route | Page |
|---|---|
| `/` | Homepage (Hero, Best Sellers, New Arrivals, Blog) |
| `/product/[slug]` | Product Detail Page |
| `/category/[slug]` | Category Listing |
| `/cart` | Shopping Cart |
| `/checkout` | Checkout (COD, Card, Bank Transfer) |
| `/order-confirmation` | Order Confirmation |
| `/account` | Customer Account & Orders |
| `/login` / `/register` | Auth pages with Google Sign-In |
| `/search` | Product Search |
| `/blog` / `/blog/[slug]` | Blog Listing & Post |
| `/build-your-pc` | Custom PC Builder |
| `/benchmarks` | Product Benchmarks |
| `/about`, `/contact`, `/faq` | Info pages |

---

## 🔌 API Endpoints

All API routes are handled by `src/app/api/[...route]/route.ts`.

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Get current user profile

### Products
- `GET /api/products` — List products (filter by category, keyword, tag, price)
- `GET /api/products/:id` — Single product
- `POST /api/products` — Create product *(admin)*
- `PUT /api/products/:id` — Update product *(admin)*
- `DELETE /api/products/:id` — Delete product *(admin)*

### Orders
- `GET /api/orders` — All orders *(admin)*
- `GET /api/orders/my` — My orders *(authenticated)*
- `POST /api/orders` — Place order
- `PUT /api/orders/:id` — Update order status *(admin)*

### Invoices
- `GET /api/invoices` — All invoices *(admin)*
- `POST /api/invoices` — Create invoice *(admin)*
- `PUT /api/invoices/:id` — Update invoice *(admin)*
- `DELETE /api/invoices/:id` — Delete invoice *(admin)*

### Admin
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/users` — Customer list
- `GET /api/admin/chats` — Chat sessions

### Chatbot
- `POST /api/chatbot/message` — Customer chatbot (Gemini-powered)
- `POST /api/chatbot/admin-message` — Admin AI assistant

### Other
- `GET /api/blogs` — Blog posts
- `GET /api/discounts` — Discount codes
- `POST /api/contact` — Contact form submission
- `GET /api/health` — Health check

---

## 🗄️ Database Models

| Model | Purpose |
|---|---|
| `User` | Customer & admin accounts |
| `Product` | Product catalogue with inventory |
| `Order` | Customer orders |
| `Invoice` | Admin-generated invoices |
| `Blog` | Blog posts |
| `Contact` | Contact form submissions |
| `ChatSession` | Chatbot conversation history |
| `Discount` | Promo/discount codes |

---

## 🛡️ Mock Mode (Offline Fallback)

If MongoDB is unavailable, the app automatically falls back to **in-memory mock data**. All API routes have dual implementations:
- **MongoDB connected** → Real database operations
- **Not connected** → In-memory `mockDb.ts` data

This means the app is **always functional**, even without a database connection.

---

## 📦 Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

---

## 👨‍💻 Development

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

*Built with ❤️ for Adamjee Computers — Pakistan's Premier Tech & Gaming Store*
