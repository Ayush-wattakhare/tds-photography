'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Incorrect password')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EEECE2' }}>
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="TDS Photography"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: '#1A1A1A' }}>
          TDS Photography
        </h1>
        <p className="text-center mb-8" style={{ color: '#4A4238' }}>
          Quotation Generator
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#C8BFA4',
                color: '#1A1A1A',
              }}
              placeholder="Enter password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#7A6A3E' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-8" style={{ color: '#8C7E5E' }}>
          For authorized use only
        </p>
      </div>
    </div>
  )
}
