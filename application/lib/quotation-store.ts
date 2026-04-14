import { create } from 'zustand'
import type { QuotationData } from '@/app/types/quotation'
import { defaultQuotation } from '@/app/lib/quotation-utils'

interface QuotationStore {
  quotationData: QuotationData
  setQuotationData: (data: QuotationData) => void
  resetQuotation: () => void
}

export const useQuotationStore = create<QuotationStore>((set) => ({
  quotationData: defaultQuotation(),
  setQuotationData: (data) => set({ quotationData: data }),
  resetQuotation: () => set({ quotationData: defaultQuotation() }),
}))
