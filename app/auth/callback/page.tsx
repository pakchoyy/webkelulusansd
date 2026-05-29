'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        setStatus('error')
        setErrorMessage(errorDescription || 'Terjadi kesalahan saat verifikasi.')
        return
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          setStatus('error')
          setErrorMessage('Link reset password tidak valid atau sudah expired.')
        } else {
          setStatus('success')
          setTimeout(() => {
            router.push('/auth/update-password')
          }, 2000)
        }
      } else {
        setStatus('error')
        setErrorMessage('Parameter tidak valid.')
      }
    }

    handleCallback()
  }, [searchParams, supabase, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">Memverifikasi...</h1>
            <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">Verifikasi Berhasil!</h1>
            <p className="text-sm text-gray-500 mt-2">Mengarahkan ke halaman update password...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">Verifikasi Gagal</h1>
            <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
            <Link
              href="/auth/forgot-password"
              className="inline-block mt-4 neo-brutal-sm bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="neo-brutal rounded-2xl bg-white p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full neo-brutal bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Memuat...</h1>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}