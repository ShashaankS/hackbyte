'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPersist, setIsPersist] = useState(true)
  
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard') // Redirect to dashboard if already logged in
      }
    }
    
    checkSession()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign in with proper session handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Configure session persistence based on user choice
          persistSession: isPersist
        }
      })

      if (error) {
        throw error
      }

      // If login successful
      if (data?.session) {
        // You can store additional auth state if needed
        router.refresh() // Refresh server components to reflect auth state
        router.push('/dashboard') // Redirect to dashboard or intended page
      }
    } catch (err: any
    ) {
      setError(err.message || 'Failed to sign in')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset
  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      // Show success message
      setError('Password reset email sent! Please check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-700 via-black to-red-700 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black bg-opacity-60 p-10 rounded-xl shadow-2xl text-white">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className={`p-3 rounded ${error.includes('sent') ? 'bg-green-900' : 'bg-red-900'} text-sm`}>
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 bg-white text-black border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 bg-white text-black border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={isPersist}
                onChange={(e) => setIsPersist(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
            
            <button 
              type="button" 
              onClick={handleResetPassword}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Forgot password?
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}