export type School = {
  id: string
  nama_sekolah: string
  slug: string
  email: string
  logo_url: string | null
  tahun_ajaran: string
  countdown_at: string
  hero_title: string
  batch_label: string
  theme_primary: string
  is_demo?: boolean
  created_at: string
}

export type Student = {
  id: string
  school_id: string
  nisn: string
  nama: string
  kelas: string
  status: 'LULUS' | 'TIDAK LULUS'
  pesan: string
  created_at: string
}

export type ActivationCode = {
  id: string
  code: string
  used: boolean
  used_by: string | null
  used_at: string | null
  created_at: string
}
