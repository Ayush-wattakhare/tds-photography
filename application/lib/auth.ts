import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function createAuthToken(): Promise<string> {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
  
  return token
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}
