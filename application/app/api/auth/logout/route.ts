import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the auth cookie
  response.cookies.delete('tds_auth_token')
  
  return response
}
