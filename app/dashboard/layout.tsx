import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: school } = await supabase
    .from('schools')
    .select('nama_sekolah, slug, is_demo, logo_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNav
        namaSekolah={school?.nama_sekolah || ''}
        slug={school?.slug || ''}
        isDemo={school?.is_demo}
        logoUrl={school?.logo_url}
      />
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pt-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-5 px-4 text-center bg-[#008080] text-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1">Portal Kelulusan SD</p>
          <p className="text-[10px] font-bold opacity-90">
            © 2026 Bantu Guru Yuk by <a href="https://tiktok.com/@pak.choyy" target="_blank" className="underline hover:text-yellow-300 transition-colors font-black">pak.choyy</a> • v 26.5.4
          </p>
        </div>
      </footer>
    </div>
  )
}
