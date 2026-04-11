export interface LineItem {
  id: string
  description: string
  photos: string
  reels: string
  total: string
}

export interface QuotationData {
  quotationFor: string
  serviceType: string
  date: string
  items: LineItem[]
  discountAmount: string
  noteText: string
}
