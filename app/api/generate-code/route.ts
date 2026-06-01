import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `BGY-${seg(4)}-${seg(4)}`
}

export async function POST(req: NextRequest) {
  const SECRET = process.env.ADMIN_SECRET
  if (!SECRET) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const code = randomCode()
  const { error } = await supabase.from('activation_codes').insert({ code })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code })
}
