# TDS Photography — Quotation Generator

## Project Overview
A Next.js 16 single-page app for **Rehan Tank** (TDS Photography) to generate professional photography quotations as PDF. Rehan fills a form → sees a live A4 preview → downloads as PDF via browser print dialog.

---

## Architecture

```
app/
├── page.tsx                        # Main SPA — orchestrates form + preview
├── layout.tsx                      # Jost font, metadata, favicon
├── globals.css                     # Tailwind base + @media print rules
├── components/
│   ├── form/
│   │   ├── FormPanel.tsx           # Left panel: all input fields
│   │   └── LineItemRow.tsx         # Individual repeatable line item
│   └── quotation/
│       └── QuotationPreview.tsx    # Right panel: live A4 preview (also what prints)
├── lib/
│   └── quotation-utils.ts          # Pure helpers: calcTotal, formatMoney, dates, defaults
└── types/
    └── quotation.ts                # QuotationData and LineItem interfaces
```

---

## Brand Design Tokens

| Token | Value | Usage |
|---|---|---|
| `cream` | `#EEECE2` | Page background, quotation background |
| `tan` | `#B5A98A` | Table background |
| `tan-dark` | `#8C7E5E` | Dividers, borders |
| `olive` | `#7A6A3E` | Accent headings ("QUOTATION FOR"), buttons |
| Body text | `#1A1A1A` | All body copy |
| Subtle border | `#C8BFAA` | Note box border, form inputs |

**Font:** Jost (Google Fonts) — closest free match to "Now" used in Rehan's Canva template.

---

## PDF Generation — Critical Rules

**Method: `window.print()` with `@media print` CSS.**

Do NOT use html2canvas, jsPDF, or any canvas-based approach. They all fail in this setup:
- html2canvas breaks because the preview is inside `overflow-x-auto` (viewport coordinate mismatch)
- html2canvas also breaks with Next.js image optimisation
- Canvas approaches produce blank/corrupted PDFs

**The correct flow:**
1. User clicks "Download PDF"
2. `window.print()` is called
3. `@media print` CSS hides `.no-print` elements (topbar, form panel, preview label/button)
4. `QuotationPreview` (`#quotation-preview`) remains visible with its inline styles
5. Browser print dialog opens → user selects "Save as PDF" + enables "Background graphics"

**CSS rules that make this work (in `globals.css`):**
```css
@media print {
  .no-print { display: none !important; }
  @page { size: A4 portrait; margin: 0; }
  html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  #quotation-preview {
    width: 210mm !important;
    height: 297mm !important;        /* fixed height — NOT minHeight */
    overflow: hidden !important;      /* prevent page 2 overflow */
    page-break-inside: avoid !important;
  }
}
```

**JSX rules that make this work:**
- The main layout wrapper is NOT `no-print` — only its children (form, topbar, buttons) are
- `QuotationPreview` has NO `no-print` ancestors in the DOM tree
- `QuotationPreview` uses `height: 1123px` (fixed, not minHeight) to prevent overflow onto page 2

---

## QuotationPreview Component

**All styles are inline** — no Tailwind classes. This is intentional: inline styles work correctly in both the browser preview and `@media print` capture.

**Use plain `<img>` tag for the logo** — NOT `next/image`. Next.js Image optimisation transforms `src` attributes in ways that break print rendering.

**Quotation layout (matching Rehan's Canva template):**
```
[Logo]  TDS PHOTOGRAHY           │ QUOTATION FOR
        Architectural...          │ [Site Name]
                                  │ [Service Type]
                                  │ [Date]

  ┌─ Table (tan background) ──────────────────────┐
  │ Description | Photos | Reels/Video | Total     │
  │ [rows...]                                      │
  │                              ──────────────    │
  │                  [final]/-   [original strikethru]/- │
  └────────────────────────────────────────────────┘

  ┌─ Note box (bordered) ─────────────────────────┐
  │ Note: This quotation does not include...       │
  └────────────────────────────────────────────────┘

  ────────────────────────────────────────────────
  TDS_Photography          Rehan Tank
  [website] [instagram]    Phn / email
```

**Discount display order** (matching original):
- Left: final discounted amount (normal text)
- Right: original sum (strikethrough)
- e.g. `28,000/-   ~~35,000/-~~`

---

## Key Contacts (pre-filled in footer — do not change)

| Field | Value |
|---|---|
| Brand | TDS_Photography |
| Website | https://tdsphotography69.mypixieset.com/ |
| Instagram | tds.photography23 |
| Owner | Rehan Tank |
| Phone | +91 7755930601 |
| Email | tds.photography23@gmail.com |

---

## Common Gotchas

1. **Page 2 overflow** — If note/footer spills to a second page in print, the `height` on `#quotation-preview` is too large or the spacer (`flex: 1`) is pushing things down. Fix: reduce top/bottom padding in `QuotationPreview`, or reduce `marginBottom` on the table.

2. **Blank print** — If print dialog shows blank page, check that `no-print` is NOT on any ancestor of `QuotationPreview`. The DOM path from `<body>` to `#quotation-preview` must have zero `no-print` elements.

3. **Background colours missing in PDF** — User must enable "Background graphics" in the browser print dialog. The CSS `print-color-adjust: exact` is set but some browsers still require the user checkbox.

4. **Logo not showing in print** — Ensure `<img src="/logo.png">` is used (plain img tag), NOT `<Image>` from `next/image`.

---

## Development

```bash
cd application
npm run dev       # starts on localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

No environment variables needed — fully client-side, no backend.
