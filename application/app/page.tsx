'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import FormPanel from './components/form/FormPanel'
import QuotationPreview from './components/quotation/QuotationPreview'
import { defaultQuotation } from './lib/quotation-utils'
import type { QuotationData } from './types/quotation'

export default function Home() {
  const [data, setData] = useState<QuotationData>(defaultQuotation)
  const [printing, setPrinting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const handleDownload = () => {
    setPrinting(true)
    // Small delay so the state-triggered re-render fully settles before print dialog
    setTimeout(() => {
      window.print()
      // Reset after user closes the print dialog
      setTimeout(() => setPrinting(false), 500)
    }, 150)
  }

  return (
    <main className="min-h-screen bg-[#EEECE2]" style={{ fontFamily: "'Jost', 'Inter', sans-serif" }}>
      {/* ── Top bar — hidden during print ── */}
      <div className="no-print sticky top-0 z-10 bg-[#EEECE2]/95 backdrop-blur border-b border-[#C8BFAA]/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="TDS" width={26} height={26} className="object-contain" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#7A6A3E]">
            TDS Photography — Quotation Generator
          </span>
        </div>
        <button
          type="button"
          className="lg:hidden text-[11px] font-medium text-[#8C7E5E] border border-[#C8BFAA]/60 px-3 py-1.5 rounded-lg hover:bg-[#B5A98A]/20 transition"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? 'Edit Form' : 'Preview'}
        </button>
      </div>

      {/* ── Main layout — NOT no-print, so the preview remains visible during print ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Form Panel — hidden during print */}
        <div
          className={`no-print w-full lg:w-[400px] xl:w-[430px] shrink-0 ${
            showPreview ? 'hidden lg:block' : 'block'
          }`}
        >
          <FormPanel
            data={data}
            onChange={setData}
            onDownload={handleDownload}
            downloading={printing}
          />
        </div>

        {/* Preview Panel — visible during print */}
        <div
          className={`w-full flex-1 flex flex-col items-center ${
            !showPreview ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Label + button — hidden during print */}
          <div className="no-print mb-3 w-full max-w-[794px] flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C7E5E]">
              Live Preview
            </h2>
            <button
              type="button"
              onClick={handleDownload}
              disabled={printing}
              className="text-[11px] font-medium text-[#EEECE2] bg-[#7A6A3E] px-4 py-1.5 rounded-lg hover:bg-[#8C7E5E] transition disabled:opacity-60"
            >
              {printing ? 'Opening...' : 'Download PDF'}
            </button>
          </div>

          {/* Scrollable A4 preview — always visible, prints correctly */}
          <div className="w-full overflow-x-auto">
            <div style={{ width: '794px', margin: '0 auto' }} className="shadow-2xl">
              <QuotationPreview data={data} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
