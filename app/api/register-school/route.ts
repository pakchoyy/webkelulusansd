import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Verifikasi session user dari cookie (bukan dari body)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const cookieHeader = req.headers.get('cookie') || ''
  const authCookies: Record<string, string> = {}
  cookieHeader.split(';').forEach(c => {
    const [key, ...val] = c.trim().split('=')
    if (key.startsWith('sb-')) authCookies[key] = val.join('=')
  })

  // Buat client dengan cookie user untuk verifikasi session
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Cookie: cookieHeader },
    },
  })

  const { data: { user } } = await userSupabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { namaSekolah, slug, email } = await req.json()

  if (!namaSekolah || !slug || !email) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  // Pakai service role untuk insert (bypass RLS)
  const supabase = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: existing } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Slug sudah dipakai.' }, { status: 409 })
  }

  const { error } = await supabase.from('schools').insert({
    id: user.id,
    nama_sekolah: namaSekolah,
    slug,
    email,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
