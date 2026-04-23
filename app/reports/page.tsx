'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toPng, toBlob } from 'html-to-image'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function MegaReportsPage() {
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<any[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [lang, setLang] = useState<'bn' | 'en'>('bn')
  const [darkMode, setDarkMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return; }

      // 🛡️ সিকিউরিটি চেক: এজেন্টদের ব্লক করা
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role === 'Agent') {
        alert('অ্যাক্সেস ডিনাইড! এই পেজটি শুধুমাত্র ম্যানেজমেন্টের (Admin/Supervisor) জন্য।')
        window.location.href = '/dashboard'
        return
      }

      const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
      if (data) setComplaints(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredData = complaints.filter(c => {
    const cDate = new Date(c.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return cDate >= start && cDate <= end;
  });

  const stats = {
    total: filteredData.length,
    statusCount: {
      Open: filteredData.filter(c => c.status === 'Open').length,
      InProgress: filteredData.filter(c => c.status === 'In progress').length,
      Completed: filteredData.filter(c => c.status === 'Completed').length,
      Closed: filteredData.filter(c => c.status === 'Closed').length,
      Reopen: filteredData.filter(c => c.status === 'Reopen').length,
    },
    supervisor: {} as any,
    logCount: {} as any
  };

  filteredData.forEach(c => {
    if (c.owner_name) {
      if (!stats.supervisor[c.owner_name]) stats.supervisor[c.owner_name] = 0;
      stats.supervisor[c.owner_name]++;
    }
    const creator = c.created_by_name || 'Customer Form';
    if (!stats.logCount[creator]) stats.logCount[creator] = 0;
    stats.logCount[creator]++;
  });

  const handleDownloadImage = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById('snap-section');
      if (!element) return;
      const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: darkMode ? '#1e1e2f' : '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Shikho_Report_${startDate}_to_${endDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে!');
    }
    setIsExporting(false)
  }

  const handleCopyImage = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById('snap-section');
      if (!element) return;
      const blob = await toBlob(element, { cacheBust: true, backgroundColor: darkMode ? '#1e1e2f' : '#ffffff', pixelRatio: 2 });
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('✅ ছবি সফলভাবে কপি হয়েছে! এখন WhatsApp-এ গিয়ে পেস্ট (Ctrl + V) করুন।');
      }
    } catch (err) {
      alert('⚠️ আপনার ব্রাউজার এই ফিচারটি সাপোর্ট করছে না। দয়া করে Download বাটনটি ব্যবহার করুন।');
    }
    setIsExporting(false)
  }

  if (loading) return <div className="text-center p-10 font-bold text-xl text-indigo-600">লোড হচ্ছে...</div>

  const themeBg = darkMode ? '#121212' : '#f0f2f5';
  const cardBg = darkMode ? '#1e1e2f' : '#ffffff';
  const textColor = darkMode ? '#e0e0e0' : '#354894';

  return (
    <div className="min-h-screen p-4 transition-all" style={{ backgroundColor: themeBg, color: textColor }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center p-4 rounded-2xl shadow-sm mb-6 border" style={{backgroundColor: cardBg, borderColor: darkMode ? '#374151' : '#F3F4F6'}}>
          <img src="/logo.png" alt="Logo" className="h-10" />
          <div className="flex gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg border" style={{borderColor: darkMode ? '#374151' : '#F3F4F6', backgroundColor: darkMode ? '#2A2A3C' : '#F9FAFB'}}>{darkMode ? '☀️' : '🌙'}</button>
            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="px-4 py-2 rounded-lg font-bold border" style={{borderColor: darkMode ? '#374151' : '#F3F4F6', backgroundColor: darkMode ? '#2A2A3C' : '#F9FAFB'}}>{lang === 'bn' ? 'ENG' : 'বাংলা'}</button>
            <button onClick={() => window.location.href='/dashboard'} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Dashboard</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 p-4 rounded-xl shadow-sm border" style={{backgroundColor: cardBg, borderColor: darkMode ? '#374151' : '#F3F4F6'}}>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded-lg outline-none w-full" style={{backgroundColor: darkMode ? '#2A2A3C' : '#F9FAFB', color: textColor, borderColor: darkMode ? '#374151' : '#E5E7EB'}} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded-lg outline-none w-full" style={{backgroundColor: darkMode ? '#2A2A3C' : '#F9FAFB', color: textColor, borderColor: darkMode ? '#374151' : '#E5E7EB'}} />
        </div>

        {/* --- WhatsApp Sharing Buttons --- */}
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold">WhatsApp Report Snapshot</h3>
          <div className="flex gap-3">
            <button onClick={handleCopyImage} disabled={isExporting} className="px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
              {isExporting ? 'প্রসেস হচ্ছে...' : '📋 Copy for WhatsApp'}
            </button>
            <button onClick={handleDownloadImage} disabled={isExporting} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
              {isExporting ? 'প্রসেস হচ্ছে...' : '📸 Download Image'}
            </button>
          </div>
        </div>

        {/* WHATSAPP SNAPSHOT CARD */}
        <div id="snap-section" className="p-8 rounded-[35px] shadow-2xl border-2 mb-10 overflow-hidden relative" style={{backgroundColor: cardBg, borderColor: '#35489420', color: textColor}}>
          <div className="flex justify-between items-center mb-10">
             <img src="/logo.png" alt="Shikho" className="h-14" />
             <div className="text-right">
               <h2 className="text-2xl font-black uppercase" style={{color: '#CF278D'}}>Performance Report</h2>
               <p className="text-sm font-bold opacity-60">{startDate} to {endDate}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {Object.entries(stats.statusCount).map(([status, count], i) => (
              <div key={i} className="p-5 rounded-3xl text-center border" style={{backgroundColor: darkMode ? '#2A2A3C' : '#F9FAFB', borderColor: darkMode ? '#374151' : '#F3F4F6'}}>
                <p className="text-xs font-black uppercase opacity-60">{status}</p>
                <p className="text-4xl font-black" style={{color: '#354894'}}>{count}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-black text-sm mb-4 uppercase tracking-widest opacity-50">Status Distribution</h3>
              <div className="space-y-4">
                {Object.entries(stats.statusCount).map(([status, count], i) => {
                   const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                   return (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-black mb-1"><span>{status}</span><span>{count}</span></div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{backgroundColor: darkMode ? '#374151' : '#E5E7EB'}}>
                        <div className="h-full rounded-full" style={{width: `${pct}%`, backgroundColor: i % 2 === 0 ? '#CF278D' : '#354894'}}></div>
                      </div>
                    </div>
                   )
                })}
              </div>
            </div>

            <div>
              <h3 className="font-black text-sm mb-4 uppercase tracking-widest opacity-50">Supervisor Load</h3>
              <div className="space-y-4">
                {Object.entries(stats.supervisor).length === 0 ? <p className="text-xs italic">No assignments yet</p> : 
                  Object.entries(stats.supervisor).map(([name, count]: any, i) => {
                   const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                   return (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-black mb-1"><span>{name}</span><span>{count}</span></div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{backgroundColor: darkMode ? '#374151' : '#E5E7EB'}}>
                        <div className="h-full bg-amber-500 rounded-full" style={{width: `${pct}%`}}></div>
                      </div>
                    </div>
                   )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* COMPLAINT LOGGED REPORT */}
        <div className="p-6 rounded-3xl shadow-sm border" style={{backgroundColor: cardBg, borderColor: darkMode ? '#374151' : '#E5E7EB'}}>
          <h3 className="text-xl font-black mb-6">Staff Performance (Who logged the complaints)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.logCount).map(([name, count]: any, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl border" style={{backgroundColor: darkMode ? '#2A2A3C' : '#F9FAFB', borderColor: darkMode ? '#374151' : '#E5E7EB'}}>
                <span className="font-bold">{name}</span>
                <span className="px-4 py-1 rounded-xl shadow-sm font-black text-indigo-600" style={{backgroundColor: darkMode ? '#1e1e2f' : '#ffffff'}}>{count} logged</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}