'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { School } from '@/types'
import dynamic from 'next/dynamic'

type Props = {
  school: School
  total: number
  lulus: number
  tdkLulus: number
  countdownDate: string
}

const StudentsModal = dynamic(() => import('./modals/StudentsModal'))
const SettingsModal = dynamic(() => import('./modals/SettingsModal'))
const UploadModal   = dynamic(() => import('./modals/UploadModal'))

export default function DashboardPageClient({ school, total, lulus, tdkLulus, countdownDate }: Props) {
  const router  = useRouter()
  const isDemo  = school.is_demo === true
  const [openModal, setOpenModal] = useState<'students' | 'settings' | 'upload' | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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

      {/* Salin Link */}
      <div className="neo-brutal rounded-2xl bg-blue-600 p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black uppercase tracking-wider">Link Pengumuman</h2>
          <span className="text-lg">🔗</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-700/50 rounded-xl p-1 pl-3 border border-blue-400/30">
          <input
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${school?.slug}`}
            className="bg-transparent text-sm font-medium flex-1 outline-none py-2 overflow-hidden text-ellipsis whitespace-nowrap text-blue-50"
          />
          <button
            onClick={() => {
              const url = `${window.location.origin}/${school?.slug}`
              navigator.clipboard.writeText(url)
              alert('Link berhasil disalin!')
            }}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-black hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Salin
          </button>
        </div>
        <p className="text-[11px] mt-3 font-bold text-blue-100 flex items-center gap-1.5 opacity-90">
          📢 Bagikan alamat ini ke siswa untuk mengecek pengumuman kelulusan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     val: total,    color: 'bg-white',   text: 'text-blue-600'  },
          { label: 'Lulus',     val: lulus,    color: 'bg-white', text: 'text-green-600' },
          { label: 'Tdk Lulus', val: tdkLulus, color: 'bg-white',     text: 'text-red-600'   },
        ].map(({ label, val, color, text }) => (
          <div key={label} className={`neo-brutal-sm rounded-xl p-4 text-center border-2 border-gray-900 ${color}`}>
            <p className={`text-3xl font-black ${text}`}>{val}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Countdown */}
      <div className="neo-brutal rounded-2xl bg-yellow-50 p-4 border-2 border-yellow-300">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">⏰ Jadwal Pengumuman</p>
        <p className="font-black text-gray-900">{countdownDate}</p>
      </div>

      {/* Aksi Cepat */}
      <div className="neo-brutal rounded-2xl bg-white p-4">
        <p className="font-black text-gray-700 text-sm mb-3">⚡ Aksi Cepat</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setOpenModal('students')}
            className="neo-brutal-sm rounded-xl px-4 py-3 font-bold text-sm text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            ➕ Tambah Siswa
          </button>
          <button onClick={() => setOpenModal('upload')}
            className="neo-brutal-sm rounded-xl px-4 py-3 font-bold text-sm text-center bg-green-600 text-white hover:bg-green-700 transition-colors">
            📥 Upload Excel Data Siswa
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

      {/* Testing Hint */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl">🧪</span>
        <div>
          <p className="text-xs font-bold text-blue-800">
            Ingin menguji tampilan pengumuman?
          </p>
          <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
            Ubah countdown ke tanggal/waktu yang sudah lewat di menu <strong>Pengaturan</strong> agar tombol cek NISN aktif.
          </p>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 mb-6 text-center space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Butuh bantuan?</p>
        <div className="flex flex-col items-center gap-4">
          <a 
            href="https://wa.me/6289530713597?text=Halo%20Pak%20Choy%2C%20saya%20butuh%20bantuan%20terkait%20dashboard%20kelulusan%20SD"
            target="_blank"
            className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba56] text-white font-black px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-200 w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            </svg>
            Hubungi Pak Choyy via WA
          </a>

          <div className="space-y-4 w-full">
            <a 
              href="https://chat.whatsapp.com/I1Y7gcRSqNpBIMlU4P1MJd"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200 w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Gabung Grup Komunitas
            </a>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
              Gabung komunitas pengguna aplikasi Bantu Guru Yuk. Saling bantu kurangi<br />
              beban administrasi sekolah dan bebas usul ide fitur baru.
            </p>
          </div>
        </div>
      </div>


      {/* Modals */}
      {openModal === 'students' && <StudentsModal schoolId={school.id} onClose={handleClose} />}
      {openModal === 'settings' && <SettingsModal school={school} onClose={handleClose} />}
      {openModal === 'upload'   && <UploadModal schoolId={school.id} onClose={handleClose} />}
    </div>
  )
}
