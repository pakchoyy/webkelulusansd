-- ============================================================
-- KELULUSAN SAAS — Supabase Setup
-- Jalankan di Supabase SQL Editor (sekali saja)
-- ============================================================

-- 1. TABEL ACTIVATION CODES
-- Kamu generate manual, kasih ke pembeli lewat Lynk
CREATE TABLE activation_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  used_by    UUID REFERENCES auth.users(id),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL SCHOOLS
CREATE TABLE schools (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_sekolah  TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  logo_url      TEXT,
  is_demo       BOOLEAN DEFAULT FALSE,
  tahun_ajaran  TEXT DEFAULT '2025/2026',
  countdown_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  hero_title    TEXT DEFAULT 'Pengumuman Kelulusan',
  batch_label   TEXT DEFAULT 'Angkatan 2025/2026',
  theme_primary TEXT DEFAULT '#2563eb',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL STUDENTS
CREATE TABLE students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  nisn       TEXT NOT NULL,
  nama       TEXT NOT NULL,
  kelas      TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('LULUS','TIDAK LULUS')),
  pesan      TEXT DEFAULT '',
  skl_url    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (school_id, nisn)
);

-- Index cepat untuk cek NISN
CREATE INDEX idx_students_nisn    ON students(school_id, nisn);
CREATE INDEX idx_students_school  ON students(school_id);
CREATE INDEX idx_schools_slug     ON schools(slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;

-- activation_codes: siapapun bisa baca (untuk validasi saat register)
-- tapi hanya service_role yang bisa insert (kamu yang generate)
CREATE POLICY "codes_public_read" ON activation_codes
  FOR SELECT USING (true);

-- schools: publik bisa baca (untuk halaman /{slug})
CREATE POLICY "schools_public_read" ON schools
  FOR SELECT USING (true);

-- schools: hanya pemilik yang bisa update
CREATE POLICY "schools_owner_update" ON schools
  FOR UPDATE USING (auth.uid() = id);

-- schools: insert hanya oleh user yang login (saat registrasi)
CREATE POLICY "schools_owner_insert" ON schools
  FOR INSERT WITH CHECK (auth.uid() = id);

-- students: publik bisa baca (untuk cek NISN)
CREATE POLICY "students_public_read" ON students
  FOR SELECT USING (true);

-- students: hanya sekolah pemilik yang bisa insert/update/delete
CREATE POLICY "students_owner_write" ON students
  FOR ALL USING (
    school_id = auth.uid()
  );

-- ============================================================
-- STORAGE BUCKET untuk logo sekolah
-- ============================================================
-- Jalankan ini terpisah di Storage > New bucket:
-- Nama bucket: logos
-- Public: YES
-- Max file size: 1MB
-- Allowed MIME: image/png, image/jpeg, image/webp

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Jalankan ini di SQL Editor untuk buat buckets:

-- Bucket logos (untuk logo sekolah)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 1048576, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket skls (untuk file SKL siswa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('skls', 'skls', true, 3145728, ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload to their own folder
CREATE POLICY "logos_insert_owner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "logos_update_owner" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "logos_delete_owner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "skls_insert_owner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'skls' AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "skls_update_owner" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'skls' AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "skls_delete_owner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'skls' AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- ============================================================
-- CONTOH INSERT ACTIVATION CODE (jalankan tiap ada pembeli)
-- ============================================================
-- INSERT INTO activation_codes (code) VALUES ('BGY-XXXX-YYYY');
-- Ganti XXXX-YYYY dengan kode unik yang kamu kasih ke pembeli
