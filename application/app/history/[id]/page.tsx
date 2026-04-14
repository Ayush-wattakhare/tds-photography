'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useQuotationStore } from '@/lib/quotation-store'
import QuotationPreview from '@/app/components/quotation/QuotationPreview'
import { formatIndianRupees, formatFullDate, formatTimeIST, formatRelativeTime, formatShortDate, getDayName } from '@/lib/format-utils'
import type { Database } from '@/lib/supabase/database.types'
import type { QuotationData, LineItem } from '@/app/types/quotation'

type Quotation = Database['public']['Tables']['quotations']['Row'] & {
  line_items: Database['public']['Tables']['line_items']['Row'][]
}

export default function QuotationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { setQuotationData } = useQuotationStore()
  const previewRef = useRef<HTMLDivElement | null>(null)

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuotation()
    }
  }, [id])

  async function fetchQuotation() {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, line_items(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      setQuotation(data)
    } catch (error) {
      console.error('Error fetching quotation:', error)
      router.push('/history')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id)

      if (error) throw error
      router.push('/history')
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('Failed to delete quotation')
      setDeleting(false)
    }
  }

  function handleLoadIntoEditor() {
    if (!quotation) return

    // Convert database quotation to QuotationData format
    const quotationData: QuotationData = {
      quotationFor: quotation.client_site_name,
      serviceType: quotation.shoot_type,
      date: quotation.quotation_date,
      items: quotation.line_items.map((item): LineItem => ({
        id: item.id,
        description: item.description,
        photos: item.photo_count.toString(),
        reels: item.reel_video_count.toString(),
        total: item.price.toLocaleString('en-IN'),
      })),
      discountAmount: quotation.discount_amount.toLocaleString('en-IN'),
      noteText: '',
    }

    setQuotationData(quotationData)
    router.push('/')
  }

  function handleDownloadPDF() {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrinting(false), 500)
    }, 150)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEECE2] flex items-center justify-center">
        <div className="text-[#8C7E5E]">Loading...</div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-[#EEECE2] flex items-center justify-center">
        <div className="text-[#8C7E5E]">Quotation not found</div>
      </div>
    )
  }

  const totalPhotos = quotation.line_items.reduce((sum, item) => sum + item.photo_count, 0)
  const totalReels = quotation.line_items.reduce((sum, item) => sum + item.reel_video_count, 0)
  const avgPerItem = quotation.line_items.length > 0 ? quotation.total / quotation.line_items.length : 0

  const quotationDataForPreview: QuotationData = {
    quotationFor: quotation.client_site_name,
    serviceType: quotation.shoot_type,
    date: quotation.quotation_date,
    items: quotation.line_items.map((item): LineItem => ({
      id: item.id,
      description: item.description,
      photos: item.photo_count.toString(),
      reels: item.reel_video_count.toString(),
      total: item.price.toLocaleString('en-IN'),
    })),
    discountAmount: quotation.discount_amount.toLocaleString('en-IN'),
    noteText: '',
  }

  return (
    <>
      {/* Hidden preview for printing */}
      <div className="hidden print:block">
        <QuotationPreview data={quotationDataForPreview} previewRef={previewRef} />
      </div>

      {/* Main content - hidden during print */}
      <div className="min-h-screen bg-[#EEECE2] p-6 print:hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Back Button */}
          <Link
            href="/history"
            className="inline-flex items-center text-sm text-[#8C7E5E] hover:text-[#7A6A3E] mb-6"
          >
            ← Back to History
          </Link>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-[#C8BFA4]/30 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-2">
                      {quotation.client_site_name}
                    </h1>
                    <div className="text-xs uppercase tracking-wider text-[#8C7E5E]">
                      {quotation.shoot_type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#7A6A3E]">
                      QT-{quotation.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="inline-block mt-2 px-3 py-1 bg-[#C8BFA4]/20 rounded-full text-xs font-medium text-[#4A4238]">
                      {quotation.shoot_type.includes('Photography') ? 'Photography' : 'Videography'}
                    </div>
                  </div>
                </div>

                {/* Meta Strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[#EEECE2]/50 rounded-lg">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-1">
                      Quotation Date
                    </div>
                    <div className="text-sm font-medium text-[#1A1A1A]">
                      {formatShortDate(quotation.quotation_date)}
                    </div>
                    <div className="text-xs text-[#8C7E5E]">
                      {getDayName(quotation.quotation_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-1">
                      Created At
                    </div>
                    <div className="text-sm font-medium text-[#1A1A1A]">
                      {formatTimeIST(quotation.created_at)}
                    </div>
                    <div className="text-xs text-[#8C7E5E]">
                      {formatRelativeTime(quotation.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-1">
                      Last Modified
                    </div>
                    <div className="text-sm font-medium text-[#1A1A1A]">
                      {formatTimeIST(quotation.updated_at)}
                    </div>
                    <div className="text-xs text-[#8C7E5E]">
                      {quotation.created_at === quotation.updated_at
                        ? 'Same session'
                        : formatRelativeTime(quotation.updated_at)}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Line Items</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#C8BFA4]/20 border-b border-[#C8BFA4]/30">
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">
                            Description
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">
                            Photos
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">
                            Reels/Video
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.line_items.map((item, index) => (
                          <tr key={item.id} className="border-b border-[#C8BFA4]/20">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-[#1A1A1A]">
                                {item.description}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-[#4A4238]">
                              {item.photo_count}
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-[#4A4238]">
                              {item.reel_video_count}
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-medium text-[#1A1A1A]">
                              {formatIndianRupees(item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-lg border border-[#C8BFA4]/30 p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A4238]">
                      {quotation.line_items.length} line items
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatIndianRupees(quotation.subtotal)}
                    </span>
                  </div>

                  {quotation.discount_percentage > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#4A4238] flex items-center gap-2">
                        Discount
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {quotation.discount_percentage.toFixed(0)}%
                        </span>
                      </span>
                      <span className="font-medium text-green-700">
                        -{formatIndianRupees(quotation.discount_amount)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#C8BFA4]/30 flex justify-between">
                    <span className="text-base font-semibold text-[#1A1A1A]">Total</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#7A6A3E]">
                        {formatIndianRupees(quotation.total)}
                      </div>
                      {quotation.discount_percentage > 0 && (
                        <div className="text-xs text-[#8C7E5E] line-through">
                          {formatIndianRupees(quotation.subtotal)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#C8BFA4]/30">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={printing}
                    className="w-full px-4 py-2.5 bg-[#7A6A3E] text-white text-sm font-medium rounded-lg hover:bg-[#8C7E5E] transition disabled:opacity-50"
                  >
                    {printing ? 'Preparing...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handleLoadIntoEditor}
                    className="w-full px-4 py-2.5 bg-white border border-[#C8BFA4] text-[#4A4238] text-sm font-medium rounded-lg hover:bg-[#EEECE2]/50 transition"
                  >
                    Load into Editor
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full px-4 py-2.5 bg-white border-2 border-red-500 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Quotation'}
                  </button>
                </div>
              </div>

              {/* Activity Timeline Card */}
              <div className="bg-white rounded-lg border border-[#C8BFA4]/30 p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Activity Timeline</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                      <div className="w-px h-full bg-[#C8BFA4]/30 mt-1"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-sm font-medium text-[#1A1A1A]">Quotation Created</div>
                      <div className="text-xs text-[#8C7E5E] mt-1">
                        {formatFullDate(quotation.created_at)} · {formatTimeIST(quotation.created_at)}
                      </div>
                    </div>
                  </div>

                  {quotation.created_at !== quotation.updated_at && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5"></div>
                        <div className="w-px h-full bg-[#C8BFA4]/30 mt-1"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="text-sm font-medium text-[#1A1A1A]">Draft Saved</div>
                        <div className="text-xs text-[#8C7E5E] mt-1">
                          {formatFullDate(quotation.updated_at)} · {formatTimeIST(quotation.updated_at)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1A1A1A]">Session Started</div>
                      <div className="text-xs text-[#8C7E5E] mt-1">
                        {formatRelativeTime(quotation.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="bg-white rounded-lg border border-[#C8BFA4]/30 p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Quick Info</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A4238]">Total Photos</span>
                    <span className="font-medium text-[#1A1A1A]">{totalPhotos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A4238]">Total Reels/Videos</span>
                    <span className="font-medium text-[#1A1A1A]">{totalReels}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A4238]">Avg. per Line Item</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatIndianRupees(Math.round(avgPerItem))}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#C8BFA4]/30 flex justify-between text-sm">
                    <span className="text-[#4A4238]">Quotation ID</span>
                    <span className="font-mono text-xs font-medium text-[#7A6A3E]">
                      QT-{quotation.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
