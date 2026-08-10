# Santechs — B2B Industrial Marketplace

> Production-ready Next.js 15 B2B marketplace for textile machinery, recycling plants, raw materials, and spare parts — with Super Admin-brokered deal flow.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Shadcn UI (Base UI) |
| Database | MongoDB (Mongoose) |
| Auth | NextAuth v5 (JWT) |
| Forms | React Hook Form + Zod |
| State | TanStack Query |
| Animations | Framer Motion |
| Email | Nodemailer + SMTP |
| File Uploads | UploadThing |
| Icons | Lucide React |
| Charts | Recharts |

## 👥 User Roles

| Role | Access |
|------|--------|
| **Buyer** | Browse, search, filter, wishlist, submit enquiries |
| **Seller** | Create listings (pending admin approval), view own analytics |
| **Admin** | Review & approve listings, manage users |
| **Super Admin** | Full control: approve sellers, manage enquiries, share contacts, close deals |

## 🔄 Marketplace Flow

```
Seller → Creates Listing → Status: PENDING
Super Admin → Reviews → APPROVED / REJECTED
Buyer → Views listing → Clicks "Request Quote"
Buyer → Fills enquiry form
⚠️  ONLY Super Admin receives buyer contact details
Super Admin → Contacts buyer → Contacts seller
Super Admin → Negotiates → Shares contacts when ready
Deal Closed ✅
```

## 📁 Project Structure

```
santechs-app/
├── app/
│   ├── (auth)/           # Login, Register, Forgot Password
│   ├── (public)/         # Homepage, Products, Sellers (public)
│   ├── (buyer)/          # Buyer dashboard (protected)
│   ├── (seller)/         # Seller dashboard (protected)
│   ├── (admin)/          # Super Admin dashboard (protected)
│   └── api/              # API routes
├── components/
│   ├── ui/               # Shadcn UI primitives
│   ├── common/           # ProductCard, EnquiryForm, etc.
│   ├── layout/           # Navbar, Footer
│   ├── home/             # Hero, Categories, Stats, etc.
│   ├── admin/            # AdminSidebar
│   └── providers/        # NextAuth + TanStack Query
├── lib/
│   ├── auth/             # NextAuth config
│   ├── db/               # MongoDB connection + models
│   ├── actions/          # Server Actions
│   ├── validations/      # Zod schemas
│   └── email/            # Nodemailer templates
├── types/                # TypeScript interfaces & enums
├── middleware.ts          # Route protection
├── scripts/seed.ts       # Database seeder
├── docker-compose.yml
└── Dockerfile
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- SMTP credentials (Gmail App Password recommended)

### 2. Clone & Install

```bash
# Navigate to project
cd santechs-app

# Install dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy env template
cp .env.example .env.local

# Fill in your values:
# MONGODB_URI, AUTH_SECRET, SMTP_*, UPLOADTHING_*
```

### 4. Seed Database

```bash
# Creates Super Admin + Categories + Brands
npm run seed
```

Default Super Admin credentials:
- Email: `admin@santechs.com`  
- Password: `Admin@123456`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

```bash
# Start with Docker Compose (includes MongoDB)
docker-compose up -d
```

## 📦 Database Models

| Model | Purpose |
|-------|---------|
| `User` | All users with roles |
| `Company` | Seller company profiles |
| `Product` | Listings (machines, materials, etc.) |
| `Category` | Hierarchical product categories |
| `Brand` | Machinery/material brands |
| `Enquiry` | Buyer enquiries (admin-only contact) |
| `Notification` | System notifications |
| `Wishlist` | Saved products |
| `Message` | Admin ↔ Buyer/Seller threads |
| `MessageThread` | Chat thread metadata |
| `ActivityLog` | Full audit trail |

## 🔑 Environment Variables

```env
# Required
MONGODB_URI=            # MongoDB Atlas connection string
AUTH_SECRET=            # Random 32+ char string
AUTH_URL=               # App URL (e.g. http://localhost:3000)

# Email
SMTP_HOST=              # SMTP server
SMTP_PORT=              # 587 or 465
SMTP_USER=              # SMTP username
SMTP_PASSWORD=          # SMTP password/app-password
EMAIL_FROM=             # From address

# UploadThing
UPLOADTHING_SECRET=     # From uploadthing.com
UPLOADTHING_APP_ID=     # From uploadthing.com

# Seeder
SUPER_ADMIN_EMAIL=      # Admin login email
SUPER_ADMIN_PASSWORD=   # Admin login password
NEXT_PUBLIC_APP_URL=    # Public URL
```

## 🗺️ API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/:slug` | Product detail |
| GET | `/api/categories` | Categories list |
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications` | Mark as read |
| GET | `/api/admin/stats` | Admin dashboard KPIs |

## 🛡️ Product Status Flow

```
DRAFT → PENDING → APPROVED → (ARCHIVED / SOLD)
                ↘ REJECTED
```

## 📊 Enquiry Status Flow

```
NEW → CONTACTED_BUYER → SELLER_ASSIGNED → NEGOTIATION
    → QUOTATION_SENT → INSPECTION_SCHEDULED → DEAL_CLOSED
    → REJECTED / CANCELLED
```

## 🚢 Deployment

Recommended platforms:
- **App**: Vercel (zero-config Next.js)  
- **Database**: MongoDB Atlas  
- **Files**: UploadThing (included)  
- **Email**: Gmail SMTP with App Password

```bash
# Production build
npm run build
npm start
```

## 📝 Scripts

```bash
npm run dev         # Development server with Turbopack
npm run build       # Production build
npm run seed        # Seed database
npm run type-check  # TypeScript check
npm run lint        # ESLint
```

