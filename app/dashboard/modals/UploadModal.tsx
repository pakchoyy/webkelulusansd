'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { parseExcel } from '@/lib/excel'
import { utils, writeFile } from 'xlsx'
import Modal from './Modal'

export default function UploadModal({ schoolId, onClose }: { schoolId: string; onClose: () => void }) {
  const supabase = createClient()
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  function downloadTemplate() {
    const data = [
      ['NISN', 'Nama', 'Kelas', 'Status', 'Pesan'],
      ['1234567890', 'Budi Santoso', 'VI-A', 'LULUS', 'Selamat dan sukses selalu!'],
      ['1234567891', 'Ani Wijaya', 'VI-B', 'TIDAK LULUS', 'Jangan berkecil hati, tetap semangat!'],
    ]
    const ws = utils.aoa_to_sheet(data)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Template Siswa')
    writeFile(wb, 'Template_Data_Siswa_SD.xlsx')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setResult('')
    try {
      const { rows, errors } = await parseExcel(f)
      setPreview(rows); setErrors(errors)
    } catch (err: any) {
      setErrors([`Gagal membaca file: ${err.message || 'Format tidak didukung'}`])
      setPreview([])
    }
    // Reset input agar bisa upload file yang sama lagi
    e.target.value = ''
  }

  async function handleUpload() {
    if (!preview.length) return
    setLoading(true)
    const rows = preview.map(r => ({ ...r, school_id: schoolId }))
    const { error } = await supabase.from('students')
      .upsert(rows, { onConflict: 'school_id,nisn', ignoreDuplicates: false })
    setLoading(false)
    if (error) { setResult('❌ Gagal: ' + error.message); return }
    setResult(`✅ ${rows.length} siswa berhasil diimpor!`)
    setPreview([])
    setTimeout(onClose, 1500)
  }

  return (
    <Modal title="📥 Upload Excel Data Siswa" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-black text-blue-800 uppercase tracking-wider">Format Kolom Excel</p>
              <p className="text-[10px] text-blue-600 font-medium">Pastikan kolom sesuai urutan ini:</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm shadow-blue-200"
            >
              📥 Download File Contoh
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-blue-200">
            <table className="text-[10px] w-full border-collapse bg-white">
              <thead>
                <tr className="bg-blue-100">
                  {['NISN','Nama','Kelas','Status','Pesan'].map(h => (
                    <th key={h} className="border border-blue-200 px-2 py-1.5 text-left font-black text-blue-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="text-gray-600">
                  <td className="border border-blue-50 px-2 py-1">1234567890</td>
                  <td className="border border-blue-50 px-2 py-1">Budi Santoso</td>
                  <td className="border border-blue-50 px-2 py-1">VI-A</td>
                  <td className="border border-blue-50 px-2 py-1 font-bold text-green-600">LULUS</td>
                  <td className="border border-blue-50 px-2 py-1 italic">Selamat!</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-blue-700 mt-2 font-medium flex items-center gap-1">
            ⚠️ Status WAJIB: <span className="font-black">LULUS</span> atau <span className="font-black">TIDAK LULUS</span>
          </p>
        </div>

        <div className="relative group">
          <input type="file" accept=".xlsx,.xls" onChange={handleFile}
            className="w-full text-xs border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-black file:text-xs" />
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
            <p className="font-bold text-red-700 text-sm mb-1">⚠️ {errors.length} baris bermasalah:</p>
            {errors.slice(0,5).map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
          </div>
        )}

        {preview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-black text-gray-700 text-xs">{preview.length} siswa siap diimpor:</p>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">File Siap</span>
            </div>
            <div className="max-h-40 overflow-auto space-y-1.5 pr-1 custom-scrollbar">
              {preview.slice(0,20).map((s, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px]">
                  <div className="flex flex-col">
                    <span className="font-black text-gray-800">{s.nama}</span>
                    <span className="text-gray-400 font-bold">{s.nisn}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wider ${s.status === 'LULUS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
              {preview.length > 20 && <p className="text-[10px] text-gray-400 text-center py-2">...+{preview.length-20} siswa lainnya</p>}
            </div>
            {result && <p className="font-black text-sm text-center py-2 text-green-600">{result}</p>}
            <button onClick={handleUpload} disabled={loading}
              className="neo-brutal-sm w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm shadow-lg shadow-blue-100">
              {loading ? 'Mengimpor...' : `🚀 Impor ${preview.length} Siswa Sekarang`}
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
