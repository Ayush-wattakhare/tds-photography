import { supabase } from '@/lib/supabase/client'
import { updateQuotationSchema, quotationIdSchema } from '@/lib/supabase/validation'
import { handleApiError } from '@/lib/supabase/errors'
import type { Database } from '@/lib/supabase/database.types'

type QuotationUpdate = Database['public']['Tables']['quotations']['Update']
type LineItemInsert = Database['public']['Tables']['line_items']['Insert']

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate ID
    quotationIdSchema.parse(id)
    
    const { data, error } = await supabase
      .from('quotations')
      .select('*, line_items(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!data) {
      return Response.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }
    
    return Response.json({ success: true, data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate ID
    quotationIdSchema.parse(id)
    
    const body = await request.json()
    const validatedData = updateQuotationSchema.parse(body)
    
    // Calculate values
    const subtotal = validatedData.items.reduce((sum, item) => {
      const price = parseFloat(item.total.replace(/,/g, '')) || 0
      return sum + price
    }, 0)
    
    const discountAmount = parseFloat(validatedData.discountAmount?.replace(/,/g, '') || '0') || 0
    const total = subtotal - discountAmount
    const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0
    
    // Update quotation
    const updateData: QuotationUpdate = {
      client_site_name: validatedData.quotationFor,
      shoot_type: validatedData.serviceType,
      quotation_date: validatedData.date,
      discount_percentage: discountPercentage,
      subtotal,
      discount_amount: discountAmount,
      total,
      updated_at: new Date().toISOString(),
    }
    
    // Update quotation
    const { data: quotation, error: quotationError } = await (supabase as any)
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (quotationError) throw quotationError
    
    // Delete existing line items
    const { error: deleteError } = await supabase
      .from('line_items')
      .delete()
      .eq('quotation_id', id)
    
    if (deleteError) throw deleteError
    
    // Insert new line items
    const lineItemsToInsert: LineItemInsert[] = validatedData.items.map(item => ({
      quotation_id: id,
      description: item.description,
      photo_count: parseInt(item.photos) || 0,
      reel_video_count: parseInt(item.reels) || 0,
      price: parseFloat(item.total.replace(/,/g, '')) || 0,
    }))
    
    // Insert new line items
    const { error: insertError } = await (supabase as any)
      .from('line_items')
      .insert(lineItemsToInsert)
    
    if (insertError) throw insertError
    
    return Response.json({ success: true, data: quotation })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate ID
    quotationIdSchema.parse(id)
    
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
