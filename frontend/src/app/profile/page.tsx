import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'

export default async function ProfilePage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Fetch user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {session.user.email}</p>
      {profile && (
        <>
          <p>Username: {profile.username || 'Not set'}</p>
          <p>Full name: {profile.full_name || 'Not set'}</p>
        </>
      )}
    </div>
  )
}