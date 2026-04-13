import type { Database } from './database.types'
import type { QuotationData, LineItem } from '@/app/types/quotation'

type DbQuotation = Database['public']['Tables']['quotations']['Row']
type DbLineItem = Database['public']['Tables']['line_items']['Row']

export function dbToQuotationData(
  quotation: DbQuotation & { line_items: DbLineItem[] }
): QuotationData {
  return {
    quotationFor: quotation.client_site_name,
    serviceType: quotation.shoot_type,
    date: quotation.quotation_date,
    items: quotation.line_items.map(dbToLineItem),
    discountAmount: quotation.discount_amount.toString(),
    noteText: '', // Note text not stored in DB, use default
  }
}

export function dbToLineItem(item: DbLineItem): LineItem {
  return {
    id: item.id,
    description: item.description,
    photos: item.photo_count.toString(),
    reels: item.reel_video_count.toString(),
    total: item.price.toLocaleString('en-IN'),
  }
}

export function quotationDataToDb(data: QuotationData) {
  const subtotal = calculateSubtotal(data.items)
  const discountAmount = parseFloat(data.discountAmount.replace(/,/g, '')) || 0
  const total = subtotal - discountAmount
  const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0
  
  return {
    quotation: {
      client_site_name: data.quotationFor,
      shoot_type: data.serviceType,
      quotation_date: data.date,
      discount_percentage: discountPercentage,
      subtotal,
      discount_amount: discountAmount,
      total,
    },
    lineItems: data.items.map(item => ({
      description: item.description,
      photo_count: parseInt(item.photos) || 0,
      reel_video_count: parseInt(item.reels) || 0,
      price: parseFloat(item.total.replace(/,/g, '')) || 0,
    })),
  }
}

function calculateSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => {
    const price = parseFloat(item.total.replace(/,/g, '')) || 0
    return sum + price
  }, 0)
}
