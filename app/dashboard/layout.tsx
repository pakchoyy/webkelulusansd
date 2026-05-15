import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: school } = await supabase
    .from('schools')
    .select('nama_sekolah, slug, is_demo')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav
        namaSekolah={school?.nama_sekolah || ''}
        slug={school?.slug || ''}
        isDemo={school?.is_demo}
      />
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pt-6">
        {children}
      </main>
    </div>
  )
}
