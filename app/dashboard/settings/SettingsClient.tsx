'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School } from '@/types'

export default function SettingsClient({ school }: { school: School }) {
  const supabase = createClient()

  const [namaSekolah, setNamaSekolah]   = useState(school.nama_sekolah)
  const [tahunAjaran, setTahunAjaran]   = useState(school.tahun_ajaran)
  const [heroTitle, setHeroTitle]       = useState(school.hero_title)
  const [batchLabel, setBatchLabel]     = useState(school.batch_label)
  const [themePrimary, setThemePrimary] = useState(school.theme_primary)

  // Fix: parse countdown_at dengan timezone WIB
  const cdDate = school.countdown_at
    ? new Date(school.countdown_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    : ''
  const cdTime = school.countdown_at
    ? new Date(school.countdown_at).toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
    : '08:00'
  const [countdownDate, setCountdownDate] = useState(cdDate)
  const [countdownTime, setCountdownTime] = useState(cdTime)

  const [logoFile, setLogoFile]       = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(school.logo_url)
  const [saving, setSaving]           = useState(false)
  const [msg, setMsg]                 = useState('')

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 1024 * 1024) { setMsg('❌ Logo max 1MB'); return }
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    let logoUrl = school.logo_url

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${school.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, logoFile, { upsert: true, contentType: logoFile.type })

      if (uploadError) {
        setMsg('❌ Gagal upload logo: ' + uploadError.message)
        setSaving(false)
        return
      }

      logoUrl = supabase.storage.from('logos').getPublicUrl(path).data.publicUrl
    }

    // Fix: paksa +07:00 agar tersimpan sebagai WIB bukan UTC
    const countdownAt = countdownDate && countdownTime
      ? new Date(`${countdownDate}T${countdownTime}:00+07:00`).toISOString()
      : school.countdown_at

    const { error } = await supabase
      .from('schools')
      .update({
        nama_sekolah:  namaSekolah.trim(),
        tahun_ajaran:  tahunAjaran.trim(),
        hero_title:    heroTitle.trim(),
        batch_label:   batchLabel.trim(),
        theme_primary: themePrimary,
        countdown_at:  countdownAt,
        logo_url:      logoUrl,
      })
      .eq('id', school.id)

    setSaving(false)
    setMsg(error ? '❌ Gagal: ' + error.message : '✅ Pengaturan disimpan!')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="neo-brutal rounded-2xl bg-white p-5">
      <h2 className="font-black text-gray-900 mb-5">⚙️ Pengaturan Sekolah</h2>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Logo */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-2">Logo Sekolah</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full neo-brutal-sm bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {logoPreview
                ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-2xl">🎓</span>}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold file:text-xs hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Max 1MB. PNG/JPG/WebP.</p>
        </div>

        {/* Nama Sekolah */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Nama Sekolah</label>
          <input
            value={namaSekolah}
            onChange={e => setNamaSekolah(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Tahun Ajaran */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Tahun Ajaran</label>
          <input
            value={tahunAjaran}
            onChange={e => setTahunAjaran(e.target.value)}
            placeholder="2025/2026"
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Hero Title */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Judul Halaman</label>
          <input
            value={heroTitle}
            onChange={e => setHeroTitle(e.target.value)}
            placeholder="Pengumuman Kelulusan"
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Batch Label */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Label Angkatan</label>
          <input
            value={batchLabel}
            onChange={e => setBatchLabel(e.target.value)}
            placeholder="Angkatan 2025/2026"
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Countdown */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Tanggal & Waktu Pengumuman</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={countdownDate}
              onChange={e => setCountdownDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="time"
              value={countdownTime}
              onChange={e => setCountdownTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Warna Tema */}
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Warna Tema</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={themePrimary}
              onChange={e => setThemePrimary(e.target.value)}
              className="w-12 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5"
            />
            <span className="font-mono text-sm text-gray-600">{themePrimary}</span>
            <div className="flex gap-2">
              {['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setThemePrimary(c)}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* URL Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-600 font-bold mb-1">🔗 URL Halaman Publik</p>
          <p className="font-mono text-sm text-blue-800 font-bold break-all">
            {typeof window !== 'undefined' ? window.location.origin : 'https://kelulusan.vercel.app'}/{school.slug}
          </p>
          <p className="text-xs text-blue-500 mt-1">Slug tidak bisa diubah setelah daftar</p>
        </div>

        {msg && <p className="font-bold text-sm">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="neo-brutal-sm w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  )
}
