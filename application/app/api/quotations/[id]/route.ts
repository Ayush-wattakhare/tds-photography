import { supabase } from '@/lib/supabase/client'
import { updateQuotationSchema, quotationIdSchema } from '@/lib/supabase/validation'
import { handleApiError } from '@/lib/supabase/errors'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    quotationIdSchema.parse(params.id)
    
    const { data, error } = await supabase
      .from('quotations')
      .select('*, line_items(*)')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    quotationIdSchema.parse(params.id)
    
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
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .update({
        client_site_name: validatedData.quotationFor,
        shoot_type: validatedData.serviceType,
        quotation_date: validatedData.date,
        discount_percentage: discountPercentage,
        subtotal,
        discount_amount: discountAmount,
        total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (quotationError) throw quotationError
    
    // Delete existing line items
    const { error: deleteError } = await supabase
      .from('line_items')
      .delete()
      .eq('quotation_id', params.id)
    
    if (deleteError) throw deleteError
    
    // Insert new line items
    const lineItemsToInsert = validatedData.items.map(item => ({
      quotation_id: params.id,
      description: item.description,
      photo_count: parseInt(item.photos) || 0,
      reel_video_count: parseInt(item.reels) || 0,
      price: parseFloat(item.total.replace(/,/g, '')) || 0,
    }))
    
    const { error: insertError } = await supabase
      .from('line_items')
      .insert(lineItemsToInsert)
    
    if (insertError) throw insertError
    
    return Response.json({ success: true, data: quotation })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    quotationIdSchema.parse(params.id)
    
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
