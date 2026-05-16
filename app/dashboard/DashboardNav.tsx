'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function DashboardNav({ namaSekolah, slug, isDemo, logoUrl }: { 
  namaSekolah: string; slug: string; isDemo?: boolean; logoUrl?: string | null 
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Beranda' },
    { href: '/dashboard/students', label: 'Data Siswa' },
  ]

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full neo-brutal-sm bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">🎓</span>
            )}
          </div>
          <span className="font-black text-gray-900 text-sm truncate max-w-[160px]">{namaSekolah}</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                pathname === l.href ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {l.label}
            </Link>
          ))}
          {slug && (
            <a href={`/${slug}`} target="_blank"
              className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
              Web Pengumuman
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          )}
          {isDemo && (
            <a href="https://lynk.id/kreacy/66rmgwxx94r0" target="_blank"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
              🔓 Beli Pro
            </a>
          )}
          <button onClick={logout}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">
            Keluar
          </button>
        </nav>

        {/* Mobile: hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-2">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                pathname === l.href ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {l.label}
            </Link>
          ))}
          {slug && (
            <a href={`/${slug}`} target="_blank"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
              🌐 Web Pengumuman
            </a>
          )}
          {isDemo && (
            <a href="https://lynk.id/kreacy/66rmgwxx94r0" target="_blank"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors text-center">
              🔓 Beli Pro
            </a>
          )}
          <button onClick={logout}
            className="px-3 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
            Keluar
          </button>
        </div>
      )}
    </header>
  )
}
