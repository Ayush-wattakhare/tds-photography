'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { QuotationData, LineItem } from '../../types/quotation'
import { calcTotal, formatMoney, newItem } from '../../lib/quotation-utils'
import LineItemRow from './LineItemRow'

interface Props {
  data: QuotationData
  onChange: (d: QuotationData) => void
  onDownload: () => void
  downloading: boolean
}

const INPUT =
  'w-full px-3 py-2 rounded-lg border border-[#C8BFAA]/60 bg-[#F5F3EA] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C7E5E]/30 focus:border-[#8C7E5E] transition'

const LABEL = 'block text-[10px] font-semibold text-[#7A6A3E] uppercase tracking-widest mb-1.5'

export default function FormPanel({ data, onChange, onDownload, downloading }: Props) {
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const set = <K extends keyof QuotationData>(key: K, value: QuotationData[K]) => {
    onChange({ ...data, [key]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)

    try {
      const rawTotal = calcTotal(data.items)
      const discountAmt = parseFloat(data.discountAmount.replace(/,/g, ''))
      const finalTotal = !isNaN(discountAmt) && discountAmt > 0 ? discountAmt : rawTotal
      const discountAmount = !isNaN(discountAmt) && discountAmt > 0 ? rawTotal - discountAmt : 0
      const discountPercentage = discountAmount > 0 ? (discountAmount / rawTotal) * 100 : 0

      const payload = {
        quotationFor: data.quotationFor,
        serviceType: data.serviceType,
        date: data.date,
        items: data.items,
        discountAmount: data.discountAmount,
        discountPercentage: discountPercentage,
        subtotal: rawTotal,
        total: finalTotal,
        noteText: data.noteText,
      }

      console.log('Saving quotation with payload:', payload)

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status)

      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save quotation')
      }

      console.log('✅ Quotation saved successfully!')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('❌ Error saving quotation:', error)
      alert(error instanceof Error ? error.message : 'Failed to save quotation')
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (id: string, field: keyof LineItem, value: string) => {
    onChange({
      ...data,
      items: data.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  const addItem = () => onChange({ ...data, items: [...data.items, newItem()] })

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return
    onChange({ ...data, items: data.items.filter((i) => i.id !== id) })
  }

  const rawTotal = calcTotal(data.items)
  const discountAmt = parseFloat(data.discountAmount.replace(/,/g, ''))
  const hasDiscount = !isNaN(discountAmt) && discountAmt > 0

  return (
    <div className="flex flex-col gap-5 p-5 bg-white/70 backdrop-blur rounded-2xl border border-[#C8BFAA]/40 shadow-sm">
      {/* Brand header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#C8BFAA]/40">
        <Image src="/logo.png" alt="TDS Logo" width={34} height={34} className="object-contain" />
        <div>
          <h1 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7A6A3E]">
            TDS Photography
          </h1>
          <p className="text-[10px] text-gray-400 tracking-wide">Quotation Generator</p>
        </div>
      </div>

      {/* Quotation For */}
      <div>
        <label className={LABEL}>Quotation For (Site Name)</label>
        <input
          className={INPUT}
          placeholder="e.g. Mumbai & Pune Site"
          value={data.quotationFor}
          onChange={(e) => set('quotationFor', e.target.value)}
        />
      </div>

      {/* Service Type */}
      <div>
        <label className={LABEL}>Service Type</label>
        <input
          className={INPUT}
          placeholder="e.g. Architectural Photography & Videography"
          value={data.serviceType}
          onChange={(e) => set('serviceType', e.target.value)}
        />
      </div>

      {/* Date */}
      <div>
        <label className={LABEL}>Date</label>
        <input
          type="date"
          className={INPUT}
          value={data.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </div>

      {/* Line Items */}
      <div>
        <label className={LABEL}>Line Items</label>
        <div className="flex flex-col gap-2.5">
          {data.items.map((item, idx) => (
            <LineItemRow
              key={item.id}
              item={item}
              index={idx}
              canRemove={data.items.length > 1}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 w-full py-2 rounded-lg border-2 border-dashed border-[#B5A98A]/60 text-[11px] text-[#8C7E5E] hover:border-[#7A6A3E] hover:text-[#7A6A3E] transition font-medium"
        >
          + Add Line Item
        </button>
      </div>

      {/* Sum of items */}
      <div className="bg-[#B5A98A]/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] text-[#8C7E5E] font-semibold uppercase tracking-widest">
          Sum of Items
        </span>
        <span className="text-sm font-bold text-[#7A6A3E]">₹{formatMoney(rawTotal)}/-</span>
      </div>

      {/* Discount */}
      <div>
        <label className={LABEL}>Final (Discounted) Amount — optional</label>
        <p className="text-[10px] text-gray-400 mb-1.5 leading-relaxed">
          Enter the final price after discount. Original sum (₹{formatMoney(rawTotal)}) will show
          with strikethrough.
        </p>
        <input
          className={INPUT}
          placeholder="e.g. 28000 — leave blank for no discount"
          value={data.discountAmount}
          onChange={(e) => set('discountAmount', e.target.value)}
        />
        {hasDiscount && (
          <p className="mt-1.5 text-[10px] text-[#7A6A3E]">
            Preview: <strong>{formatMoney(discountAmt)}/-</strong>{' '}
            <span className="line-through text-gray-500">{formatMoney(rawTotal)}/-</span>
          </p>
        )}
      </div>

      {/* Note */}
      <div>
        <label className={LABEL}>Note Text</label>
        <textarea
          className={`${INPUT} resize-none`}
          rows={3}
          value={data.noteText}
          onChange={(e) => set('noteText', e.target.value)}
        />
      </div>

      {/* Save & Download Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !data.quotationFor || data.items.length === 0}
          className="w-full py-3 rounded-xl bg-[#7A6A3E] text-[#EEECE2] font-semibold text-sm tracking-widest uppercase hover:bg-[#8C7E5E] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
        >
          {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Quotation'}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="w-full py-3 rounded-xl bg-white border-2 border-[#7A6A3E] text-[#7A6A3E] font-semibold text-sm tracking-widest uppercase hover:bg-[#7A6A3E] hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
        >
          {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}
