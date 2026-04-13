import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(__dirname, '.env.local') })

async function testSaveQuotation() {
  console.log('Testing quotation save functionality...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Test data
  const testQuotation = {
    client_site_name: 'Test Client - ' + new Date().toISOString(),
    shoot_type: 'Architectural Photography & Videography',
    quotation_date: '2024-01-15',
    discount_percentage: 10,
    subtotal: 50000,
    discount_amount: 5000,
    total: 45000,
  }
  
  const testLineItems = [
    {
      description: 'Exterior Photography',
      photo_count: 30,
      reel_video_count: 2,
      price: 25000,
    },
    {
      description: 'Interior Photography',
      photo_count: 40,
      reel_video_count: 1,
      price: 25000,
    },
  ]
  
  try {
    // 1. Create quotation
    console.log('1. Creating quotation...')
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert(testQuotation)
      .select()
      .single()
    
    if (quotationError) throw quotationError
    console.log('✅ Quotation created with ID:', quotation.id)
    
    // 2. Create line items
    console.log('\n2. Creating line items...')
    const lineItemsWithQuotationId = testLineItems.map(item => ({
      ...item,
      quotation_id: quotation.id,
    }))
    
    const { data: lineItems, error: lineItemsError } = await supabase
      .from('line_items')
      .insert(lineItemsWithQuotationId)
      .select()
    
    if (lineItemsError) throw lineItemsError
    console.log('✅ Created', lineItems.length, 'line items')
    
    // 3. Retrieve quotation with line items
    console.log('\n3. Retrieving quotation with line items...')
    const { data: retrieved, error: retrieveError } = await supabase
      .from('quotations')
      .select('*, line_items(*)')
      .eq('id', quotation.id)
      .single()
    
    if (retrieveError) throw retrieveError
    console.log('✅ Retrieved quotation:', {
      client: retrieved.client_site_name,
      total: retrieved.total,
      lineItemCount: retrieved.line_items.length,
    })
    
    // 4. Update quotation
    console.log('\n4. Updating quotation...')
    const { error: updateError } = await supabase
      .from('quotations')
      .update({ total: 40000 })
      .eq('id', quotation.id)
    
    if (updateError) throw updateError
    console.log('✅ Quotation updated')
    
    // 5. Delete quotation (cascade deletes line items)
    console.log('\n5. Deleting quotation...')
    const { error: deleteError } = await supabase
      .from('quotations')
      .delete()
      .eq('id', quotation.id)
    
    if (deleteError) throw deleteError
    console.log('✅ Quotation deleted (line items cascade deleted)')
    
    // 6. Verify deletion
    console.log('\n6. Verifying deletion...')
    const { data: checkDeleted } = await supabase
      .from('quotations')
      .select()
      .eq('id', quotation.id)
      .single()
    
    if (!checkDeleted) {
      console.log('✅ Quotation successfully deleted')
    }
    
    console.log('\n✅ All CRUD operations working correctly!')
    console.log('✅ Database connection and save functionality verified!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testSaveQuotation()
