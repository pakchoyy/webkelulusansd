# Kelulusan SaaS — BantuGuruYuk

Website pengumuman kelulusan SD multi-sekolah.  
Stack: Next.js 14 + Supabase + Vercel

---

## Setup Lokal

```bash
npm install
cp .env.local.example .env.local
# isi .env.local dengan credentials Supabase kamu
npm run dev
```

---

## Setup Supabase (sekali saja)

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste isi file `supabase/setup.sql` → Run
3. Buka **Storage** → New bucket → nama: `logos`, public: ON, max size: 1MB
4. Buka **Storage** → New bucket → nama: `skls`, public: ON, max size: 3MB
5. Ambil credentials dari **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. **Setup Email Template** (untuk reset password):
   - Buka **Authentication → Email Templates**
   - Edit template "Reset Password"
   - Pastikan URL redirect mengarah ke: `https://domain-kamu.vercel.app/auth/callback`

---

## Deploy ke Vercel

1. Push repo ke GitHub
2. Connect di [vercel.com](https://vercel.com) → Import repo
3. Tambah environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_SECRET=rahasia-kamu-untuk-generate-kode
   ```
4. **Supabase Auth Settings** (untuk reset password):
   - Buka Supabase Dashboard → Authentication → URL Configuration
   - Tambahkan `https://domain-kamu.vercel.app` ke **Redirect URLs**
5. Deploy → otomatis

---

## Generate Kode Aktivasi (untuk pembeli baru)

Setelah deploy, panggil endpoint ini tiap ada pembeli:

```
POST https://domain-kamu.vercel.app/api/generate-code?secret=ADMIN_SECRET_KAMU
```

Response:
```json
{ "code": "BGY-ABCD-1234" }
```

Kirim kode ini ke pembeli lewat Lynk/WA. Mereka daftar di:
```
https://domain-kamu.vercel.app/register
```

---

## Alur Pembeli

1. Beli di Lynk
2. Kamu generate kode → kirim ke pembeli
3. Pembeli buka `/register` → masukkan kode → isi data sekolah
4. Dapat dashboard di `/dashboard`
5. Halaman publik siswa: `/{slug}`

---

## Struktur File

```
app/
├── [slug]/              # Halaman publik cek NISN
├── login/               # Login sekolah
├── b2g4y10-enroll/      # Daftar dengan kode aktivasi
├── auth/
│   ├── forgot-password/ # Form lupa password
│   ├── reset-password/  # Reset password (legacy)
│   ├── update-password/ # Update password baru
│   └── callback/        # Auth callback handler
├── dashboard/
│   ├── page.tsx         # Beranda dashboard
│   ├── students/        # Kelola siswa
│   ├── upload/          # Upload Excel massal
│   └── settings/        # Pengaturan sekolah + logo
└── api/
    ├── generate-code/   # Generate kode aktivasi
    └── register-school/ # Register sekolah baru

lib/supabase/
├── client.ts            # Browser client
└── server.ts            # Server client + service role

supabase/
└── setup.sql            # SQL setup (jalankan sekali di Supabase)
```
