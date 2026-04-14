import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuotationSave() {
  console.log('Testing quotation save...')
  console.log('Supabase URL:', supabaseUrl)

  // Test 1: Check if tables exist
  console.log('\n1. Checking if quotations table exists...')
  const { data: quotations, error: quotationsError } = await supabase
    .from('quotations')
    .select('*')
    .limit(1)

  if (quotationsError) {
    console.error('❌ Error accessing quotations table:', quotationsError.message)
    console.log('\nYou need to run the migration SQL in Supabase!')
    console.log('Go to: Supabase Dashboard > SQL Editor')
    console.log('Run the SQL from: application/supabase/migrations/001_initial_schema.sql')
    return
  }

  console.log('✓ Quotations table exists')

  // Test 2: Try to insert a test quotation
  console.log('\n2. Trying to insert a test quotation...')
  const testQuotation = {
    client_site_name: 'Test Client',
    shoot_type: 'Test Photography',
    quotation_date: '2026-04-14',
    discount_percentage: 0,
    subtotal: 10000,
    discount_amount: 0,
    total: 10000,
  }

  const { data: insertedQuotation, error: insertError } = await supabase
    .from('quotations')
    .insert(testQuotation)
    .select()
    .single()

  if (insertError) {
    console.error('❌ Error inserting quotation:', insertError.message)
    return
  }

  console.log('✓ Quotation inserted successfully!')
  console.log('Quotation ID:', insertedQuotation.id)

  // Test 3: Insert line items
  console.log('\n3. Trying to insert line items...')
  const testLineItems = [
    {
      quotation_id: insertedQuotation.id,
      description: 'Test Item 1',
      photo_count: 10,
      reel_video_count: 2,
      price: 5000,
    },
    {
      quotation_id: insertedQuotation.id,
      description: 'Test Item 2',
      photo_count: 5,
      reel_video_count: 1,
      price: 5000,
    },
  ]

  const { error: lineItemsError } = await supabase
    .from('line_items')
    .insert(testLineItems)

  if (lineItemsError) {
    console.error('❌ Error inserting line items:', lineItemsError.message)
    return
  }

  console.log('✓ Line items inserted successfully!')

  // Test 4: Fetch the quotation with line items
  console.log('\n4. Fetching quotation with line items...')
  const { data: fetchedQuotation, error: fetchError } = await supabase
    .from('quotations')
    .select('*, line_items(*)')
    .eq('id', insertedQuotation.id)
    .single()

  if (fetchError) {
    console.error('❌ Error fetching quotation:', fetchError.message)
    return
  }

  console.log('✓ Quotation fetched successfully!')
  console.log('Client:', fetchedQuotation.client_site_name)
  console.log('Line items count:', fetchedQuotation.line_items.length)

  // Clean up
  console.log('\n5. Cleaning up test data...')
  const { error: deleteError } = await supabase
    .from('quotations')
    .delete()
    .eq('id', insertedQuotation.id)

  if (deleteError) {
    console.error('❌ Error deleting test quotation:', deleteError.message)
    return
  }

  console.log('✓ Test data cleaned up!')
  console.log('\n✅ All tests passed! Your database is working correctly.')
}

testQuotationSave().catch(console.error)
