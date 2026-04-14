import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(__dirname, '.env.local') })

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
    process.exit(1)
  }
  
  console.log('✅ Environment variables loaded')
  console.log('URL:', supabaseUrl)
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Test basic query
    const { data, error } = await supabase
      .from('quotations')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('Error details:', error)
      process.exit(1)
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Database tables are accessible')
    process.exit(0)
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    process.exit(1)
  }
}

testConnection()
