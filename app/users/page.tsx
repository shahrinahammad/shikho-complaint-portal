'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadUsers() {
      // ১. বর্তমান ইউজার চেক করা
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      // ২. বর্তমান ইউজারের রোল চেক করা (শুধুমাত্র অ্যাডমিন ঢুকতে পারবে)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData?.role !== 'Admin') {
        alert('অ্যাক্সেস ডিনাইড! এই পেজে শুধুমাত্র অ্যাডমিনরা প্রবেশ করতে পারবেন।')
        window.location.href = '/dashboard'
        return
      }
      setCurrentUser(profileData)

      // ৩. ডাটাবেস থেকে সব স্টাফের তালিকা নিয়ে আসা
      const { data: allProfiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (allProfiles) setProfiles(allProfiles)
      
      setLoading(false)
    }
    loadUsers()
  }, [])

  // রোল (Role) আপডেট করার ফাংশন
  const updateRole = async (userId: string, newRole: string) => {
    // UI সাথে সাথে আপডেট করা
    setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p))
    
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) alert('রোল আপডেট করতে সমস্যা হয়েছে!')
  }

  // স্টাফদের সার্চ ফিল্টার
  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl" style={{ color: '#354894' }}>লোড হচ্ছে...</div>

  return (
    <div className="min-h-screen p-6 font-sans" style={{ backgroundColor: 'rgba(53,72,148,0.05)' }}>
      <div className="max-w-5xl mx-auto">
        
        {/* হেডার */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#CF278D' }}>
              <span className="text-white text-2xl font-bold">👥</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: '#354894' }}>User Management</h1>
              <p className="mt-1 font-semibold text-gray-500">
                স্টাফদের রোল (Role) এবং অ্যাক্সেস কন্ট্রোল প্যানেল
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => window.location.href = '/dashboard'} className="px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm border bg-white text-gray-700 hover:bg-gray-50">
              ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
        </div>

        {/* ইউজার লিস্ট টেবিল */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 gap-4">
            <h2 className="text-xl font-bold" style={{ color: '#354894' }}>সকল স্টাফের তালিকা ({profiles.length})</h2>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="ইমেইল দিয়ে খুঁজুন..." 
              className="p-2.5 rounded-lg border outline-none text-sm font-semibold focus:border-pink-500 w-full md:w-64"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'rgba(207,39,141,0.05)', color: '#354894' }}>
                  <th className="p-4 font-bold border-b">ইমেইল / ইউজারনেম</th>
                  <th className="p-4 font-bold border-b text-center">বর্তমান রোল (Role)</th>
                  <th className="p-4 font-bold border-b text-center">অ্যাকশন (রোল পরিবর্তন করুন)</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-medium">কোনো ইউজার পাওয়া যায়নি।</td></tr>
                ) : (
                  filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{profile.full_name}</div>
                        <div className="text-xs text-gray-400 mt-1">ID: {profile.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm px-3 py-1 rounded-full text-white font-bold" style={{ 
                          backgroundColor: profile.role === 'Admin' ? '#EE3D5E' : profile.role === 'Supervisor' ? '#EFAD1E' : '#CF278D' 
                        }}>
                          {profile.role || 'Agent'}
                        </span>
                      </td>
                      <td className="p-4 text-center flex justify-center">
                        <select 
                          value={profile.role || 'Agent'} 
                          onChange={(e) => updateRole(profile.id, e.target.value)}
                          disabled={profile.id === currentUser?.id} // নিজেকে নিজে ডাউনগ্রেড করা বন্ধ
                          className="px-3 py-1.5 text-sm font-bold rounded-lg cursor-pointer outline-none transition-all border border-gray-300 bg-white focus:border-pink-500 disabled:opacity-50"
                          style={{ color: '#354894' }}
                        >
                          <option value="Admin">👑 Admin</option>
                          <option value="Supervisor">🛡️ Supervisor</option>
                          <option value="Agent">👨‍💻 Agent</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}