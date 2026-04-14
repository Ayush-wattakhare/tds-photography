import { NextResponse } from 'next/server'
import { createAuthToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const correctPassword = process.env.AUTH_PASSWORD
    
    if (!correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Authentication not configured' },
        { status: 500 }
      )
    }
    
    if (password !== correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      )
    }
    
    // Create signed JWT token
    const token = await createAuthToken()
    
    // Create response with cookie
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('tds_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    
    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
