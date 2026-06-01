import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { userId, namaSekolah, slug, email } = await req.json()

  if (!userId || !namaSekolah || !slug || !email) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
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
    id: userId,
    nama_sekolah: namaSekolah,
    slug,
    email,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
