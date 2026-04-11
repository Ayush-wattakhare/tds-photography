'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  id: string
  description: string
  photos: string
  reels: string
  total: string
}

interface QuotationData {
  quotationFor: string
  serviceType: string
  date: string
  items: LineItem[]
  discountAmount: string
  noteText: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayFormatted(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function todayInputValue(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function formatInputDate(isoDate: string): string {
  if (!isoDate) return todayFormatted()
  const [y, m, day] = isoDate.split('-')
  return `${day}/${m}/${y}`
}

function calcTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => {
    const val = parseFloat(item.total.replace(/,/g, ''))
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('en-IN')
}

function newItem(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    description: '',
    photos: '',
    reels: '',
    total: '',
  }
}

const DEFAULT_NOTE =
  'This quotation does not include travel and accomodation expenses, transportation and accommodation charges will have to be borne by the client. This quotation is valid for 15 days only.'

// ─── Quotation Preview ───────────────────────────────────────────────────────

function QuotationPreview({
  data,
  previewRef,
}: {
  data: QuotationData
  previewRef: React.RefObject<HTMLDivElement | null>
}) {
  const rawTotal = calcTotal(data.items)
  const discountAmt = parseFloat(data.discountAmount.replace(/,/g, ''))
  const hasDiscount = !isNaN(discountAmt) && discountAmt > 0
  const finalAmount = hasDiscount ? discountAmt : rawTotal

  return (
    <div
      ref={previewRef}
      id="quotation-preview"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#EEECE2',
        fontFamily: "'Jost', 'Inter', sans-serif",
        color: '#1A1A1A',
        padding: '60px 64px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '52px' }}>
        {/* Left: Logo + Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Image
            src="/logo.png"
            alt="TDS Photography Logo"
            width={78}
            height={78}
            style={{ objectFit: 'contain' }}
            priority
          />
          <div>
            <div
              style={{
                fontWeight: '600',
                fontSize: '15px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase' as const,
                color: '#1A1A1A',
                marginBottom: '3px',
              }}
            >
              TDS PHOTOGRAHY
            </div>
            <div style={{ fontSize: '12.5px', color: '#4A4A3A', fontWeight: '400' }}>
              Architectural Photographer &amp; Videographer
            </div>
          </div>
        </div>

        {/* Right: Quotation Info */}
        <div
          style={{
            borderLeft: '3px solid #8C7E5E',
            paddingLeft: '22px',
            minWidth: '230px',
            maxWidth: '260px',
          }}
        >
          <div
            style={{
              fontWeight: '700',
              fontSize: '10.5px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#7A6A3E',
              marginBottom: '5px',
            }}
          >
            QUOTATION FOR
          </div>
          <div
            style={{
              fontWeight: '600',
              fontSize: '13.5px',
              color: '#7A6A3E',
              marginBottom: '12px',
              lineHeight: '1.4',
            }}
          >
            {data.quotationFor || 'Client Site Name'}
          </div>
          <div style={{ fontSize: '13px', color: '#1A1A1A', marginBottom: '6px', lineHeight: '1.5' }}>
            {data.serviceType || 'Service Type'}
          </div>
          <div style={{ fontSize: '13px', color: '#1A1A1A' }}>
            {data.date ? formatInputDate(data.date) : todayFormatted()}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          backgroundColor: '#B5A98A',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '44px',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '15px 22px',
            borderBottom: '1.5px solid #8C7E5E',
          }}
        >
          {['Description', 'Photos', 'Reels/Video', 'Total'].map((col) => (
            <div
              key={col}
              style={{
                fontWeight: '700',
                fontSize: '13px',
                color: '#1A1A1A',
                textAlign: col === 'Description' ? ('left' as const) : ('center' as const),
              }}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div style={{ padding: '18px 22px 0 22px' }}>
          {data.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                marginBottom: '10px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#1A1A1A' }}>{item.description || ''}</div>
              <div style={{ fontSize: '13px', color: '#1A1A1A', textAlign: 'center' as const }}>
                {item.photos || ''}
              </div>
              <div style={{ fontSize: '13px', color: '#1A1A1A', textAlign: 'center' as const }}>
                {item.reels || ''}
              </div>
              <div style={{ fontSize: '13px', color: '#1A1A1A', textAlign: 'center' as const }}>
                {item.total ? `${formatMoney(parseFloat(item.total.replace(/,/g, '')) || 0)}/-` : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Divider + Total Row */}
        <div style={{ padding: '10px 22px 22px 22px' }}>
          {/* Divider line aligned right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <div style={{ borderTop: '1.5px solid #6B5F3E', width: '200px' }} />
          </div>
          {/* Amounts */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>
              {formatMoney(finalAmount)}/-
            </div>
            {hasDiscount && (
              <div
                style={{
                  fontSize: '14px',
                  color: '#1A1A1A',
                  textDecoration: 'line-through',
                  textDecorationColor: '#1A1A1A',
                  textDecorationThickness: '1.5px',
                }}
              >
                {formatMoney(rawTotal)}/-
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Spacer pushes footer down ── */}
      <div style={{ flex: 1 }} />

      {/* ── Note ── */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11.5px', color: '#1A1A1A', lineHeight: '1.75', maxWidth: '680px' }}>
          <strong>Note:</strong> {data.noteText || DEFAULT_NOTE}
        </p>
      </div>

      {/* ── Footer ── */}
      <div>
        <div style={{ borderTop: '1px solid #8C7E5E', marginBottom: '14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '5px' }}>TDS_Photography</div>
            <div style={{ fontSize: '11.5px', color: '#1A1A1A', marginBottom: '2px', textDecoration: 'underline' }}>
              https://tdsphotography69.mypixieset.com/
            </div>
            <div style={{ fontSize: '11.5px', color: '#1A1A1A' }}>
              Instagram :{' '}
              <span style={{ textDecoration: 'underline' }}>tds.photography23</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontWeight: '700', fontSize: '12.5px', marginBottom: '5px' }}>Rehan Tank</div>
            <div style={{ fontSize: '11.5px', color: '#1A1A1A', marginBottom: '2px' }}>Phn : +91 7755930601</div>
            <div style={{ fontSize: '11.5px', color: '#1A1A1A', textDecoration: 'underline' }}>
              tds.photography23@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Form Panel ───────────────────────────────────────────────────────────────

function FormPanel({
  data,
  onChange,
  onDownload,
  downloading,
}: {
  data: QuotationData
  onChange: (d: QuotationData) => void
  onDownload: () => void
  downloading: boolean
}) {
  const updateField = <K extends keyof QuotationData>(key: K, value: QuotationData[K]) => {
    onChange({ ...data, [key]: value })
  }

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    onChange({
      ...data,
      items: data.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  const addItem = () => {
    onChange({ ...data, items: [...data.items, newItem()] })
  }

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) })
  }

  const inputClass =
    'w-full px-3 py-2 rounded border border-[#B5A98A]/60 bg-[#F5F3EA] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C7E5E]/40 focus:border-[#8C7E5E] transition'

  const labelClass = 'block text-[10px] font-semibold text-[#7A6A3E] uppercase tracking-widest mb-1.5'

  return (
    <div className="flex flex-col gap-5 p-5 bg-white/70 backdrop-blur rounded-2xl border border-[#B5A98A]/40 shadow-sm">
      {/* Brand header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#B5A98A]/30">
        <Image src="/logo.png" alt="TDS Logo" width={34} height={34} className="object-contain" />
        <div>
          <h1 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7A6A3E]">TDS Photography</h1>
          <p className="text-[10px] text-gray-400 tracking-wide">Quotation Generator</p>
        </div>
      </div>

      {/* Quotation For */}
      <div>
        <label className={labelClass}>Quotation For (Site Name)</label>
        <input
          className={inputClass}
          placeholder="e.g. Mumbai & Pune Site"
          value={data.quotationFor}
          onChange={(e) => updateField('quotationFor', e.target.value)}
        />
      </div>

      {/* Service Type */}
      <div>
        <label className={labelClass}>Service Type</label>
        <input
          className={inputClass}
          placeholder="e.g. Architectural Photography & Videography"
          value={data.serviceType}
          onChange={(e) => updateField('serviceType', e.target.value)}
        />
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          className={inputClass}
          value={data.date}
          onChange={(e) => updateField('date', e.target.value)}
        />
      </div>

      {/* Line Items */}
      <div>
        <label className={labelClass}>Line Items</label>
        <div className="flex flex-col gap-2.5">
          {data.items.map((item, idx) => (
            <div key={item.id} className="bg-[#EEECE2] rounded-xl border border-[#B5A98A]/30 p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold text-[#8C7E5E] uppercase tracking-wider">
                  Item {idx + 1}
                </span>
                {data.items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[10px] text-red-400 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Description (e.g. Mumbai 3Bhk)"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <input
                  className={inputClass}
                  placeholder="Photos (e.g. 30)"
                  value={item.photos}
                  onChange={(e) => updateItem(item.id, 'photos', e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="Reels/Video (e.g. 04)"
                  value={item.reels}
                  onChange={(e) => updateItem(item.id, 'reels', e.target.value)}
                />
                <div className="col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Row total amount (e.g. 16000)"
                    value={item.total}
                    onChange={(e) => updateItem(item.id, 'total', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-2 w-full py-2 rounded-lg border-2 border-dashed border-[#B5A98A]/60 text-[11px] text-[#8C7E5E] hover:border-[#7A6A3E] hover:text-[#7A6A3E] transition font-medium"
        >
          + Add Line Item
        </button>
      </div>

      {/* Totals Summary */}
      <div className="bg-[#B5A98A]/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] text-[#8C7E5E] font-semibold uppercase tracking-widest">Sum of Items</span>
        <span className="text-sm font-bold text-[#7A6A3E]">₹{formatMoney(calcTotal(data.items))}/-</span>
      </div>

      {/* Discount */}
      <div>
        <label className={labelClass}>Final Amount After Discount (optional)</label>
        <p className="text-[10px] text-gray-400 mb-1.5 leading-relaxed">
          Enter the discounted price. Original sum will appear with strikethrough on the PDF.
        </p>
        <input
          className={inputClass}
          placeholder="e.g. 28000 (leave blank = no discount)"
          value={data.discountAmount}
          onChange={(e) => updateField('discountAmount', e.target.value)}
        />
      </div>

      {/* Note */}
      <div>
        <label className={labelClass}>Note Text</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={data.noteText}
          onChange={(e) => updateField('noteText', e.target.value)}
        />
      </div>

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={downloading}
        className="w-full py-3 rounded-xl bg-[#7A6A3E] text-[#EEECE2] font-semibold text-sm tracking-widest uppercase hover:bg-[#8C7E5E] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
      >
        {downloading ? 'Generating PDF...' : 'Download PDF'}
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<QuotationData>({
    quotationFor: '',
    serviceType: 'Architectural Photography & Videography',
    date: todayInputValue(),
    items: [newItem()],
    discountAmount: '',
    noteText: DEFAULT_NOTE,
  })

  const [downloading, setDownloading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const element = previewRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#EEECE2',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)

      const dateStr = data.date ? data.date.replace(/-/g, '') : todayInputValue().replace(/-/g, '')
      const siteName = data.quotationFor
        ? data.quotationFor.replace(/[^a-zA-Z0-9]/g, '_')
        : 'Quotation'
      pdf.save(`TDS_Photography_${siteName}_${dateStr}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }, [data])

  return (
    <main className="min-h-screen bg-[#EEECE2]" style={{ fontFamily: "'Jost', 'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="no-print sticky top-0 z-10 bg-[#EEECE2]/90 backdrop-blur border-b border-[#B5A98A]/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="TDS" width={26} height={26} className="object-contain" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#7A6A3E]">
            TDS Photography
          </span>
        </div>
        {/* Mobile preview toggle */}
        <button
          className="lg:hidden text-[11px] font-medium text-[#8C7E5E] border border-[#B5A98A]/60 px-3 py-1.5 rounded-lg hover:bg-[#B5A98A]/20 transition"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? 'Edit Form' : 'Preview'}
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Form Panel */}
        <div className={`no-print w-full lg:w-[380px] xl:w-[420px] shrink-0 ${showPreview ? 'hidden lg:block' : 'block'}`}>
          <FormPanel
            data={data}
            onChange={setData}
            onDownload={handleDownload}
            downloading={downloading}
          />
        </div>

        {/* Preview Panel */}
        <div className={`w-full flex-1 flex flex-col items-center ${!showPreview ? 'hidden lg:flex' : 'flex'}`}>
          <div className="no-print mb-3 w-full max-w-[794px] flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C7E5E]">
              Live Preview
            </h2>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="text-[11px] font-medium text-[#EEECE2] bg-[#7A6A3E] px-4 py-1.5 rounded-lg hover:bg-[#8C7E5E] transition disabled:opacity-60"
            >
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          {/* Scaled preview */}
          <div className="w-full overflow-x-auto">
            <div
              style={{ width: '794px', margin: '0 auto' }}
              className="shadow-2xl"
            >
              <QuotationPreview data={data} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
