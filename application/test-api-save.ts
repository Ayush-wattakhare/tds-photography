import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testApiSave() {
  console.log('Testing API save endpoint...')

  const testPayload = {
    quotationFor: 'Test Client API',
    serviceType: 'Architectural Photography',
    date: '2026-04-14',
    items: [
      {
        id: 'test-1',
        description: 'Interior Photography',
        photos: '20',
        reels: '2',
        total: '15000',
      },
      {
        id: 'test-2',
        description: 'Exterior Photography',
        photos: '10',
        reels: '1',
        total: '10000',
      },
    ],
    discountAmount: '',
    subtotal: 25000,
    total: 25000,
    noteText: 'Test note',
  }

  console.log('\nPayload:', JSON.stringify(testPayload, null, 2))

  try {
    const response = await fetch('http://localhost:3000/api/quotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    console.log('\nResponse status:', response.status)

    const data = await response.json()
    console.log('Response data:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ API save successful!')
      
      // Clean up
      if (data.data?.id) {
        console.log('\nCleaning up test data...')
        const deleteResponse = await fetch(`http://localhost:3000/api/quotations/${data.data.id}`, {
          method: 'DELETE',
        })
        if (deleteResponse.ok) {
          console.log('✓ Test data cleaned up!')
        }
      }
    } else {
      console.log('\n❌ API save failed!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    console.log('\nMake sure the dev server is running: npm run dev')
  }
}

testApiSave().catch(console.error)
