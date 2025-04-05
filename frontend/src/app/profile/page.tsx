import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'
import ProfileForm from '../components/profileForm'
import { Suspense } from 'react'
import LoadingSpinner from '../components/loader'

export default async function ProfilePage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Redirect unauthenticated users to login page
    redirect('/login')
  }
  
  // Fetch user profile data with error handling
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error fetching profile:', error)
  }
  
  // Fetch user's recent activity if you have such a table
  const { data: recentActivity } = await supabase
    .from('user_activity')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2 text-red-600">Your Profile</h1>
        <p className="text-gray-600">
          Manage your account information and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar with user info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Account Info</h2>
              <p className="text-gray-700">Email: {session.user.email}</p>
              <p className="text-gray-700">Member since: {new Date(session.user.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 text-red-600">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/settings" className="text-blue-600 hover:underline">Account Settings</a></li>
                <li><a href="/security" className="text-blue-600 hover:underline">Security</a></li>
                <li><a href="/billing" className="text-blue-600 hover:underline">Billing</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Profile Information</h2>
            
            {profile ? (
              <Suspense fallback={<LoadingSpinner />}>
                <ProfileForm initialData={profile} userId={session.user.id} />
              </Suspense>
            ) : (
              <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-700">
                  You haven&apos;t set up your profile yet. Please complete your profile information.
                </p>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfileForm initialData={{}} userId={session.user.id} />
                </Suspense>
              </div>
            )}
          </div>
          
          {/* Recent activity section */}
          {recentActivity && recentActivity.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <ul className="divide-y">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="py-3">
                    <p className="font-medium">{activity.activity_type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}