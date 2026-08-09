'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('লগইন ফেইল! ইমেইল বা পাসওয়ার্ড ভুল।')
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) alert('সমস্যা হয়েছে: ' + error.message)
    else alert('✅ আপনার ইমেইলে পাসওয়ার্ড রিসেট করার লিংক পাঠানো হয়েছে! ইনবক্স চেক করুন।')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Shikho" className="h-16 mx-auto mb-4" />
          {/* 👇 এখানে নাম ঠিক করে দেওয়া হয়েছে */}
          <h1 className="text-2xl font-black text-[#354894]">Shikho Complaint Portal</h1>
          <p className="text-gray-500 font-bold text-sm">স্টাফ লগইন প্যানেল</p>
        </div>

        <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ইমেইল এড্রেস</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-pink-500" placeholder="admin@shikho.com" />
          </div>
          
          {!isResetMode && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">পাসওয়ার্ড</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-pink-500" placeholder="••••••••" />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#CF278D] text-white font-black p-3 rounded-xl hover:bg-pink-700 transition-all shadow-md">
            {loading ? 'দয়া করে অপেক্ষা করুন...' : (isResetMode ? 'পাসওয়ার্ড রিসেট লিংক পাঠান' : 'লগইন করুন')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsResetMode(!isResetMode)} className="text-sm font-bold text-indigo-600 hover:underline">
            {isResetMode ? 'লগইন পেজে ফিরে যান' : 'পাসওয়ার্ড ভুলে গেছেন?'}
          </button>
        </div>
      </div>
    </div>
  )
}
