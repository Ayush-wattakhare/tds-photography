'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatIndianRupees, formatFullDate, formatTimeIST, formatRelativeTime, isToday, getCurrentMonthYear, getPreviousMonthYear, isCurrentMonth, isPreviousMonth } from '@/lib/format-utils'
import type { Database } from '@/lib/supabase/database.types'

type Quotation = Database['public']['Tables']['quotations']['Row'] & {
  line_items: Database['public']['Tables']['line_items']['Row'][]
}

type FilterType = 'all' | 'current-month' | 'previous-month' | 'photography' | 'videography'

export default function HistoryPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  useEffect(() => {
    fetchQuotations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [quotations, searchQuery, activeFilter])

  async function fetchQuotations() {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, line_items(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotations(data || [])
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...quotations]

    // Apply filter
    if (activeFilter === 'current-month') {
      filtered = filtered.filter(q => isCurrentMonth(q.created_at))
    } else if (activeFilter === 'previous-month') {
      filtered = filtered.filter(q => isPreviousMonth(q.created_at))
    } else if (activeFilter === 'photography') {
      filtered = filtered.filter(q => q.shoot_type.toLowerCase().includes('photography'))
    } else if (activeFilter === 'videography') {
      filtered = filtered.filter(q => q.shoot_type.toLowerCase().includes('videography'))
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.client_site_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredQuotations(filtered)
  }

  // Calculate stats
  const totalCount = quotations.length
  const totalValue = quotations.reduce((sum, q) => sum + q.total, 0)
  
  const currentMonthQuotations = quotations.filter(q => isCurrentMonth(q.created_at))
  const currentMonthCount = currentMonthQuotations.length
  const currentMonthValue = currentMonthQuotations.reduce((sum, q) => sum + q.total, 0)
  
  const avgPerQuotation = totalCount > 0 ? totalValue / totalCount : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEECE2] flex items-center justify-center">
        <div className="text-[#8C7E5E]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EEECE2] p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-[#8C7E5E] hover:text-[#7A6A3E] mb-4"
          >
            ← Back to Generator
          </Link>
          <h1 className="text-3xl font-semibold text-[#1A1A1A]">Quotation History</h1>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-[#C8BFA4]/30">
            <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-2">Total Quotations</div>
            <div className="text-3xl font-semibold text-[#1A1A1A]">{totalCount}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-[#C8BFA4]/30">
            <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-2">Total Value</div>
            <div className="text-3xl font-semibold text-[#1A1A1A]">{formatIndianRupees(totalValue)}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-[#C8BFA4]/30">
            <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-2">This Month</div>
            <div className="text-3xl font-semibold text-[#1A1A1A]">{currentMonthCount}</div>
            <div className="text-sm text-[#4A4238] mt-1">{formatIndianRupees(currentMonthValue)}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-[#C8BFA4]/30">
            <div className="text-xs uppercase tracking-wider text-[#8C7E5E] mb-2">Avg. per Quotation</div>
            <div className="text-3xl font-semibold text-[#1A1A1A]">{formatIndianRupees(Math.round(avgPerQuotation))}</div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-[#C8BFA4]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === 'all'
                  ? 'bg-[#7A6A3E] text-white'
                  : 'bg-[#C8BFA4]/20 text-[#4A4238] hover:bg-[#C8BFA4]/40'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('current-month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === 'current-month'
                  ? 'bg-[#7A6A3E] text-white'
                  : 'bg-[#C8BFA4]/20 text-[#4A4238] hover:bg-[#C8BFA4]/40'
              }`}
            >
              {getCurrentMonthYear()}
            </button>
            <button
              onClick={() => setActiveFilter('previous-month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === 'previous-month'
                  ? 'bg-[#7A6A3E] text-white'
                  : 'bg-[#C8BFA4]/20 text-[#4A4238] hover:bg-[#C8BFA4]/40'
              }`}
            >
              {getPreviousMonthYear()}
            </button>
            <button
              onClick={() => setActiveFilter('photography')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === 'photography'
                  ? 'bg-[#7A6A3E] text-white'
                  : 'bg-[#C8BFA4]/20 text-[#4A4238] hover:bg-[#C8BFA4]/40'
              }`}
            >
              Photography
            </button>
            <button
              onClick={() => setActiveFilter('videography')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeFilter === 'videography'
                  ? 'bg-[#7A6A3E] text-white'
                  : 'bg-[#C8BFA4]/20 text-[#4A4238] hover:bg-[#C8BFA4]/40'
              }`}
            >
              Videography
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#C8BFA4] text-sm focus:outline-none focus:ring-2 focus:ring-[#7A6A3E] w-full md:w-64"
          />
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg border border-[#C8BFA4]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#C8BFA4]/20 border-b border-[#C8BFA4]/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">Client / Site</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">Created On</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">Items</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A4238]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#8C7E5E]">
                      No quotations found
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((quotation, index) => (
                    <tr
                      key={quotation.id}
                      className="border-b border-[#C8BFA4]/20 hover:bg-[#EEECE2]/30 cursor-pointer transition"
                      onClick={() => router.push(`/history/${quotation.id}`)}
                    >
                      <td className="px-4 py-4 text-sm text-[#8C7E5E]">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-[#1A1A1A]">{quotation.client_site_name}</div>
                        <div className="text-xs text-[#8C7E5E]">{quotation.shoot_type}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#4A4238]">{quotation.shoot_type}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-[#1A1A1A]">{formatFullDate(quotation.created_at)}</div>
                        <div className="text-xs text-[#8C7E5E]">
                          {formatTimeIST(quotation.created_at)} · {formatRelativeTime(quotation.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            isToday(quotation.created_at)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-[#C8BFA4]/30 text-[#4A4238]'
                          }`}
                        >
                          {quotation.line_items.length} items
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-[#1A1A1A]">
                          {formatIndianRupees(quotation.total)}
                        </div>
                        <div className="text-xs text-[#8C7E5E]">
                          {quotation.discount_percentage > 0
                            ? `After ${quotation.discount_percentage.toFixed(0)}% discount`
                            : 'No discount'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/history/${quotation.id}`)
                          }}
                          className="px-4 py-2 bg-[#7A6A3E] text-white text-sm font-medium rounded-lg hover:bg-[#8C7E5E] transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
