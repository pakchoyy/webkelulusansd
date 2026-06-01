import * as XLSX from 'xlsx'
import type { Student } from '@/types'

export type StudentRow = Omit<Student, 'id' | 'school_id' | 'created_at'>

export function parseExcel(file: File): Promise<{ rows: StudentRow[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]

      const rows: StudentRow[] = []
      const errors: string[] = []

      // Skip baris header (baris 0)
      raw.slice(1).forEach((row, i) => {
        if (!Array.isArray(row)) return
        const [nisn, nama, kelas, status, pesan] = row.map(c => String(c ?? '').trim())
        const lineNum = i + 2

        if (!nisn || !nama || !kelas) {
          errors.push(`Baris ${lineNum}: NISN, Nama, atau Kelas kosong`)
          return
        }
        if (!['LULUS', 'TIDAK LULUS'].includes(status?.toUpperCase())) {
          errors.push(`Baris ${lineNum}: Status harus LULUS atau TIDAK LULUS`)
          return
        }

        rows.push({
          nisn,
          nama,
          kelas,
          status: status.toUpperCase() as 'LULUS' | 'TIDAK LULUS',
          pesan: pesan || '',
        })
      })

      resolve({ rows, errors })
    }
    reader.readAsArrayBuffer(file)
  })
}
