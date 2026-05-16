'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School, Student } from '@/types'

type Props = { school: School; studentCount: number }

export default function PublicPageClient({ school, studentCount }: Props) {
  const supabase = createClient()
  const [nisn, setNisn] = useState('')
  const [result, setResult] = useState<Student | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00', passed: false })
  const confettiRef = useRef<HTMLDivElement[]>([])
  const confettiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function tick() {
      const target = new Date(school.countdown_at).getTime()
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) { setCountdown(c => ({ ...c, passed: true })); return }
      setCountdown({
        days:  String(Math.floor(diff / 86400000)).padStart(2,'0'),
        hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0'),
        mins:  String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0'),
        secs:  String(Math.floor((diff % 60000) / 1000)).padStart(2,'0'),
        passed: false
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [school.countdown_at])

  // Spawn satu gelombang confetti (50 piece)
  const spawnWave = useCallback(() => {
    const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#06b6d4']
    const shapes = ['50%', '0', '50% 0']
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        // Jangan spawn kalau sudah di-close
        if (!document.getElementById('result-popup')) return
        const el = document.createElement('div')
        el.style.cssText = `
          position:fixed; z-index:9999; pointer-events:none;
          width:${8 + Math.random()*8}px; height:${8 + Math.random()*8}px;
          left:${Math.random()*100}vw; top:-20px;
          background:${colors[Math.floor(Math.random()*colors.length)]};
          border-radius:${shapes[Math.floor(Math.random()*shapes.length)]};
          animation:confetti-fall ${4 + Math.random()*2}s linear forwards;
          transform:rotate(${Math.random()*360}deg);
        `
        document.body.appendChild(el)
        confettiRef.current.push(el)
        setTimeout(() => {
          el.remove()
          confettiRef.current = confettiRef.current.filter(e => e !== el)
        }, 6000)
      }, i * 30)
    }
  }, [])

  // Mulai confetti terus menerus — gelombang setiap 2 detik
  const startConfetti = useCallback(() => {
    spawnWave()
    confettiIntervalRef.current = setInterval(spawnWave, 2000)
  }, [spawnWave])

  function clearConfetti() {
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current)
      confettiIntervalRef.current = null
    }
    confettiRef.current.forEach(el => el.remove())
    confettiRef.current = []
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!nisn.trim() || !countdown.passed) return
    setLoading(true); setNotFound(false); setResult(null)

    const { data } = await supabase
      .from('students').select('*')
      .eq('school_id', school.id).eq('nisn', nisn.trim()).single()

    setLoading(false)
    if (!data) { setNotFound(true) }
    else { setResult(data); setShowResult(true); if (data.status === 'LULUS') startConfetti() }
  }

  function closeResult() {
    clearConfetti()
    setShowResult(false); setResult(null)
  }

  const primary = school.theme_primary || '#2563eb'

  return (
    <div className="min-h-screen w-full overflow-auto relative pb-20" style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f3f4f6 100%)',
    }}>
      <div className="glow-circle w-64 h-64 bg-blue-400 top-0 right-0" style={{opacity:0.2}} />
      <div className="glow-circle w-48 h-48 bg-yellow-300 bottom-20 left-0" style={{opacity:0.2}} />

      {/* HERO */}
      <section className="relative z-10 px-4 pt-10 pb-6 text-center max-w-lg mx-auto">
        <div className="mx-auto w-24 h-24 rounded-full neo-brutal flex items-center justify-center mb-4 float-anim overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}>
          {school.logo_url
            ? <img src={school.logo_url} alt="logo" className="w-full h-full object-cover" />
            : <span className="text-4xl">🎓</span>}
        </div>
        <h1 className="text-lg font-bold text-gray-700 mb-1">{school.nama_sekolah}</h1>
        <div className="inline-block px-3 py-1 rounded-full neo-brutal-sm bg-yellow-300 text-xs font-bold mb-3">
          🎓 {school.batch_label}
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{school.hero_title}</h2>
        <p className="text-gray-500 font-medium mb-5">Tahun Ajaran {school.tahun_ajaran}</p>

        {/* Countdown */}
        <div className="neo-brutal rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-400 p-5 mb-5">
          {countdown.passed ? (
            <p className="text-center font-black text-gray-900 text-lg">🎉 Pengumuman Sudah Dibuka!</p>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">⏰ Pengumuman Dimulai</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: countdown.days, label: 'Hari' },
                  { val: countdown.hours, label: 'Jam' },
                  { val: countdown.mins, label: 'Menit' },
                  { val: countdown.secs, label: 'Detik' },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-gray-900 text-white rounded-xl p-3 text-center">
                    <span className="text-2xl font-black">{val}</span>
                    <p className="text-[10px] mt-1 opacity-60">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="text-center mb-4">
          <p className="text-base font-bold text-gray-600 mb-2">📊 Total Siswa {school.batch_label}</p>
          <p className="text-8xl font-black" style={{ color: primary }}>{studentCount}</p>
          <p className="text-gray-500 font-medium">{school.nama_sekolah}</p>
        </div>
      </section>

      <div className="relative z-10 h-1 my-6 max-w-lg mx-auto rounded-full mx-4"
        style={{ background: `linear-gradient(90deg, ${primary}, ${primary}55, ${primary})` }} />

      {/* CEK NISN */}
      <section className="relative z-10 px-4 py-6 max-w-lg mx-auto">
        <div className="neo-brutal rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}>
          <h3 className="text-lg font-bold mb-1 text-center text-white">🔍 Cek Hasil Kelulusan</h3>

          {!countdown.passed ? (
            <div className="mt-3 text-center p-4 rounded-xl bg-white/20 border-2 border-white/30">
              <p className="text-white font-bold">🔒 Pengumuman belum dibuka</p>
              <p className="text-blue-100 text-sm mt-1">Tunggu hingga countdown selesai</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-blue-100 text-center mb-4">Masukkan NISN untuk melihat hasil</p>
              <form onSubmit={handleCheck} className="space-y-3">
                <input type="text" value={nisn} onChange={e => setNisn(e.target.value)}
                  placeholder="Masukkan NISN..." maxLength={20}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-400 font-medium text-center text-lg focus:outline-none focus:border-blue-200 bg-blue-50 text-gray-900" />
                <button type="submit" disabled={loading}
                  className="neo-brutal-sm rounded-xl bg-white text-blue-600 font-bold px-6 py-3 w-full hover:bg-blue-50 transition-colors disabled:opacity-60">
                  {loading ? 'Mencari...' : '🔍 Cek Sekarang'}
                </button>
              </form>
              {notFound && (
                <div className="mt-4 text-center p-4 rounded-xl bg-red-100 border-2 border-red-300">
                  <p className="text-red-700 font-semibold">❌ NISN tidak ditemukan</p>
                  <p className="text-red-600 text-sm mt-1">Periksa kembali NISN Anda</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Tombol Admin — kiri bawah, WAJIB login dulu */}
      <a href="/login"
        className="fixed bottom-5 left-5 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full neo-brutal bg-gray-900 text-white hover:bg-gray-700 transition-colors text-xs font-bold"
        title="Login Admin">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Admin
      </a>

      {/* RESULT POPUP */}
      {showResult && result && (
        <div id="result-popup" className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="scale-in neo-brutal rounded-3xl bg-gradient-to-br from-blue-400 via-blue-300 to-blue-500 p-6 max-w-sm w-full text-center relative overflow-hidden">
            <button onClick={closeResult}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center font-black text-gray-700 text-lg transition-colors">
              ✕
            </button>
            <div className={`absolute top-0 left-0 right-0 h-2 ${result.status === 'LULUS' ? 'bg-green-500' : 'bg-red-500'}`} />

            <div className="w-20 h-20 mx-auto rounded-full neo-brutal-sm bg-white overflow-hidden flex items-center justify-center mb-4 mt-3 text-3xl">
              {school.logo_url ? (
                <img src={school.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span>🎓</span>
              )}
            </div>
            <h3 className="text-xl font-black text-white mb-1">{result.nama}</h3>
            <p className="text-sm text-blue-100 font-medium mb-1">Kelas {result.kelas}</p>
            <p className="text-sm text-white/90 font-bold mb-3">{school.nama_sekolah}</p>

            <div className={`inline-block px-5 py-2 rounded-full neo-brutal-sm font-black text-lg mb-4 ${
              result.status === 'LULUS' ? 'bg-green-400 text-gray-900' : 'bg-red-400 text-white'
            }`}>
              {result.status === 'LULUS' ? '✅ LULUS' : '❌ TIDAK LULUS'}
            </div>

            {result.pesan && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border-2 border-yellow-300 mb-4 text-left">
                <p className="text-xs text-yellow-600 font-bold mb-1">💌 Pesan Motivasi</p>
                <p className="text-sm text-orange-700 font-medium italic">"{result.pesan}"</p>
              </div>
            )}

            <button onClick={() => window.print()}
              className="neo-brutal-sm rounded-xl bg-white text-blue-600 font-bold px-5 py-3 w-full hover:bg-blue-50 transition-colors">
              🖨️ CETAK HASIL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
