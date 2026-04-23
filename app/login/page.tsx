'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg('লগইন ব্যর্থ হয়েছে: ইমেইল বা পাসওয়ার্ড ভুল!')
      } else {
        alert('লগইন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...')
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setErrorMsg('সিস্টেম এরর: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: 'rgba(53,72,148,0.05)' }}>
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        
        <div className="text-center mb-8">
          {/* এখানে লোগো অ্যাড করা হয়েছে এবং 'S' আইকন সরিয়ে ফেলা হয়েছে */}
          <img src="/logo.png" alt="Shikho Logo" className="h-16 mx-auto mb-4 object-contain" />
          
          <h1 className="text-3xl font-extrabold" style={{ color: '#354894' }}>Shikho Complaint Portal</h1>
          <p className="mt-2 font-medium" style={{ color: 'rgba(53,72,148,0.7)' }}>শুধুমাত্র অনুমোদিত স্টাফদের জন্য</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-center font-semibold border text-white" style={{ backgroundColor: '#EE3D5E', borderColor: '#EE3D5E' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#354894' }}>ইমেইল অ্যাড্রেস</label>
            <input required name="email" type="email" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all" style={{ outlineColor: '#CF278D' }} placeholder="name@shikho.com" />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#354894' }}>পাসওয়ার্ড</label>
            <input required name="password" type="password" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all" style={{ outlineColor: '#CF278D' }} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full text-white font-extrabold text-lg p-4 rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none" style={{ backgroundColor: '#CF278D', boxShadow: '0 4px 14px rgba(207,39,141,0.4)' }}>
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  )
}