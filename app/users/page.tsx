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
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'reset'>('list')
  const [usersList, setUsersList] = useState<any[]>([])

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
      fetchUsers()
    }
    checkAdmin()
  }, [])

  // ডাটাবেস থেকে সব ইউজারকে নিয়ে আসা
  async function fetchUsers() {
    const { data, error } = await supabase.from('profiles').select('*')
    if (data) setUsersList(data)
    setLoading(false)
  }

  // ইউজারের রোল আপডেট করা
  const handleRoleChange = async (userId: string, newRole: string) => {
    const confirmed = window.confirm(`আপনি কি নিশ্চিত যে এই স্টাফের রোল পরিবর্তন করে '${newRole}' করতে চান?`);
    if (!confirmed) return;

    setActionLoading(true);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      alert('সমস্যা হয়েছে: ' + error.message);
    } else {
      alert('✅ রোল সফলভাবে আপডেট হয়েছে!');
      fetchUsers(); // লিস্ট রিফ্রেশ করা
    }
    setActionLoading(false);
  }

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
      fetchUsers(); // নতুন আইডি বানালে লিস্ট রিফ্রেশ হবে
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
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10" />
            <div>
              <h1 className="text-2xl font-black text-[#354894]">User Management</h1>
              <p className="text-sm font-bold text-gray-400">স্টাফদের রোল এবং অ্যাক্সেস কন্ট্রোল প্যানেল</p>
            </div>
          </div>
          <button onClick={() => window.location.href='/dashboard'} className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50">ড্যাশবোর্ডে ফিরুন</button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button onClick={() => setActiveTab('list')} className={`flex-1 min-w-[200px] py-4 font-black rounded-2xl transition-all shadow-sm ${activeTab === 'list' ? 'bg-[#354894] text-white' : 'bg-white text-gray-500 border'}`}>
            📋 সকল স্টাফের তালিকা
          </button>
          <button onClick={() => setActiveTab('create')} className={`flex-1 min-w-[200px] py-4 font-black rounded-2xl transition-all shadow-sm ${activeTab === 'create' ? 'bg-[#CF278D] text-white' : 'bg-white text-gray-500 border'}`}>
            ➕ নতুন আইডি তৈরি
          </button>
          <button onClick={() => setActiveTab('reset')} className={`flex-1 min-w-[200px] py-4 font-black rounded-2xl transition-all shadow-sm ${activeTab === 'reset' ? 'bg-[#EE3D5E] text-white' : 'bg-white text-gray-500 border'}`}>
            🔑 পাসওয়ার্ড রিসেট
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          
          {/* User List Table */}
          {activeTab === 'list' && (
            <div>
              <h2 className="text-xl font-bold text-[#354894] mb-6">সকল স্টাফের তালিকা ({usersList.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-pink-50 text-[#354894] font-bold text-sm">
                    <tr>
                      <th className="p-4 rounded-tl-xl rounded-bl-xl">নাম / ইমেইল</th>
                      <th className="p-4 text-center">বর্তমান রোল (Role)</th>
                      <th className="p-4 text-center rounded-tr-xl rounded-br-xl">অ্যাকশন (রোল পরিবর্তন করুন)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u: any) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{u.full_name || u.email || 'No Name'}</div>
                          <div className="text-xs text-gray-400">ID: {u.id.substring(0, 10)}...</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm ${u.role === 'Admin' ? 'bg-[#EE3D5E]' : u.role === 'Supervisor' ? 'bg-[#EFAD1E]' : 'bg-[#CF278D]'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={actionLoading}
                            className="p-2 border border-gray-200 rounded-lg text-sm font-bold text-[#354894] outline-none cursor-pointer hover:border-pink-300 transition-all bg-white"
                          >
                            <option value="Agent">Agent</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create User Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold mb-2 text-gray-700">স্টাফের পুরো নাম</label><input required value={newName} onChange={e=>setNewName(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-pink-400" placeholder="Mr. Agent" /></div>
                <div><label className="block text-sm font-bold mb-2 text-gray-700">স্টাফের ইমেইল</label><input required value={newEmail} onChange={e=>setNewEmail(e.target.value)} type="email" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-pink-400" placeholder="agent@shikho.com" /></div>
                <div><label className="block text-sm font-bold mb-2 text-gray-700">নতুন পাসওয়ার্ড</label><input required value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="text" minLength={6} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-pink-400" placeholder="কমপক্ষে ৬ অক্ষর" /></div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">স্টাফের রোল (Role)</label>
                  <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-pink-400">
                    <option value="Agent">Agent (এজেন্ট)</option>
                    <option value="Supervisor">Supervisor (সুপারভাইজার)</option>
                    <option value="Admin">Admin (অ্যাডমিন)</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={actionLoading} className="w-full py-4 bg-[#CF278D] text-white font-black rounded-xl shadow-md disabled:opacity-50 mt-4 hover:bg-pink-700 transition-all">
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
              <div><label className="block text-sm font-bold mb-2 text-gray-700">স্টাফের ইমেইল এড্রেস</label><input required value={resetEmail} onChange={e=>setResetEmail(e.target.value)} type="email" className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-red-400" placeholder="agent@shikho.com" /></div>
              <div><label className="block text-sm font-bold mb-2 text-gray-700">নতুন পাসওয়ার্ড</label><input required value={resetPassword} onChange={e=>setResetPassword(e.target.value)} type="text" minLength={6} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-red-400" placeholder="নতুন পাসওয়ার্ড দিন" /></div>
              <button type="submit" disabled={actionLoading} className="w-full py-4 bg-[#EE3D5E] text-white font-black rounded-xl shadow-md disabled:opacity-50 hover:bg-red-600 transition-all">
                {actionLoading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড জোরপূর্বক রিসেট করুন'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
