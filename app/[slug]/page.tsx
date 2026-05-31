import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicPageClient from './PublicPageClient'
import type { Metadata } from 'next'

export const revalidate = 30

type Props = { params: Promise<{ slug: string }> }

async function getSchool(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('schools')
    .select('id, nama_sekolah, slug, logo_url, tahun_ajaran, countdown_at, hero_title, batch_label, theme_primary')
    .eq('slug', slug)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const school = await getSchool(slug)
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
  const school = await getSchool(slug)
  if (!school) notFound()

  const supabase = await createClient()
  const { count } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', school!.id)

  return <PublicPageClient school={school!} studentCount={count || 0} />
}
