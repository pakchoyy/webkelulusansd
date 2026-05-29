import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicPageClient from './PublicPageClient'
import type { Metadata } from 'next'

export const revalidate = 30

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: school } = await supabase
    .from('schools')
    .select('nama_sekolah, hero_title, batch_label')
    .eq('slug', slug)
    .single()

  if (!school) return {}

  return {
    title: `${school.hero_title} — ${school.nama_sekolah}`,
    description: `Pengumuman kelulusan ${school.batch_label} ${school.nama_sekolah}. Cek hasil kelulusan di sini.`,
    openGraph: {
      title: school.hero_title,
      description: `${school.nama_sekolah} — ${school.batch_label}`,
      type: 'website',
    },
  }
}

export default async function SchoolPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!school) notFound()

  const { count } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', school.id)

  return <PublicPageClient school={school} studentCount={count || 0} />
}
