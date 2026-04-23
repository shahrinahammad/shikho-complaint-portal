'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: password })
    
    if (error) {
      alert('সমস্যা হয়েছে: ' + error.message)
    } else {
      alert('✅ আপনার পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! এখন লগইন করুন।')
      window.location.href = '/login'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black text-center text-[#354894] mb-6">নতুন পাসওয়ার্ড সেট করুন</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">আপনার নতুন পাসওয়ার্ড</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none" placeholder="নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)" minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#CF278D] text-white font-black p-3 rounded-xl shadow-md">
            {loading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড সেভ করুন'}
          </button>
        </form>
      </div>
    </div>
  )
}
