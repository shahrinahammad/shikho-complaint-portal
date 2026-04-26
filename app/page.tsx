'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export default function ShikhoComplaintForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formElement = e.currentTarget;
    
    try {
      const formData = new FormData(formElement)
      
      const { error } = await supabase.from('complaints').insert({
        title: formData.get('title'),
        description: formData.get('description'),
        customer_name: formData.get('customer_name'),
        customer_contact: formData.get('customer_contact'),
        status: 'Open'
      })

      if (error) {
        setErrorMsg('Supabase Error: ' + error.message)
      } else {
        setSuccess(true)
        formElement.reset()
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err: any) {
      setErrorMsg('System Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: 'rgba(53,72,148,0.05)' }}>
      <div className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Shikho Logo" className="h-20 mx-auto mb-4 object-contain" />
          
          <h1 className="text-3xl font-extrabold" style={{ color: '#354894' }}>Shikho Complaint Portal</h1>
          <p className="mt-2 font-medium" style={{ color: 'rgba(53,72,148,0.7)' }}>আমাদের শিখো প্ল্যাটফর্মে আপনার যেকোনো সমস্যার কথা জানান।</p>
        </div>
        
        {success && (
          <div className="mb-6 p-4 rounded-xl text-center font-semibold animate-bounce border" style={{ backgroundColor: 'rgba(239,173,30,0.1)', color: '#354894', borderColor: '#EFAD1E' }}>
            ✨ আপনার কমপ্লেনটি সফলভাবে শিখো টিমের কাছে পৌঁছেছে!
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl text-center font-semibold border text-white" style={{ backgroundColor: '#EE3D5E', borderColor: '#EE3D5E' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#354894' }}>শিক্ষার্থীর নাম</label>
              <input required name="customer_name" type="text" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all" style={{ outlineColor: '#CF278D' }} placeholder="আপনার পুরো নাম লিখুন" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#354894' }}>মোবাইল নম্বর / ইমেইল</label>
              <input required name="customer_contact" type="text" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all" style={{ outlineColor: '#CF278D' }} placeholder="নম্বর বা ইমেইল দিন" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#354894' }}>সমস্যার ধরণ বেছে নিন</label>
            <select required name="title" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all" style={{ outlineColor: '#CF278D', color: '#354894' }}>
              <option value="">নিচের যেকোনো একটি অপশন বেছে নিন...</option>
              <option value="পেমেন্ট ও রিফান্ড">পেমেন্ট বা রিফান্ড সংক্রান্ত সমস্যা</option>
              <option value="কোর্স সাবস্ক্রিপশন">কোর্স কিনলেও এক্সেস পাচ্ছি না</option>
              <option value="লাইভ ক্লাস">লাইভ ক্লাসে যোগ দিতে সমস্যা</option>
              <option value="ভিডিও প্লেব্যাক">ভিডিও চলছে বাফারিং হচ্ছে বা চলছে না</option>
              <option value="অ্যাপ লগইন">অ্যাপে লগইন করতে পারছি না</option>
              <option value="কুইজ ও রেজাল্ট">কুইজ সাবমিট বা রেজাল্টে সমস্যা</option>
              <option value="নোটস ও শিট">নোটস বা লেকচার শিট ডাউনলোড হচ্ছে না</option>
              <option value="অ্যাকাউন্ট ভেরিফিকেশন">মোবাইল নম্বর বা ইমেইল ভেরিফিকেশন</option>
              <option value="মেন্টর সাপোর্ট">মেন্টরদের সাথে যোগাযোগ করতে পারছি না</option>
              <option value="প্রমোশনাল অফার">ডিসকাউন্ট কোড বা অফার কাজ করছে না</option>
              <option value="অন্যান্য">অন্যান্য সমস্যা</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#354894' }}>বিস্তারিত বলুন</label>
            <textarea required name="description" rows={5} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all" style={{ outlineColor: '#CF278D' }} placeholder="আপনার সমস্যার কথা এখানে বিস্তারিতভাবে লিখুন..."></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full text-white font-extrabold text-lg p-4 rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none" style={{ backgroundColor: '#CF278D', boxShadow: '0 4px 14px rgba(207,39,141,0.4)' }}>
            {loading ? 'প্রসেসিং হচ্ছে...' : 'কমপ্লেন সাবমিট করুন'}
          </button>
        </form>
      </div>
    </div>
  )
}
