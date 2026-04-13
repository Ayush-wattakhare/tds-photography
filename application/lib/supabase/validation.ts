import { z } from 'zod'

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  photos: z.string(),
  reels: z.string(),
  total: z.string().regex(/^\d{1,3}(,\d{3})*(\.\d{2})?$/, 'Invalid amount format'),
})

export const createQuotationSchema = z.object({
  quotationFor: z.string().min(1, 'Client/Site name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  discountAmount: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  subtotal: z.number().min(0),
  total: z.number().min(0),
  noteText: z.string().optional(),
})

export const updateQuotationSchema = createQuotationSchema

export const quotationIdSchema = z.string().uuid('Invalid quotation ID')
