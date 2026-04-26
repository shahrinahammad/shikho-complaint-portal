'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

// 🌐 ভাষা অনুবাদের ডিকশনারি
const translations = {
  bn: {
    dash: 'Dashboard', welcome: 'স্বাগতম,', logout: 'লগআউট', newComp: '+ নতুন কমপ্লেন',
    total: 'Total', open: 'Open', inProg: 'In Progress', comp: 'Completed', closed: 'Closed', reopen: 'Reopen',
    recent: 'সাম্প্রতিক কমপ্লেনসমূহ', search: 'নাম বা নম্বর দিয়ে খুঁজুন...', to: 'To',
    cust: 'কাস্টমার', issue: 'সমস্যার ধরণ', owner: 'দায়িত্বপ্রাপ্ত (Owner)', action: 'অ্যাকশন / স্ট্যাটাস',
    noData: 'কোনো কমপ্লেন পাওয়া যায়নি।', unassigned: 'এখনো কেউ নেয়নি', accept: 'Accept Ticket', details: 'বিস্তারিত',
    detailTitle: 'কমপ্লেন বিস্তারিত', custInfo: 'কাস্টমার ইনফো', name: 'নাম', contact: 'যোগাযোগ', desc: 'বিস্তারিত বিবরণ',
    intNotes: 'ইন্টারনাল নোটস', noNotes: 'কোনো নোট নেই।', writeNote: 'নতুন নোট লিখুন...', saveNote: 'নোট সেভ করুন',
    createTitle: 'নতুন কমপ্লেন লগ করুন', submit: 'কমপ্লেন সাবমিট করুন', loading: 'লগ করা হচ্ছে...', selectOpt: 'অপশন বেছে নিন...'
  },
  en: {
    dash: 'Dashboard', welcome: 'Welcome,', logout: 'Logout', newComp: '+ New Complaint',
    total: 'Total', open: 'Open', inProg: 'In Progress', comp: 'Completed', closed: 'Closed', reopen: 'Reopen',
    recent: 'Recent Complaints', search: 'Search name or number...', to: 'To',
    cust: 'Customer', issue: 'Issue Type', owner: 'Owner', action: 'Action / Status',
    noData: 'No complaints found.', unassigned: 'Unassigned', accept: 'Accept Ticket', details: 'Details',
    detailTitle: 'Complaint Details', custInfo: 'Customer Info', name: 'Name', contact: 'Contact', desc: 'Description',
    intNotes: 'Internal Notes', noNotes: 'No notes available.', writeNote: 'Write a new note...', saveNote: 'Save Note',
    createTitle: 'Log New Complaint', submit: 'Submit Complaint', loading: 'Logging...', selectOpt: 'Select an option...'
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔍 নতুন ফিচার স্টেটসমূহ
  const [searchQuery, setSearchQuery] = useState('')
  const [lang, setLang] = useState<'bn' | 'en'>('bn')
  const [darkMode, setDarkMode] = useState(false)

  // ফিল্টার ও পপ-আপ স্টেট
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const t = translations[lang];

  // 🎨 ডার্ক মোডের জন্য ডায়নামিক কালার
  const themeBg = darkMode ? '#121212' : 'rgba(53,72,148,0.05)';
  const cardBg = darkMode ? '#1E1E2F' : '#ffffff';
  const textColor = darkMode ? '#F3F4F6' : '#354894';
  const textMuted = darkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = darkMode ? '#374151' : '#F3F4F6';
  const inputBg = darkMode ? '#2A2A3C' : '#F9FAFB';

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return; }
      setUser(user)

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) setProfile(profileData)

      const { data: complaintsData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
      if (complaintsData) setComplaints(complaintsData)
      setLoading(false)
    }
    loadDashboardData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleCreateComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const newComplaintData = {
      title: formData.get('title'), 
      description: formData.get('description'),
      customer_name: formData.get('customer_name'), 
      customer_contact: formData.get('customer_contact'), 
      status: 'Open',
      created_by_id: user.id,
      created_by_name: profile.full_name
    }
    
    const { data, error } = await supabase.from('complaints').insert(newComplaintData).select().single()
    if (error) alert('Error: ' + error.message)
    else {
      setComplaints([data, ...complaints])
      setIsCreateModalOpen(false)
    }
    setCreateLoading(false)
  }

  const filteredComplaints = complaints.filter(c => {
    const cDate = new Date(c.created_at);
    const sDate = startDate ? new Date(startDate) : new Date('2000-01-01');
    const eDate = endDate ? new Date(endDate) : new Date('2100-01-01');
    eDate.setHours(23, 59, 59, 999);
    const dateMatch = cDate >= sDate && cDate <= eDate;
    const searchStr = searchQuery.toLowerCase();
    const searchMatch = (c.customer_name?.toLowerCase().includes(searchStr) || c.customer_contact?.toLowerCase().includes(searchStr));
    return dateMatch && searchMatch;
  });

  const summary = {
    total: filteredComplaints.length,
    open: filteredComplaints.filter(c => c.status === 'Open').length,
    inProgress: filteredComplaints.filter(c => c.status === 'In progress').length,
    completed: filteredComplaints.filter(c => c.status === 'Completed').length,
    closed: filteredComplaints.filter(c => c.status === 'Closed').length,
    reopen: filteredComplaints.filter(c => c.status === 'Reopen').length,
  };

  const acceptComplaint = async (id: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, owner_id: user.id, owner_name: profile.full_name, status: 'In progress' } : c))
    await supabase.from('complaints').update({ owner_id: user.id, owner_name: profile.full_name, status: 'In progress' }).eq('id', id)
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c))
    await supabase.from('complaints').update({ status: newStatus }).eq('id', id)
  }

  const openDetailsModal = async (complaint: any) => {
    setSelectedComplaint(complaint)
    setLoadingNotes(true)
    const { data } = await supabase.from('notes').select('*').eq('complaint_id', complaint.id).order('created_at', { ascending: true })
    if (data) setNotes(data)
    setLoadingNotes(false)
  }

  // ⚠️ ১০০% ফিক্সড: note_text এবং content দুটোই পাঠানো হচ্ছে
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setLoadingNotes(true); 
    
    const noteData = { 
      complaint_id: selectedComplaint.id, 
      author_name: profile.full_name, 
      author_role: profile.role, 
      content: newNote,
      note_text: newNote
    }
    
    const { error } = await supabase.from('notes').insert(noteData)
    
    if (error) {
      alert('❌ নোট সেভ করতে সমস্যা হচ্ছে: ' + error.message)
    } else {
      setNewNote(''); 
      setNotes([...notes, { ...noteData, created_at: new Date().toISOString() }]); 
    }
    setLoadingNotes(false);
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return { bg: 'rgba(238,61,94,0.1)', color: '#EE3D5E', border: '#EE3D5E' }
      case 'Reopen': return { bg: 'rgba(238,61,94,0.1)', color: '#EE3D5E', border: '#EE3D5E' }
      case 'In progress': return { bg: 'rgba(239,173,30,0.1)', color: '#EFAD1E', border: '#EFAD1E' }
      case 'Completed': return { bg: 'rgba(207,39,141,0.1)', color: '#CF278D', border: '#CF278D' }
      case 'Closed': return { bg: 'rgba(53,72,148,0.1)', color: '#354894', border: '#354894' }
      default: return { bg: 'rgba(53,72,148,0.1)', color: '#354894', border: '#354894' }
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl" style={{ backgroundColor: themeBg, color: textColor }}>Loading...</div>

  return (
    <div className="min-h-screen p-6 font-sans relative transition-colors duration-300" style={{ backgroundColor: themeBg, color: textColor }}>
      <div className="max-w-7xl mx-auto">
        
        {/* হেডার ও টগল বাটনসমূহ */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 rounded-2xl shadow-sm border mb-6 transition-colors duration-300 gap-4" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="flex items-center gap-5">
            <img src="/logo.png" alt="Shikho Logo" className="h-14 object-contain" />
            <div>
              <h1 className="text-3xl font-extrabold">{t.dash}</h1>
              <p className="mt-1 font-semibold" style={{ color: '#CF278D' }}>
                {t.welcome} {profile?.full_name} <span className="text-sm px-3 py-1 ml-2 rounded-full text-white" style={{ backgroundColor: '#EFAD1E' }}>{profile?.role}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl border text-xl transition-all shadow-sm" style={{ borderColor, backgroundColor: inputBg }}>{darkMode ? '☀️' : '🌙'}</button>
            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="px-4 py-2.5 rounded-xl border font-bold transition-all shadow-sm" style={{ borderColor, backgroundColor: inputBg }}>{lang === 'bn' ? 'ENG' : 'বাংলা'}</button>
            <button onClick={() => window.location.href = '/reports'} className="px-5 py-2.5 rounded-xl text-white font-bold shadow-md flex items-center gap-2" style={{ backgroundColor: '#EFAD1E' }}>📊 Reports</button>
            <button onClick={() => window.location.href = '/users'} className="px-5 py-2.5 rounded-xl text-white font-bold shadow-md flex items-center gap-2" style={{ backgroundColor: '#EE3D5E' }}>👥 Users</button>
            <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-2.5 rounded-xl text-white font-bold shadow-md flex items-center gap-2" style={{ backgroundColor: '#CF278D' }}>{t.newComp}</button>
            <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl text-white font-bold transition-all active:scale-95" style={{ backgroundColor: '#EE3D5E' }}>{t.logout}</button>
          </div>
        </div>

        {/* সামারি ড্যাশবোর্ড */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="p-4 rounded-2xl shadow-sm border text-center transition-colors duration-300" style={{ backgroundColor: cardBg, borderColor }}>
            <p className="text-sm font-bold" style={{ color: textMuted }}>{t.total}</p>
            <p className="text-2xl font-extrabold">{summary.total}</p>
          </div>
          <div className="p-4 rounded-2xl shadow-sm border border-red-100 text-center transition-colors duration-300" style={{ backgroundColor: darkMode ? 'rgba(238,61,94,0.1)' : 'rgba(238,61,94,0.05)' }}>
            <p className="text-sm font-bold" style={{ color: '#EE3D5E' }}>{t.open}</p>
            <p className="text-2xl font-extrabold" style={{ color: '#EE3D5E' }}>{summary.open}</p>
          </div>
          <div className="p-4 rounded-2xl shadow-sm border border-yellow-100 text-center transition-colors duration-300" style={{ backgroundColor: darkMode ? 'rgba(239,173,30,0.1)' : 'rgba(239,173,30,0.05)' }}>
            <p className="text-sm font-bold" style={{ color: '#EFAD1E' }}>{t.inProg}</p>
            <p className="text-2xl font-extrabold" style={{ color: '#EFAD1E' }}>{summary.inProgress}</p>
          </div>
          <div className="p-4 rounded-2xl shadow-sm border border-pink-100 text-center transition-colors duration-300" style={{ backgroundColor: darkMode ? 'rgba(207,39,141,0.1)' : 'rgba(207,39,141,0.05)' }}>
            <p className="text-sm font-bold" style={{ color: '#CF278D' }}>{t.comp}</p>
            <p className="text-2xl font-extrabold" style={{ color: '#CF278D' }}>{summary.completed}</p>
          </div>
          <div className="p-4 rounded-2xl shadow-sm border border-blue-100 text-center transition-colors duration-300" style={{ backgroundColor: darkMode ? 'rgba(53,72,148,0.1)' : 'rgba(53,72,148,0.05)' }}>
            <p className="text-sm font-bold" style={{ color: '#354894' }}>{t.closed}</p>
            <p className="text-2xl font-extrabold" style={{ color: '#354894' }}>{summary.closed}</p>
          </div>
          <div className="p-4 rounded-2xl shadow-sm border border-red-100 text-center transition-colors duration-300" style={{ backgroundColor: darkMode ? 'rgba(238,61,94,0.1)' : 'rgba(238,61,94,0.05)' }}>
            <p className="text-sm font-bold" style={{ color: '#EE3D5E' }}>{t.reopen}</p>
            <p className="text-2xl font-extrabold" style={{ color: '#EE3D5E' }}>{summary.reopen}</p>
          </div>
        </div>

        {/* কমপ্লেন লিস্ট ও ফিল্টার */}
        <div className="rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300" style={{ backgroundColor: cardBg, borderColor }}>
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300" style={{ backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(53,72,148,0.05)', borderColor }}>
            <h2 className="text-xl font-bold">{t.recent}</h2>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search} className="p-2.5 rounded-lg border outline-none text-sm font-semibold focus:border-pink-500 w-full md:w-64 transition-colors" style={{ backgroundColor: inputBg, color: textColor, borderColor }} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2.5 rounded-lg border outline-none text-sm font-semibold focus:border-pink-500 transition-colors" style={{ backgroundColor: inputBg, color: textColor, borderColor }} />
              <span className="font-bold" style={{ color: textMuted }}>{t.to}</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2.5 rounded-lg border outline-none text-sm font-semibold focus:border-pink-500 transition-colors" style={{ backgroundColor: inputBg, color: textColor, borderColor }} />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(207,39,141,0.05)' }}>
                  <th className="p-4 font-bold border-b" style={{ borderColor }}>{t.cust}</th>
                  <th className="p-4 font-bold border-b" style={{ borderColor }}>{t.issue}</th>
                  <th className="p-4 font-bold border-b" style={{ borderColor }}>{t.owner}</th>
                  <th className="p-4 font-bold border-b text-center" style={{ borderColor }}>{t.action}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center font-medium" style={{ color: textMuted }}>{t.noData}</td></tr>
                ) : (
                  filteredComplaints.map((complaint) => {
                    const style = getStatusStyle(complaint.status);
                    const isAdmin = profile?.role === 'Admin';
                    const isSupervisor = profile?.role === 'Supervisor';
                    const isAgent = profile?.role === 'Agent';
                    const isOwner = complaint.owner_id === user?.id;
                    const isUnowned = !complaint.owner_id;

                    return (
                      <tr key={complaint.id} className="border-b transition-colors" style={{ borderColor, backgroundColor: darkMode ? 'transparent' : 'inherit' }}>
                        <td className="p-4">
                          <div className="font-bold">{complaint.customer_name}</div>
                          <div className="text-sm" style={{ color: textMuted }}>{complaint.customer_contact} <br/> <span className="text-xs opacity-70">{new Date(complaint.created_at).toLocaleDateString('bn-BD')}</span></div>
                        </td>
                        <td className="p-4 font-semibold">{complaint.title}</td>
                        <td className="p-4">
                          {complaint.owner_name ? (
                            <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: inputBg, color: textColor }}>{complaint.owner_name}</span>
                          ) : (
                            <span className="text-sm font-bold italic" style={{ color: textMuted }}>{t.unassigned}</span>
                          )}
                        </td>
                        <td className="p-4 flex flex-wrap items-center justify-center gap-3">
                          {(isSupervisor && isUnowned && complaint.status === 'Open') ? (
                            <button onClick={() => acceptComplaint(complaint.id)} className="px-4 py-1.5 rounded-lg text-white font-bold text-sm shadow-md active:scale-95 transition-all" style={{ backgroundColor: '#EFAD1E' }}>{t.accept}</button>
                          ) : (
                            <select 
                              value={complaint.status} onChange={(e) => updateStatus(complaint.id, e.target.value)} disabled={isAgent || (isSupervisor && !isOwner && !isUnowned)}
                              className="px-3 py-1.5 text-sm font-bold rounded-lg cursor-pointer outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ backgroundColor: style.bg, color: darkMode ? '#fff' : style.color, border: `1px solid ${style.border}` }}
                            >
                              <option value="Open" disabled={!isAdmin && complaint.status !== 'Open'}>🔴 Open</option>
                              <option value="In progress" disabled={isAgent}>🟡 In progress</option>
                              <option value="Completed" disabled={isAgent}>🟣 Completed</option>
                              <option value="Closed" disabled={isAgent}>🔵 Closed</option>
                              <option value="Reopen">🔴 Reopen</option> 
                            </select>
                          )}
                          <button onClick={() => openDetailsModal(complaint)} className="px-3 py-1.5 rounded-lg text-white font-bold text-sm shadow-md active:scale-95 transition-all" style={{ backgroundColor: '#CF278D' }}>{t.details}</button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* নতুন কমপ্লেন তৈরি পপ-আপ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" style={{ backgroundColor: cardBg }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(53,72,148,0.05)' }}>
              <h2 className="text-2xl font-extrabold">{t.createTitle}</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="font-bold text-xl px-3 py-1 rounded-lg transition-all" style={{ color: '#EE3D5E', backgroundColor: inputBg }}>✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateComplaint} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold mb-2">{t.name}</label>
                    <input required name="customer_name" type="text" className="w-full p-3 border rounded-xl outline-none focus:border-pink-500 transition-all" style={{ backgroundColor: inputBg, color: textColor, borderColor }} placeholder={t.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">{t.contact}</label>
                    <input required name="customer_contact" type="text" className="w-full p-3 border rounded-xl outline-none focus:border-pink-500 transition-all" style={{ backgroundColor: inputBg, color: textColor, borderColor }} placeholder={t.contact} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.issue}</label>
                  <select required name="title" className="w-full p-3 border rounded-xl outline-none focus:border-pink-500 transition-all" style={{ backgroundColor: inputBg, color: textColor, borderColor }}>
                    <option value="">{t.selectOpt}</option>
                    <option value="পেমেন্ট ও রিফান্ড">পেমেন্ট বা রিফান্ড সংক্রান্ত সমস্যা</option>
                    <option value="কোর্স সাবস্ক্রিপশন">কোর্স কিনলেও এক্সেস পাচ্ছি না</option>
                    <option value="লাইভ ক্লাস">লাইভ ক্লাসে যোগ দিতে সমস্যা</option>
                    <option value="ভিডিও প্লেব্যাক">ভিডিও চলছে বাফারিং হচ্ছে বা চলছে না</option>
                    <option value="অ্যাপ লগইন">অ্যাপে লগইন করতে পারছি না</option>
                    <option value="অন্যান্য">অন্যান্য সমস্যা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">{t.desc}</label>
                  <textarea required name="description" rows={4} className="w-full p-3 border rounded-xl outline-none focus:border-pink-500 transition-all resize-none" style={{ backgroundColor: inputBg, color: textColor, borderColor }} placeholder={t.desc}></textarea>
                </div>
                <button type="submit" disabled={createLoading} className="w-full text-white font-extrabold text-lg p-4 rounded-xl active:scale-95 transition-all disabled:opacity-50 shadow-md" style={{ backgroundColor: '#CF278D' }}>
                  {createLoading ? t.loading : t.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* বিস্তারিত ও নোটস পপ-আপ */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" style={{ backgroundColor: cardBg }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor, backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(53,72,148,0.05)' }}>
              <h2 className="text-2xl font-bold">{t.detailTitle}</h2>
              <button onClick={() => setSelectedComplaint(null)} className="font-bold text-xl px-3 py-1 rounded-lg transition-all" style={{ color: '#EE3D5E', backgroundColor: inputBg }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6" style={{ backgroundColor: themeBg }}>
              <div className="p-6 rounded-2xl border shadow-sm h-fit" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="font-bold text-lg mb-4 border-b pb-2" style={{ color: '#CF278D', borderColor }}>{t.custInfo}</h3>
                <div className="space-y-4">
                  <div><p className="text-xs font-bold" style={{ color: textMuted }}>{t.name}</p><p className="font-semibold">{selectedComplaint.customer_name}</p></div>
                  <div><p className="text-xs font-bold" style={{ color: textMuted }}>{t.contact}</p><p className="font-semibold">{selectedComplaint.customer_contact}</p></div>
                  <div><p className="text-xs font-bold" style={{ color: textMuted }}>{t.issue}</p><p className="font-semibold">{selectedComplaint.title}</p></div>
                  <div><p className="text-xs font-bold mb-1" style={{ color: textMuted }}>{t.desc}</p><div className="p-3 rounded-xl text-sm border whitespace-pre-wrap" style={{ backgroundColor: inputBg, borderColor }}>{selectedComplaint.description}</div></div>
                </div>
              </div>
              <div className="flex flex-col h-full rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
                <h3 className="font-bold text-lg p-4 border-b" style={{ color: '#CF278D', borderColor, backgroundColor: darkMode ? 'rgba(207,39,141,0.1)' : 'rgba(207,39,141,0.05)' }}>{t.intNotes}</h3>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[40vh]">
                  {loadingNotes && notes.length === 0 ? <p className="text-center font-medium py-4" style={{ color: textMuted }}>Loading...</p> : notes.length === 0 ? <p className="text-center font-medium py-4" style={{ color: textMuted }}>{t.noNotes}</p> : notes.map((note, index) => (
                    <div key={index} className="p-3 rounded-xl border" style={{ backgroundColor: inputBg, borderColor }}>
                      <div className="flex justify-between items-center mb-1"><span className="font-bold text-sm">{note.author_name} <span className="text-xs opacity-70">({note.author_role})</span></span><span className="text-xs" style={{ color: textMuted }}>{new Date(note.created_at).toLocaleDateString('bn-BD')}</span></div>
                      <p className="text-sm">{note.content || note.note_text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{ borderColor, backgroundColor: darkMode ? 'rgba(0,0,0,0.1)' : '#F9FAFB' }}>
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder={t.writeNote} className="w-full p-3 rounded-xl border focus:outline-none focus:border-pink-500 text-sm mb-3 resize-none" rows={2} style={{ backgroundColor: cardBg, color: textColor, borderColor }} />
                  <button onClick={handleAddNote} disabled={loadingNotes} className="w-full py-2.5 rounded-xl text-white font-bold transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: '#CF278D' }}>
                    {loadingNotes ? 'সেভ হচ্ছে...' : t.saveNote}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
