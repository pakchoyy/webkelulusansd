'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { School } from '@/types'
import Modal from './Modal'

export default function SettingsModal({ school, onClose }: { school: School; onClose: () => void }) {
  const supabase = createClient()
  const isDemo   = school.is_demo === true

  const [namaSekolah, setNamaSekolah]   = useState(school.nama_sekolah)
  const [tahunAjaran, setTahunAjaran]   = useState(school.tahun_ajaran)
  const [heroTitle, setHeroTitle]       = useState(school.hero_title)
  const [batchLabel, setBatchLabel]     = useState(school.batch_label)
  const [themePrimary, setThemePrimary] = useState(school.theme_primary || '#2563eb')

  const DEFAULT_DATE = '2026-06-02'
  const DEFAULT_TIME = '07:00'
  // Fix: parse countdown_at dengan timezone WIB
  const cdDate = school.countdown_at
    ? new Date(school.countdown_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    : DEFAULT_DATE
  const cdTime = school.countdown_at
    ? new Date(school.countdown_at).toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
    : DEFAULT_TIME
  const [countdownDate, setCountdownDate] = useState(cdDate)
  const [countdownTime, setCountdownTime] = useState(cdTime)
  const [logoFile, setLogoFile]     = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(school.logo_url)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const PRESET_COLORS = [
    { hex: '#2563eb', label: 'Biru' },
    { hex: '#16a34a', label: 'Hijau' },
    { hex: '#dc2626', label: 'Merah' },
    { hex: '#9333ea', label: 'Ungu' },
    { hex: '#ea580c', label: 'Oranye' },
    { hex: '#0891b2', label: 'Cyan' },
    { hex: '#be185d', label: 'Pink' },
    { hex: '#854d0e', label: 'Coklat' },
  ]

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 1024 * 1024) { setMsg('❌ Logo max 1MB'); return }
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    let logoUrl = school.logo_url

    if (logoFile && !isDemo) {
      const ext  = logoFile.name.split('.').pop()
      const path = `${school.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos').upload(path, logoFile, { upsert: true, contentType: logoFile.type })
      if (uploadError) { setMsg('❌ Gagal upload logo: ' + uploadError.message); setSaving(false); return }
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      logoUrl = `${data.publicUrl}?t=${Date.now()}`
    }

    // Fix: paksa +07:00 agar tersimpan sebagai WIB
    const countdownAt = countdownDate && countdownTime
      ? new Date(`${countdownDate}T${countdownTime}:00+07:00`).toISOString()
      : school.countdown_at

    const updatePayload = isDemo ? {
      tahun_ajaran:  tahunAjaran.trim(),
      hero_title:    heroTitle.trim(),
      batch_label:   batchLabel.trim(),
      theme_primary: themePrimary,
      countdown_at:  countdownAt,
    } : {
      nama_sekolah:  namaSekolah.trim(),
      tahun_ajaran:  tahunAjaran.trim(),
      hero_title:    heroTitle.trim(),
      batch_label:   batchLabel.trim(),
      theme_primary: themePrimary,
      countdown_at:  countdownAt,
      logo_url:      logoUrl,
    }

    const { error } = await supabase.from('schools').update(updatePayload).eq('id', school.id)
    setSaving(false)
    if (error) { setMsg('❌ ' + error.message); return }
    setMsg('✅ Tersimpan!')
    setTimeout(onClose, 1200)
  }

  return (
    <Modal title="⚙️ Pengaturan Sekolah" onClose={onClose}>

      {isDemo && (
        <div className="mb-4 rounded-xl bg-yellow-50 border-2 border-yellow-300 p-3 flex items-start gap-2">
          <span className="text-lg flex-shrink-0">🔒</span>
          <div>
            <p className="text-xs font-black text-yellow-800">Mode Demo</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Nama sekolah & alamat web dikunci. Field lain bisa dicoba bebas.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3">

        {!isDemo && (
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-2">Logo Sekolah</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full neo-brutal-sm bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                {logoPreview
                  ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                  : <span className="text-xl">🎓</span>}
              </div>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange}
                className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold hover:file:bg-blue-100 cursor-pointer" />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">
            Nama Sekolah {isDemo && <span className="text-yellow-600 font-normal ml-1">🔒 dikunci</span>}
          </label>
          <input
            value={namaSekolah}
            onChange={e => setNamaSekolah(e.target.value)}
            disabled={isDemo}
            placeholder="SDN 1 Nusantara"
            className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
              isDemo
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 focus:border-blue-400'
            }`}
          />
        </div>

        {[
          { label: 'Tahun Ajaran',  val: tahunAjaran, set: setTahunAjaran, placeholder: '2025/2026' },
          { label: 'Judul Halaman', val: heroTitle,   set: setHeroTitle,   placeholder: 'Pengumuman Kelulusan' },
          { label: 'Label Angkatan',val: batchLabel,  set: setBatchLabel,  placeholder: 'Angkatan 2025/2026' },
        ].map(({ label, val, set, placeholder }) => (
          <div key={label}>
            <label className="text-xs font-bold text-gray-600 block mb-1">{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        ))}

        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">📅 Tanggal & Waktu Pengumuman</label>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={countdownDate} onChange={e => setCountdownDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            <input type="time" value={countdownTime} onChange={e => setCountdownTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Default: 2 Juni 2026, 07:00</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 block mb-2">🎨 Warna Tema</label>
          <div className="rounded-xl p-3 mb-2 border-2 border-gray-100"
            style={{ background: `linear-gradient(135deg, ${themePrimary}, ${themePrimary}dd)` }}>
            <p className="text-white text-xs font-bold text-center opacity-80">Preview kotak "Cek Hasil Kelulusan"</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="color" value={themePrimary} onChange={e => setThemePrimary(e.target.value)}
              className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
            <span className="font-mono text-xs text-gray-500">{themePrimary}</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button key={c.hex} type="button" onClick={() => setThemePrimary(c.hex)} title={c.label}
                className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform ${
                  themePrimary === c.hex ? 'border-gray-900 scale-110' : 'border-gray-300'
                }`} style={{ background: c.hex }} />
            ))}
          </div>
        </div>

        {msg && <p className="font-bold text-sm">{msg}</p>}
        <button type="submit" disabled={saving}
          className="neo-brutal-sm w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </Modal>
  )
}
