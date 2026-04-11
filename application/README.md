# TDS Photography — Quotation Generator (App)

Next.js 16 application for generating professional photography quotations for **Ar. Rehan Tank** of TDS Photography.

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

No `.env` setup needed — fully client-side, no backend.

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
├── components/
│   ├── form/
│   │   ├── FormPanel.tsx           # Left panel: all form inputs + download button
│   │   └── LineItemRow.tsx         # Single repeatable shoot row
│   └── quotation/
│       └── QuotationPreview.tsx    # Right panel: A4 quotation (also the print target)
├── lib/
│   └── quotation-utils.ts          # calcTotal, formatMoney, formatInputDate, defaults
└── types/
    └── quotation.ts                # QuotationData, LineItem interfaces
```

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + inline styles in QuotationPreview |
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
