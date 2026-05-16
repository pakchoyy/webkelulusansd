'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<'code' | 'form'>('code')
  const [activationCode, setActivationCode] = useState(searchParams.get('code') || '')

  const [namaSekolah, setNamaSekolah] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkCode() {
    setLoading(true)
    setError('')
    const { data } = await supabase
      .from('activation_codes')
      .select('id, used')
      .eq('code', activationCode.trim().toUpperCase())
      .single()

    setLoading(false)
    if (!data) return setError('Kode aktivasi tidak ditemukan.')
    if (data.used) return setError('Kode aktivasi sudah digunakan.')
    setStep('form')
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message || 'Gagal membuat akun.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    const res = await fetch('/api/register-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        namaSekolah: namaSekolah.trim(),
        slug: slug.trim(),
        email: email.trim(),
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      setError(result.error || 'Gagal menyimpan data sekolah.')
      setLoading(false)
      return
    }

    await supabase
      .from('activation_codes')
      .update({ used: true, used_by: userId, used_at: new Date().toISOString() })
      .eq('code', activationCode.trim().toUpperCase())

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
      <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Daftar Sekolah</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan kode aktivasi dari BGY</p>
        </div>

        {step === 'code' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Kode Aktivasi</label>
              <input
                type="text"
                value={activationCode}
                onChange={e => setActivationCode(e.target.value.toUpperCase())}
                placeholder="BGY-XXXX"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-center font-mono font-bold tracking-widest focus:outline-none focus:border-yellow-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button
              onClick={checkCode}
              disabled={loading || !activationCode}
              className="neo-brutal-sm w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-60"
            >
              {loading ? 'Memeriksa...' : 'Validasi Kode'}
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 text-center">
              <p className="text-green-700 font-bold text-sm">✅ Kode valid! Lengkapi data sekolah.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Nama Sekolah</label>
              <input
                type="text"
                value={namaSekolah}
                onChange={e => {
                  setNamaSekolah(e.target.value)
                  setSlug(generateSlug(e.target.value))
                }}
                placeholder="SD Negeri 1 Nusantara"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Slug URL</label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="sdn1-nusantara"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                umuminsd.vercel.app/<strong className="text-blue-600">{slug || 'slug-sekolah'}</strong>
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@sekolah.com"
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
                placeholder="Min. 6 karakter"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="neo-brutal-sm w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Masuk
          </Link>
        </p>

        {/* Tombol Bantuan WA */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-4">
          <p className="text-xs text-gray-400">Butuh bantuan?</p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://wa.me/6289530713597"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi Pak Choyy via WA
            </a>

            <div className="space-y-2">
              <a 
                href="https://chat.whatsapp.com/I1Y7gcRSqNpBIMlU4P1MJd"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-blue-600 font-black hover:underline text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Gabung grup komunitas
              </a>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                Gabung komunitas pengguna aplikasi Bantu Guru Yuk. Saling bantu kurangi beban administrasi sekolah dan bebas usul ide fitur baru.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Portal Kelulusan SD</p>
          <p className="text-[10px] text-gray-400 font-bold">
            © 2026 Bantu Guru Yuk by <a href="https://tiktok.com/@pak.choyy" target="_blank" className="underline hover:text-blue-600 font-black">pak.choyy</a> • v 26.5.4
          </p>
        </footer>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
