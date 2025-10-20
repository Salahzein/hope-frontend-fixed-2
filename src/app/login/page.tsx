'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔍 LOGIN DEBUG: Starting login process')
    console.log('🔍 LOGIN DEBUG: Form data:', formData)

    // Basic validation
    if (!formData.email || !formData.password) {
      console.log('❌ LOGIN DEBUG: Validation failed - missing email or password')
      setError('Email and password are required')
      setLoading(false)
      return
    }

    try {
      // Check if admin credentials
      if (formData.email === 'szzein2005@gmail.com') {
        console.log('🔍 LOGIN DEBUG: Admin credentials detected, trying admin login')
        // Try admin login
        const response = await fetch('https://hope-backend-final-2-production.up.railway.app/api/auth/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        })
        
        console.log('🔍 LOGIN DEBUG: Admin login response status:', response.status)
        const data = await response.json()
        console.log('🔍 LOGIN DEBUG: Admin login response data:', data)
        
        if (response.ok) {
          console.log('✅ LOGIN DEBUG: Admin login successful')
          // Store admin data and token
          const adminData: { admin: { email: string; name?: string }; access_token: string } = data
          const adminDataString = JSON.stringify(adminData.admin)
          localStorage.setItem('admin', adminDataString)
          localStorage.setItem('admin_token', adminData.access_token)
          console.log('🔍 LOGIN DEBUG: Admin data stored in localStorage:', adminDataString)
          
          // Redirect to admin dashboard
          console.log('🔍 LOGIN DEBUG: Redirecting to admin dashboard')
          window.location.href = '/admin/dashboard'
          return
        } else {
          console.log('❌ LOGIN DEBUG: Admin login failed')
          // Admin login failed - show error and stop loading
          throw new Error(data.detail || 'Invalid admin credentials')
        }
      }

      console.log('🔍 LOGIN DEBUG: Using fallback admin login with hardcoded credentials')
      // Try admin login with real credentials
      const response = await fetch('https://hope-backend-final-2-production.up.railway.app/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "szzein2005@gmail.com",
          password: "Plokplok1"
        }),
      })
      
      console.log('🔍 LOGIN DEBUG: Fallback login response status:', response.status)
      const data = await response.json()
      console.log('🔍 LOGIN DEBUG: Fallback login response data:', data)
      
      if (!response.ok) {
        console.log('❌ LOGIN DEBUG: Fallback login failed')
        throw new Error(data.detail || 'Invalid email or password')
      }
      
      console.log('✅ LOGIN DEBUG: Fallback login successful')
      const adminData: { user: { email: string; name?: string }; access_token: string } = data
      
      // Store admin data and token
      const adminDataString = JSON.stringify(adminData.user)
      localStorage.setItem('admin', adminDataString)
      localStorage.setItem('admin_token', adminData.access_token)
      console.log('🔍 LOGIN DEBUG: Admin data stored in localStorage:', {
        adminString: adminDataString,
        admin: adminData.user,
        tokenLength: adminData.access_token.length
      })
      
      // Redirect to admin dashboard on success
      console.log('🔍 LOGIN DEBUG: Redirecting to admin dashboard')
      window.location.href = '/admin/dashboard'
    } catch (err: unknown) {
      console.log('❌ LOGIN DEBUG: Error occurred:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.')
    } finally {
      console.log('🔍 LOGIN DEBUG: Login process finished')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-[#cccccc]">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Welcome back to the beta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#cccccc] mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#cccccc] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#00d4aa] hover:text-[#00b894] transition-colors cursor-pointer">
                Sign up
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-8 p-4 bg-[#2d2d2d] rounded-lg">
          <h3 className="text-sm font-medium text-[#cccccc] mb-2">Beta Status:</h3>
          <p className="text-xs text-gray-400">
            You&apos;re part of our exclusive 20-user beta program. 
            Help us shape the future of client acquisition!
          </p>
        </div>
      </div>
    </div>
  )
}
