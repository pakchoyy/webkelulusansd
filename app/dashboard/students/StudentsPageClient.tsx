'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Student } from '@/types'

const DEFAULT_MESSAGES = [
  'Masa depanmu penuh dengan kemungkinan tak terbatas, percayalah pada dirimu.',
  'Kerja keras dan dedikasi adalah investasi terbaik untuk kesuksesanmu.',
  'Setiap langkah yang kau ambil hari ini akan membentuk masa depan yang cerah.',
  'Teruslah bermimpi besar dan bekerja keras untuk mewujudkannya.',
  'Kamu memiliki potensi luar biasa, gunakan dengan bijak.',
]

import dynamic from 'next/dynamic'
const UploadModal = dynamic(() => import('../modals/UploadModal'))

export default function StudentsPageClient({ initialStudents, schoolId }: {
  initialStudents: Student[]; schoolId: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')
  const [editStudent, setEditStudent] = useState<Student | null>(null)

  const sklInputRef = useRef<HTMLInputElement>(null)
  const [uploadingSklFor, setUploadingSklFor] = useState<string | null>(null)
  const [successUploadedName, setSuccessUploadedName] = useState<string | null>(null)
  const [showDeleteConfirmFor, setShowDeleteConfirmFor] = useState<{ id: string; name: string; url: string } | null>(null)
  const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] = useState<{ id: string; name: string } | null>(null)
  const [successDeletedName, setSuccessDeletedName] = useState<string | null>(null)

  function triggerSklUpload(studentId: string) {
    setUploadingSklFor(studentId)
    setTimeout(() => {
      sklInputRef.current?.click()
    }, 50)
  }

  async function handleSklFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !uploadingSklFor) return

    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 3MB')
      setUploadingSklFor(null)
      if (sklInputRef.current) sklInputRef.current.value = ''
      return
    }

    const studentId = uploadingSklFor
    setLoading(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `${schoolId}/${studentId}_skl.${ext}`

      // Upload file to Supabase storage 'skls' bucket
      const { error: uploadError } = await supabase.storage
        .from('skls')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        alert('Gagal mengunggah file SKL: ' + uploadError.message)
        setLoading(false)
        setUploadingSklFor(null)
        if (sklInputRef.current) sklInputRef.current.value = ''
        return
      }

      const sklUrl = supabase.storage.from('skls').getPublicUrl(path).data.publicUrl

      // Update skl_url field in the database
      const { error: dbError } = await supabase.from('students')
        .update({ skl_url: sklUrl })
        .eq('id', studentId)
        .eq('school_id', schoolId)

      if (dbError) {
        alert('Gagal memperbarui link SKL di database: ' + dbError.message)
      } else {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, skl_url: sklUrl } : s))
        const std = students.find(s => s.id === studentId)
        setSuccessUploadedName(std ? std.nama : 'Siswa')
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setLoading(false)
      setUploadingSklFor(null)
      if (sklInputRef.current) sklInputRef.current.value = ''
    }
  }

  async function executeDeleteSkl(studentId: string, sklUrl: string, studentName: string) {
    setLoading(true)
    setShowDeleteConfirmFor(null)

    try {
      const urlParts = sklUrl.split('/skls/')
      if (urlParts.length > 1) {
        const path = urlParts[1]
        await supabase.storage.from('skls').remove([path])
      }

      const { error: dbError } = await supabase.from('students')
        .update({ skl_url: null })
        .eq('id', studentId)
        .eq('school_id', schoolId)

      if (dbError) {
        alert('Gagal menghapus link SKL dari database: ' + dbError.message)
      } else {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, skl_url: null } : s))
        setSuccessDeletedName(studentName)
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat menghapus SKL: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const [nisn, setNisn]     = useState('')
  const [nama, setNama]     = useState('')
  const [kelas, setKelas]   = useState('VI')
  const [status, setStatus] = useState<'LULUS' | 'TIDAK LULUS'>('LULUS')
  const [pesan, setPesan]   = useState('')

  function fillEdit(s: Student) {
    setEditStudent(s); setNisn(s.nisn); setNama(s.nama)
    setKelas(s.kelas); setStatus(s.status); setPesan(s.pesan)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function resetForm() { setEditStudent(null); setNisn(''); setNama(''); setKelas('VI'); setStatus('LULUS'); setPesan('') }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const finalPesan = pesan || DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)]

    if (editStudent) {
      const { error } = await supabase.from('students')
        .update({ nisn: nisn.trim(), nama: nama.trim(), kelas: kelas.trim(), status, pesan: finalPesan })
        .eq('id', editStudent.id).eq('school_id', schoolId)
      setLoading(false)
      if (error) { setMsg('❌ ' + error.message); return }
      setStudents(prev => prev.map(s => s.id === editStudent.id
        ? { ...s, nisn: nisn.trim(), nama: nama.trim(), kelas: kelas.trim(), status, pesan: finalPesan } : s))
      setMsg('✅ Data diperbarui!'); resetForm()
    } else {
      const { data, error } = await supabase.from('students')
        .insert({ school_id: schoolId, nisn: nisn.trim(), nama: nama.trim(), kelas: kelas.trim(), status, pesan: finalPesan })
        .select().single()
      setLoading(false)
      if (error) { setMsg(error.code === '23505' ? '❌ NISN sudah ada.' : '❌ ' + error.message); return }
      setStudents(prev => [data, ...prev]); setNisn(''); setNama(''); setPesan('')
      setMsg('✅ Siswa ditambahkan!')
    }
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteStudent(id: string, name: string) {
    setLoading(true)
    setShowDeleteStudentConfirm(null)
    await supabase.from('students').delete().eq('id', id).eq('school_id', schoolId)
    setStudents(prev => prev.filter(s => s.id !== id))
    setLoading(false)
    setMsg(`✅ Siswa "${name}" berhasil dihapus!`)
    setTimeout(() => setMsg(''), 3000)
  }

  const [showUpload, setShowUpload] = useState(false)

  const filtered = students.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search)
  )

  return (
    <div className="space-y-4 relative">
      <div className="neo-brutal rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900">
            {editStudent ? `✏️ Edit: ${editStudent.nama}` : '➕ Tambah Siswa'}
          </h2>
          {!editStudent && (
            <button
              onClick={() => setShowUpload(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-green-100"
            >
              📥 Upload Excel Data Siswa
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">NISN</label>
              <input value={nisn} onChange={e => setNisn(e.target.value)} placeholder="NISN" required
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Kelas</label>
              <input value={kelas} onChange={e => setKelas(e.target.value)} placeholder="VI-A"
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Nama Lengkap</label>
            <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama Lengkap" required
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400">
              <option value="LULUS">LULUS</option>
              <option value="TIDAK LULUS">TIDAK LULUS</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">
              Pesan Motivasi <span className="font-normal text-gray-400">— pilih salah satu, isi sendiri, atau kosong (acak)</span>
            </label>
            <input value={pesan} onChange={e => setPesan(e.target.value)} placeholder="Tulis sendiri atau pilih di bawah..."
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 mb-2" />
            <div className="space-y-1">
              {DEFAULT_MESSAGES.map((m, i) => (
                <button type="button" key={i} onClick={() => setPesan(m)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                    pesan === m ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50'
                  }`}>
                  {i+1}. {m}
                </button>
              ))}
            </div>
          </div>
          {msg && <p className="text-sm font-bold">{msg}</p>}
          <div className="flex gap-2">
            {editStudent && (
              <button type="button" onClick={resetForm}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50">
                Batal
              </button>
            )}
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl neo-brutal-sm hover:bg-blue-700 transition-colors disabled:opacity-60">
              {loading ? 'Menyimpan...' : editStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
            </button>
          </div>
        </form>
      </div>

      <div className="neo-brutal rounded-2xl bg-white p-5">
        <h2 className="font-black text-gray-900 mb-3">📋 Daftar Siswa ({students.length})</h2>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau NISN..."
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm mb-3 focus:outline-none focus:border-blue-400" />
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Belum ada data siswa</p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-auto">
            {filtered.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{s.nama}</p>
                  <p className="text-xs text-gray-400">{s.nisn} • {s.kelas} •{' '}
                    <span className={s.status === 'LULUS' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{s.status}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {/* SKL Status / Upload Button */}
                  {s.status === 'LULUS' && (
                    <div className="flex items-center gap-1.5">
                      {s.skl_url ? (
                        <>
                          <a href={s.skl_url} target="_blank" rel="noopener noreferrer" title="Lihat SKL"
                            className="bg-green-100 border-2 border-green-500 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 text-green-800 hover:bg-green-200 transition-colors neo-brutal-sm">
                            📄 Lihat SKL
                          </a>
                          <button onClick={() => setShowDeleteConfirmFor({ id: s.id, name: s.nama, url: s.skl_url! })}
                            className="bg-red-50 border-2 border-red-500 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 text-red-700 hover:bg-red-100 transition-colors neo-brutal-sm"
                            title="Hapus SKL">
                            🗑️ Hapus SKL
                          </button>
                        </>
                      ) : (
                        <button onClick={() => triggerSklUpload(s.id)} disabled={uploadingSklFor !== null || loading}
                          className="bg-blue-50 border-2 border-gray-900 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 text-blue-700 hover:bg-blue-100 transition-colors neo-brutal-sm">
                          {uploadingSklFor === s.id ? '⌛' : '📤'} Upload SKL
                        </button>
                      )}
                    </div>
                  )}

                  <button onClick={() => fillEdit(s)}
                    className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors">✏️</button>
                  <button onClick={() => setShowDeleteStudentConfirm({ id: s.id, name: s.nama })}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showUpload && <UploadModal schoolId={schoolId} onClose={() => { setShowUpload(false); router.refresh() }} />}
      <input type="file" ref={sklInputRef} onChange={handleSklFileChange} accept=".pdf,image/*" className="hidden" />

      {/* SUCCESS UPLOAD POPUP MODAL */}
      {successUploadedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="scale-in neo-brutal rounded-3xl bg-white p-6 max-w-sm w-full text-center relative border-2 border-green-500">
            <div className="w-16 h-16 mx-auto rounded-full neo-brutal bg-green-100 flex items-center justify-center mb-4 mt-2">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-xl font-black text-green-700 mb-2">Unggah Berhasil!</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Berkas SKL untuk siswa <strong className="text-blue-600">{successUploadedName}</strong> telah berhasil diunggah dan siap diunduh oleh siswa!
            </p>
            <button onClick={() => setSuccessUploadedName(null)}
              className="neo-brutal-sm rounded-xl bg-red-600 text-white font-bold px-5 py-3 w-full hover:bg-red-700 transition-all hover:scale-102 active:scale-98">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE POPUP MODAL */}
      {showDeleteConfirmFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="scale-in neo-brutal rounded-3xl bg-white p-6 max-w-sm w-full text-center relative border-2 border-red-500">
            <div className="w-16 h-16 mx-auto rounded-full neo-brutal bg-red-100 flex items-center justify-center mb-4 mt-2">
              <span className="text-3xl">🗑️</span>
            </div>
            <h3 className="text-xl font-black text-red-700 mb-2">Hapus Berkas SKL?</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas SKL untuk siswa <strong className="text-blue-600">{showDeleteConfirmFor.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirmFor(null)}
                className="flex-1 neo-brutal-sm rounded-xl bg-white text-gray-900 border-2 border-black font-bold px-4 py-3 hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button onClick={() => executeDeleteSkl(showDeleteConfirmFor.id, showDeleteConfirmFor.url, showDeleteConfirmFor.name)}
                className="flex-1 neo-brutal-sm rounded-xl bg-red-600 text-white font-bold px-4 py-3 hover:bg-red-700 transition-colors">
                Hapus Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE STUDENT POPUP MODAL */}
      {showDeleteStudentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="scale-in neo-brutal rounded-3xl bg-white p-6 max-w-sm w-full text-center relative border-2 border-red-500">
            <div className="w-16 h-16 mx-auto rounded-full neo-brutal bg-red-100 flex items-center justify-center mb-4 mt-2">
              <span className="text-3xl">🗑️</span>
            </div>
            <h3 className="text-xl font-black text-red-700 mb-2">Hapus Siswa?</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus siswa <strong className="text-blue-600">{showDeleteStudentConfirm.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteStudentConfirm(null)}
                className="flex-1 neo-brutal-sm rounded-xl bg-white text-gray-900 border-2 border-black font-bold px-4 py-3 hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button onClick={() => deleteStudent(showDeleteStudentConfirm.id, showDeleteStudentConfirm.name)}
                className="flex-1 neo-brutal-sm rounded-xl bg-red-600 text-white font-bold px-4 py-3 hover:bg-red-700 transition-colors">
                Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS DELETE SKL POPUP MODAL */}
      {successDeletedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="scale-in neo-brutal rounded-3xl bg-white p-6 max-w-sm w-full text-center relative border-2 border-red-500">
            <div className="w-16 h-16 mx-auto rounded-full neo-brutal bg-red-100 flex items-center justify-center mb-4 mt-2">
              <span className="text-3xl">🗑️</span>
            </div>
            <h3 className="text-xl font-black text-red-700 mb-2">Dihapus!</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Berkas SKL untuk siswa <strong className="text-blue-600">{successDeletedName}</strong> telah berhasil dihapus secara permanen dari server.
            </p>
            <button onClick={() => setSuccessDeletedName(null)}
              className="neo-brutal-sm rounded-xl bg-white text-gray-900 border-2 border-black font-bold px-5 py-3 w-full hover:bg-gray-100 transition-all hover:scale-102 active:scale-98">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
