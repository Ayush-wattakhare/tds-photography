import { supabase } from '@/lib/supabase/client'
import { createQuotationSchema } from '@/lib/supabase/validation'
import { handleApiError } from '@/lib/supabase/errors'
import type { Database } from '@/lib/supabase/database.types'

type QuotationInsert = Database['public']['Tables']['quotations']['Insert']
type LineItemInsert = Database['public']['Tables']['line_items']['Insert']

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validatedData = createQuotationSchema.parse(body)

    // Calculate values
    const subtotal = validatedData.items.reduce((sum, item) => {
      const price = parseFloat(item.total.replace(/,/g, '')) || 0
      return sum + price
    }, 0)

    const discountAmount = parseFloat(validatedData.discountAmount?.replace(/,/g, '') || '0') || 0
    const total = subtotal - discountAmount
    const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0

    // Insert quotation
    const insertData: QuotationInsert = {
      client_site_name: validatedData.quotationFor,
      shoot_type: validatedData.serviceType,
      quotation_date: validatedData.date,
      discount_percentage: discountPercentage,
      subtotal,
      discount_amount: discountAmount,
      total,
    }

    const { data: quotation, error: quotationError } = await (supabase as any)
      .from('quotations')
      .insert(insertData)
      .select()
      .single()

    if (quotationError) throw quotationError

    // Insert line items
    const lineItemsToInsert: LineItemInsert[] = validatedData.items.map(item => ({
      quotation_id: quotation.id,
      description: item.description,
      photo_count: parseInt(item.photos) || 0,
      reel_video_count: parseInt(item.reels) || 0,
      price: parseFloat(item.total.replace(/,/g, '')) || 0,
    }))

    const { error: lineItemsError } = await (supabase as any)
      .from('line_items')
      .insert(lineItemsToInsert)

    if (lineItemsError) throw lineItemsError

    return Response.json({ success: true, data: quotation }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 100
    const offset = (page - 1) * limit

    const { data, error } = await supabase
      .from('quotations')
      .select('*, line_items(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return Response.json({ success: true, data })
  } catch (error) {
    return handleApiError(error)
  }
}
