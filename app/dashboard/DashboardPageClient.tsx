'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { School } from '@/types'

type Props = {
  school: School
  total: number
  lulus: number
  tdkLulus: number
  countdownDate: string
}

import dynamic from 'next/dynamic'
const StudentsModal = dynamic(() => import('./modals/StudentsModal'))
const SettingsModal = dynamic(() => import('./modals/SettingsModal'))
const UploadModal   = dynamic(() => import('./modals/UploadModal'))

export default function DashboardPageClient({ school, total, lulus, tdkLulus, countdownDate }: Props) {
  const router  = useRouter()
  const isDemo  = school.is_demo === true
  const [openModal, setOpenModal] = useState<'students' | 'settings' | 'upload' | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${school?.slug}`
    : `/${school?.slug}`

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleClose() {
    setOpenModal(null)
    router.refresh()
  }

  function handleRefresh() {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="space-y-4">

      {/* Banner Demo */}
      {isDemo && (
        <div className="neo-brutal rounded-2xl bg-yellow-300 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🧪</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-sm">Anda sedang di Mode Demo</p>
              <p className="text-xs text-gray-700 mt-0.5">
                Nama sekolah & alamat web dikunci. Fitur lain bisa dicoba bebas!
              </p>
            </div>
            <a
              href="https://wa.me/6289530713597?text=Halo%20Pak%20Choy%2C%20saya%20tertarik%20beli%20akun%20setelah%20coba%20demo"
              target="_blank"
              className="flex-shrink-0 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Beli Sekarang
            </a>
          </div>
        </div>
      )}

      {/* Hint Refresh */}
      <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-3">
        <span className="text-xl">💡</span>
        <p className="text-xs text-amber-800 font-medium flex-1">
          Data baru belum tampil? Klik refresh untuk memuat ulang.
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-amber-900 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={refreshing ? 'animate-spin' : ''}>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
          {refreshing ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {/* Header */}
      <div className="neo-brutal rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-0.5">Dashboard</p>
            <h1 className="text-lg font-black leading-tight">{school?.nama_sekolah}</h1>
          </div>
          <a href={`/${school?.slug}`} target="_blank"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-2 rounded-xl text-xs font-bold text-white border border-white/30">
            Web Pengumuman
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7l10 10M7 17V7h10"/>
            </svg>
          </a>
        </div>

        {/* URL Slug + Tombol Salin */}
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
          <span className="text-blue-100 text-xs flex-1 truncate font-mono">{publicUrl}</span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors px-2.5 py-1.5 rounded-lg text-xs font-bold text-white"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Tersalin!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Salin
              </>
            )}
          </button>
        </div>

        {/* Hint bagikan ke siswa */}
        <p className="text-blue-200 text-xs mt-2">
          📢 Bagikan alamat ini ke siswa untuk mengecek pengumuman kelulusan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     val: total,    color: 'bg-blue-50 border-blue-200',   text: 'text-blue-700'  },
          { label: 'Lulus',     val: lulus,    color: 'bg-green-50 border-green-200', text: 'text-green-700' },
          { label: 'Tdk Lulus', val: tdkLulus, color: 'bg-red-50 border-red-200',     text: 'text-red-700'   },
        ].map(({ label, val, color, text }) => (
          <div key={label} className={`neo-brutal-sm rounded-xl p-4 text-center border-2 ${color}`}>
            <p className={`text-3xl font-black ${text}`}>{val}</p>
            <p className="text-xs font-bold text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Countdown */}
      <div className="neo-brutal rounded-2xl bg-yellow-50 p-4 border-2 border-yellow-300">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">⏰ Jadwal Pengumuman</p>
        <p className="font-black text-gray-900">{countdownDate}</p>
      </div>

      {/* Aksi Cepat */}
      <div className="neo-brutal rounded-2xl bg-white p-4">
        <p className="font-bold text-gray-700 mb-3">⚡ Aksi Cepat</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setOpenModal('students')}
            className="neo-brutal-sm rounded-xl px-4 py-3 font-bold text-sm text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            ➕ Tambah Siswa
          </button>
          <button onClick={() => setOpenModal('upload')}
            className="neo-brutal-sm rounded-xl px-4 py-3 font-bold text-sm text-center bg-green-600 text-white hover:bg-green-700 transition-colors">
            📥 Upload Excel
          </button>
          <button onClick={() => setOpenModal('settings')}
            className="neo-brutal-sm rounded-xl px-4 py-3 font-bold text-sm text-center bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">
            ⚙️ Pengaturan
          </button>
          <a href={`/${school?.slug}`} target="_blank"
            className="neo-brutal-sm rounded-xl px-4 py-3 font-bold text-sm text-center bg-yellow-300 text-gray-900 hover:bg-yellow-400 transition-colors">
            🌐 Web Pengumuman
          </a>
        </div>
      </div>

      {/* Hint uji coba countdown */}
      <div className="flex items-start gap-3 bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 py-3">
        <span className="text-lg flex-shrink-0">🧪</span>
        <p className="text-xs text-blue-700 font-medium">
          Ingin menguji tampilan pengumuman? Ubah countdown ke tanggal/waktu yang sudah lewat di menu <strong>Pengaturan</strong>.
        </p>
      </div>

      {/* Tombol Bantuan WA */}
      <div className="pt-2 pb-1 text-center">
        <p className="text-xs text-gray-400 mb-2">Butuh bantuan?</p>
        <a href="https://wa.me/6289530713597" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Hubungi Pak Choyy via WA
        </a>
      </div>

      {/* Modals */}
      {openModal === 'students' && <StudentsModal schoolId={school.id} onClose={handleClose} />}
      {openModal === 'settings' && <SettingsModal school={school} onClose={handleClose} />}
      {openModal === 'upload'   && <UploadModal schoolId={school.id} onClose={handleClose} />}
    </div>
  )
}
