import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Phone, Mail, Wallet, Shield, MapPin, Briefcase, LogOut, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { workersAPI, policiesAPI } from '../services/api'
import { session } from '../App'

export default function Profile() {
  const { id } = useParams()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [worker, setWorker] = useState(null)
  const [activePolicy, setActivePolicy] = useState(null)
  
  // Editable form state
  const [form, setForm] = useState({
    phone: '',
    email: '',
    upi_id: ''
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [workerRes, policiesRes] = await Promise.all([
          workersAPI.get(id),
          policiesAPI.getByWorker(id)
        ])
        
        const wData = workerRes.data
        setWorker(wData)
        setForm({
          phone: wData.phone || '',
          email: wData.email || '',
          upi_id: wData.upi_id || ''
        })

        // Find the active policy if they have one
        const active = policiesRes.data.find(p => p.status === 'active')
        setActivePolicy(active || null)
        
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      await workersAPI.update(id, form)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
        <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  )

  if (!worker) return null

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      
      {/* ── Top Header ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">My Profile</h1>
          <button 
            onClick={() => { session.clear(); nav('/'); }}
            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-8 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{worker.name}</h2>
          
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Briefcase size={14} className="text-blue-500" /> {worker.platform}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wider">
              <MapPin size={14} className="text-blue-500" /> {worker.city}
            </span>
          </div>
        </div>

        {/* Protection Status Banner */}
        <div className={`p-5 rounded-[1.5rem] border flex items-center gap-4 ${activePolicy ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${activePolicy ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-0.5">Coverage Status</p>
            <p className={`text-lg font-black ${activePolicy ? 'text-emerald-700' : 'text-slate-700'}`}>
              {activePolicy ? 'Active & Protected' : 'No Active Policy'}
            </p>
          </div>
        </div>

        {/* Editable Details Form */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Contact & Payment Details</h3>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Phone size={18}/></span>
              <input 
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" 
                type="tel" 
                value={form.phone} 
                onChange={(e) => setForm({...form, phone: e.target.value})}
              />
            </div>

            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={18}/></span>
              <input 
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            {/* UPI ID is highlighted because it's crucial for payouts */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Wallet size={18}/></span>
              <input 
                className="w-full h-14 bg-blue-50/50 border border-blue-200 rounded-2xl pl-12 pr-4 text-blue-900 font-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-blue-400/70" 
                placeholder="UPI ID for Payouts"
                value={form.upi_id} 
                onChange={(e) => setForm({...form, upi_id: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 font-bold mt-2 ml-2 uppercase tracking-wide">
                * All automated claims will be sent to this UPI ID
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="px-4 py-8 text-center border-t border-slate-200 mt-8">
           <button className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto">
             <AlertCircle size={14} /> Delete Account & Data
           </button>
        </div>

      </main>
    </div>
  )
}