'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setHasSession(false)
      }
    }
    checkSession()
  }, [supabase])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Password tidak cocok.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message || 'Gagal update password.')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Session Tidak Valid</h1>
          <p className="text-sm text-gray-500 mt-2">Link reset password sudah expired atau tidak valid.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block mt-4 neo-brutal-sm bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Minta Link Baru
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Password Baru</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan password baru kamu</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-green-700 text-sm font-medium">
                ✅ Password berhasil diupdate!
              </p>
              <p className="text-green-600 text-xs mt-2">
                Mengarahkan ke halaman login...
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full neo-brutal-sm bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Login Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Password Baru</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="neo-brutal-sm w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  )
}