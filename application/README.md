# TDS Photography — Quotation Generator (App)

Next.js 16 application for generating professional photography quotations for **Ar. Rehan Tank** of TDS Photography.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

Create a `.env.local` file in the `application` directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables

Go to your Supabase dashboard → SQL Editor and run the migration script:

```bash
application/supabase/migrations/001_initial_schema.sql
```

This creates the `quotations` and `line_items` tables with all necessary indexes and constraints.

### 4. Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Database Schema

The application uses Supabase (PostgreSQL) for persistent storage:

### Tables

**quotations**
- `id` (uuid, primary key)
- `created_at`, `updated_at` (timestamps)
- `client_site_name` (text)
- `shoot_type` (text)
- `quotation_date` (date)
- `discount_percentage`, `subtotal`, `discount_amount`, `total` (numeric)

**line_items**
- `id` (uuid, primary key)
- `quotation_id` (uuid, foreign key → quotations)
- `description` (text)
- `photo_count`, `reel_video_count` (integer)
- `price` (numeric)

### API Routes

- `POST /api/quotations` - Create new quotation
- `GET /api/quotations` - List all quotations (paginated)
- `GET /api/quotations/[id]` - Get single quotation
- `PUT /api/quotations/[id]` - Update quotation
- `DELETE /api/quotations/[id]` - Delete quotation

---

## How It Works

1. Fill in the form on the left — quotation title, service type, date, line items (description / photos / reels / total), optional discount
2. Live A4 preview on the right updates instantly
3. Click **Download PDF** → browser print dialog → Save as PDF (enable Background graphics)

---

## Project Structure

```
app/
├── page.tsx                        # Main SPA — mounts FormPanel + QuotationPreview
├── layout.tsx                      # Jost font, TDS metadata, logo favicon
├── globals.css                     # Tailwind base + @media print rules
├── api/
│   └── quotations/
│       ├── route.ts                # POST (create) + GET (list) quotations
│       └── [id]/
│           └── route.ts            # GET, PUT, DELETE single quotation
├── components/
│   ├── form/
│   │   ├── FormPanel.tsx           # Left panel: all form inputs + download button
│   │   └── LineItemRow.tsx         # Single repeatable shoot row
│   └── quotation/
│       └── QuotationPreview.tsx    # Right panel: A4 quotation (also the print target)
├── lib/
│   ├── quotation-utils.ts          # calcTotal, formatMoney, formatInputDate, defaults
│   └── supabase/
│       ├── client.ts               # Supabase client singleton
│       ├── database.types.ts       # TypeScript types from DB schema
│       ├── validation.ts           # Zod schemas for API validation
│       ├── transforms.ts           # DB ↔ App type conversions
│       └── errors.ts               # Centralized error handling
└── types/
    └── quotation.ts                # QuotationData, LineItem interfaces
```

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + inline styles in QuotationPreview |
| Validation | Zod |
| State | Zustand |
| Font | Jost via `next/font/google` |
| PDF | `window.print()` + `@media print` CSS |

---

## Brand Tokens

| Color | Hex | Used For |
|---|---|---|
| Cream | `#EEECE2` | Page + quotation background |
| Tan | `#C8BFA4` | Table background |
| Tan dark | `#8C7E5E` | Borders, dividers |
| Olive | `#7A6A3E` | "QUOTATION FOR" label, buttons |
| Body | `#1A1A1A` | Main text |
| Description | `#4A4238` | Line item description text |

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run format   # Prettier
```

---

## Key Rules (read CLAUDE.md for full details)

- **Never use `html2canvas` or `jsPDF`** — they produce blank PDFs in this setup
- **Never use `next/image` inside `QuotationPreview`** — use plain `<img>` so print works
- **Never add `no-print` to any ancestor of `#quotation-preview`** — it will blank the PDF
- `QuotationPreview` uses `height: 1123px` (fixed, not minHeight) to stay on one page
- All styles inside `QuotationPreview` are **inline** — Tailwind classes don't apply during print
