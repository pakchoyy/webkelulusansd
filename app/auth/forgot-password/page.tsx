'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    console.log('Reset password result:', { error })

    if (error) {
      if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        setError('Email tidak valid atau belum terdaftar.')
      } else if (error.message.includes('not found')) {
        setError('Email tidak ditemukan di sistem kami.')
      } else {
        setError(`Gagal: ${error.message}`)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Lupa Password</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan email untuk reset password</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <p className="text-green-700 text-sm font-medium">
                ✅ Email reset password sudah dikirim!
              </p>
              <p className="text-green-600 text-xs mt-2">
                Cek inbox email kamu dan klik link untuk membuat password baru.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full neo-brutal-sm bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@sekolah.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="neo-brutal-sm w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Mengirim...' : 'Kirim Email Reset'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Ingat password?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}