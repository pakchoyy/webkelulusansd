'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email atau password salah.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi. Cek inbox email kamu.')
        } else {
          setError('Terjadi kesalahan. Silakan coba lagi.')
        }
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Masuk Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">BantuGuruYuk — Panel Sekolah</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
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
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
              Lupa Password?
            </Link>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="neo-brutal-sm w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun?{' '}
          <Link href="/b2g4y10-enroll" className="text-blue-600 font-bold hover:underline">
            Daftar dengan kode aktivasi
          </Link>
        </p>
      </div>
    </div>
  )
}
