import { createClient } from '@/lib/supabase/server'
import DashboardPageClient from './DashboardPageClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: school } = await supabase
    .from('schools').select('*').eq('id', user!.id).single()

  const { count: total }    = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', user!.id)
  const { count: lulus }    = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', user!.id).eq('status', 'LULUS')
  const { count: tdkLulus } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', user!.id).eq('status', 'TIDAK LULUS')

  const countdownDate = school?.countdown_at ? new Date(school.countdown_at).toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }) : '-'

  return <DashboardPageClient school={school} total={total||0} lulus={lulus||0} tdkLulus={tdkLulus||0} countdownDate={countdownDate} />
}
