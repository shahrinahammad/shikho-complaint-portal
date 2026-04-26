'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // ফর্ম স্টেট
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'reset'>('create')

  // Create User State
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('Agent')

  // Reset Password State
  const [resetEmail, setResetEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return; }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'Admin') {
        alert('অ্যাক্সেস ডিনাইড! শুধুমাত্র অ্যাডমিনরা এই পেজে আসতে পারবেন।')
        window.location.href = '/dashboard'
        return
      }
      setIsAdmin(true)
      setLoading(false)
    }
    checkAdmin()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CREATE_USER', name: newName, email: newEmail, password: newPassword, role: newRole })
    })
    const data = await res.json()
    if (data.success) {
      alert(data.message); setNewName(''); setNewEmail(''); setNewPassword('');
    } else { alert('Error: ' + data.error); }
    setActionLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET_PASSWORD', email: resetEmail, password: resetPassword })
    })
    const data = await res.json()
    if (data.success) {
      alert(data.message); setResetEmail(''); setResetPassword('');
    } else { alert('Error: ' + data.error); }
    setActionLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">লোড হচ্ছে...</div>

  return (
    <div className="min-h-screen p-6 bg-[#f0f2f5]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10" />
            <div>
              <h1 className="text-2xl font-black text-[#354894]">Admin Panel</h1>
              <p className="text-sm font-bold text-gray-400">স্টাফ অ্যাকাউন্ট ও পাসওয়ার্ড ম্যানেজমেন্ট</p>
            </div>
          </div>
          <button onClick={() => window.location.href='/dashboard'} className="px-5 py-2.5 bg-[#EFAD1E] text-white font-bold rounded-xl shadow-md">Dashboard</button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-4 font-black rounded-2xl transition-all shadow-sm ${activeTab === 'create' ? 'bg-[#354894] text-white' : 'bg-white text-gray-500 border'}`}>
            ➕ নতুন স্টাফ অ্যাকাউন্ট তৈরি
          </button>
          <button onClick={() => setActiveTab('reset')} className={`flex-1 py-4 font-black rounded-2xl transition-all shadow-sm ${activeTab === 'reset' ? 'bg-[#EE3D5E] text-white' : 'bg-white text-gray-500 border'}`}>
            🔑 পাসওয়ার্ড রিসেট করুন
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          
          {/* Create User Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold mb-2">স্টাফের পুরো নাম</label><input required value={newName} onChange={e=>setNewName(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" placeholder="Mr. Agent" /></div>
                <div><label className="block text-sm font-bold mb-2">স্টাফের ইমেইল</label><input required value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" className="w-full p-3 bg-gray-50 border rounded-xl outline-none" placeholder="agent@shikho.com" /></div>
                <div><label className="block text-sm font-bold mb-2">নতুন পাসওয়ার্ড</label><input required value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="text" minLength={6} className="w-full p-3 bg-gray-50 border rounded-xl outline-none" placeholder="কমপক্ষে ৬ অক্ষর" /></div>
                <div>
                  <label className="block text-sm font-bold mb-2">স্টাফের রোল (Role)</label>
                  <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none">
                    <option value="Agent">Agent (এজেন্ট)</option>
                    <option value="Supervisor">Supervisor (সুপারভাইজার)</option>
                    <option value="Admin">Admin (অ্যাডমিন)</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={actionLoading} className="w-full py-4 bg-[#354894] text-white font-black rounded-xl shadow-md disabled:opacity-50 mt-4">
                {actionLoading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6 max-w-lg mx-auto">
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-500">যে স্টাফের পাসওয়ার্ড ভুলে গেছেন, তার ইমেইল এবং নতুন একটি পাসওয়ার্ড দিন।</p>
              </div>
              <div><label className="block text-sm font-bold mb-2">স্টাফের ইমেইল এড্রেস</label><input required value={resetEmail} onChange={e=>setResetEmail(e.target.value)} type="email" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-red-500" placeholder="agent@shikho.com" /></div>
              <div><label className="block text-sm font-bold mb-2">নতুন পাসওয়ার্ড</label><input required value={resetPassword} onChange={e=>setResetPassword(e.target.value)} type="text" minLength={6} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-red-500" placeholder="নতুন পাসওয়ার্ড দিন" /></div>
              <button type="submit" disabled={actionLoading} className="w-full py-4 bg-[#EE3D5E] text-white font-black rounded-xl shadow-md disabled:opacity-50">
                {actionLoading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড জোরপূর্বক রিসেট করুন'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
