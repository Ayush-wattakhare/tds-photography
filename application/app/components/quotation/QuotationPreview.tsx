import React from 'react'
import type { QuotationData } from '../../types/quotation'
import { calcTotal, formatMoney, formatInputDate, todayFormatted, DEFAULT_NOTE } from '../../lib/quotation-utils'

interface Props {
  data: QuotationData
  previewRef: React.RefObject<HTMLDivElement | null>
}

export default function QuotationPreview({ data, previewRef }: Props) {
  const rawTotal = calcTotal(data.items)
  const discountAmt = parseFloat(data.discountAmount.replace(/,/g, ''))
  const hasDiscount = !isNaN(discountAmt) && discountAmt > 0
  // Layout: [final discounted price]  [original crossed out]  — matching Rehan's original
  const finalAmount = hasDiscount ? discountAmt : rawTotal

  const font = "'Jost', 'Inter', sans-serif"

  return (
    <div
      ref={previewRef}
      id="quotation-preview"
      style={{
        width: '794px',
        height: '1123px',
        backgroundColor: '#EEECE2',
        fontFamily: font,
        color: '#1A1A1A',
        padding: '60px 68px 52px 68px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '56px',
        }}
      >
        {/* Left: Logo + Brand name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Use plain <img> — Next/Image gets optimized away and breaks print/pdf */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="TDS Photography"
            width={86}
            height={86}
            style={{ objectFit: 'contain', display: 'block', width: '86px', height: '86px' }}
          />
          <div>
            <div
              style={{
                fontWeight: '700',
                fontSize: '17px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: '#1A1A1A',
                marginBottom: '4px',
                fontFamily: font,
              }}
            >
              TDS PHOTOGRAHY
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#4A4A3A',
                fontWeight: '400',
                fontFamily: font,
              }}
            >
              Architectural Photographer &amp; Videographer
            </div>
          </div>
        </div>

        {/* Right: Quotation details with left border */}
        <div
          style={{
            borderLeft: '3px solid #8C7E5E',
            paddingLeft: '22px',
            minWidth: '220px',
            maxWidth: '260px',
          }}
        >
          <div
            style={{
              fontWeight: '800',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#7A6A3E',
              marginBottom: '5px',
              fontFamily: font,
            }}
          >
            QUOTATION FOR
          </div>
          <div
            style={{
              fontWeight: '600',
              fontSize: '14px',
              color: '#7A6A3E',
              marginBottom: '14px',
              lineHeight: '1.35',
              fontFamily: font,
            }}
          >
            {data.quotationFor || 'Client Site Name'}
          </div>
          <div
            style={{
              fontSize: '13.5px',
              color: '#1A1A1A',
              marginBottom: '7px',
              lineHeight: '1.5',
              fontFamily: font,
            }}
          >
            {data.serviceType || 'Service Type'}
          </div>
          <div style={{ fontSize: '13.5px', color: '#1A1A1A', fontFamily: font }}>
            {data.date ? formatInputDate(data.date) : todayFormatted()}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          backgroundColor: '#C8BFA4',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '44px',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 1fr 1.1fr 1.3fr',
            padding: '16px 24px',
            borderBottom: '1.5px solid #8C7E5E',
          }}
        >
          {[
            { label: 'Description', align: 'left' as const },
            { label: 'Photos', align: 'center' as const },
            { label: 'Reels/Video', align: 'center' as const },
            { label: 'Total', align: 'center' as const },
          ].map(({ label, align }) => (
            <div
              key={label}
              style={{
                fontWeight: '700',
                fontSize: '14px',
                color: '#1A1A1A',
                textAlign: align,
                fontFamily: font,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Body rows */}
        <div style={{ padding: '20px 24px 0 24px' }}>
          {data.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2.2fr 1fr 1.1fr 1.3fr',
                marginBottom: '10px',
              }}
            >
              <div style={{ fontSize: '14px', color: '#4A4238', fontFamily: font }}>
                {item.description}
              </div>
              <div style={{ fontSize: '14px', color: '#1A1A1A', textAlign: 'center', fontFamily: font }}>
                {item.photos}
              </div>
              <div style={{ fontSize: '14px', color: '#1A1A1A', textAlign: 'center', fontFamily: font }}>
                {item.reels}
              </div>
              <div style={{ fontSize: '14px', color: '#1A1A1A', textAlign: 'center', fontFamily: font }}>
                {item.total
                  ? `${formatMoney(parseFloat(item.total.replace(/,/g, '')) || 0)}/-`
                  : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Divider + Totals — use same grid so amounts align under "Total" column */}
        <div style={{ padding: '8px 24px 24px 24px' }}>
          {/* Divider: grid row, divider only under the last column */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.2fr 1fr 1.1fr 1.3fr',
              marginBottom: '8px',
            }}
          >
            <div /><div /><div />
            <div style={{ borderTop: '1.5px solid #6B5F3E' }} />
          </div>

          {/* Amounts: same grid — sits perfectly centred under "Total" header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.2fr 1fr 1.1fr 1.3fr',
            }}
          >
            <div /><div /><div />
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '14px',
                fontFamily: font,
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A1A' }}>
                {formatMoney(finalAmount)}/-
              </span>
              {hasDiscount && (
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: '400',
                    color: '#1A1A1A',
                    textDecoration: 'line-through',
                    textDecorationColor: '#1A1A1A',
                    textDecorationThickness: '1.5px',
                  }}
                >
                  {formatMoney(rawTotal)}/-
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Note — boxed ── */}
      <div
        style={{
          border: '1px solid #C8BFAA',
          borderRadius: '3px',
          padding: '13px 17px',
          marginBottom: '30px',
        }}
      >
        <p
          style={{
            fontSize: '11.5px',
            color: '#1A1A1A',
            lineHeight: '1.8',
            margin: 0,
            fontFamily: font,
          }}
        >
          <strong>Note:</strong> {data.noteText || DEFAULT_NOTE}
        </p>
      </div>

      {/* ── Footer ── */}
      <div>
        <div style={{ borderTop: '1px solid #8C7E5E', marginBottom: '14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '5px', fontFamily: font }}
            >
              TDS_Photography
            </div>
            <div
              style={{
                fontSize: '11.5px',
                color: '#1A1A1A',
                marginBottom: '3px',
                textDecoration: 'underline',
                fontFamily: font,
              }}
            >
              https://tdsphotography69.mypixieset.com/
            </div>
            <div style={{ fontSize: '11.5px', color: '#1A1A1A', fontFamily: font }}>
              Instagram :{' '}
              <span style={{ textDecoration: 'underline' }}>tds.photography23</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '5px', fontFamily: font }}
            >
              Ar. Rehan Tank
            </div>
            <div style={{ fontSize: '11.5px', color: '#1A1A1A', marginBottom: '3px', fontFamily: font }}>
              Phn : +91 7755930601
            </div>
            <div
              style={{
                fontSize: '11.5px',
                color: '#1A1A1A',
                textDecoration: 'underline',
                fontFamily: font,
              }}
            >
              tds.photography23@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
