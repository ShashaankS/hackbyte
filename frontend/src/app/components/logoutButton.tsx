'use client'

import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '@/types/supabase'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}