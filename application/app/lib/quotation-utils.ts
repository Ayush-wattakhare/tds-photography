import type { LineItem, QuotationData } from '../types/quotation'

export const DEFAULT_NOTE =
  'This quotation does not include travel and accomodation expenses, transportation and accommodation charges will have to be borne by the client. This quotation is valid for 15 days only.'

export function todayFormatted(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function todayInputValue(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export function formatInputDate(isoDate: string): string {
  if (!isoDate) return todayFormatted()
  const [y, m, day] = isoDate.split('-')
  return `${day}/${m}/${y}`
}

export function calcTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => {
    const val = parseFloat(item.total.replace(/,/g, ''))
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
}

export function formatMoney(amount: number): string {
  if (isNaN(amount) || amount === 0) return '0'
  return amount.toLocaleString('en-IN')
}

export function newItem(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    description: '',
    photos: '',
    reels: '',
    total: '',
  }
}

export function defaultQuotation(): QuotationData {
  return {
    quotationFor: '',
    serviceType: 'Architectural Photography & Videography',
    date: todayInputValue(),
    items: [newItem()],
    discountAmount: '',
    noteText: DEFAULT_NOTE,
  }
}
