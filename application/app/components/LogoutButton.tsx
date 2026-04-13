'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="text-[11px] font-medium text-[#8C7E5E] border border-[#C8BFAA]/60 px-3 py-1.5 rounded-lg hover:bg-[#B5A98A]/20 transition disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
