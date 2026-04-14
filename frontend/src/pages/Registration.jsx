import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle, User, Mail, Wallet, Zap, MapPin, Briefcase } from 'lucide-react'
import { workersAPI, policiesAPI } from '../services/api'

const CITIES = ['hyderabad', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'ahmedabad']
const PLATFORMS = ['swiggy', 'zomato', 'blinkit', 'amazon', 'zepto', 'other']

export default function Registration() {
  const nav = useNavigate()
  const [step, setStep] = useState(1) // 1=form, 2=preview, 3=done
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [worker, setWorker] = useState(null)
  const [policy, setPolicy] = useState(null)

  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: 'hyderabad',
    platform: 'swiggy', weekly_hours: 40,
    avg_daily_orders: 15, avg_weekly_income: 3500, upi_id: '',
  })

  // State to lock the quote exact values
  const [lockedQuote, setLockedQuote] = useState({
    premium: 0,
    benefit: 0,
    riskLevel: '',
    riskScore: 0
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calcPreview = async () => {
    setLoading(true); setError('')
    try {
      const r = await policiesAPI.calculatePremium({
        city: form.city, platform: form.platform,
        weekly_hours: form.weekly_hours,
        avg_weekly_income: form.avg_weekly_income,
      })
      
      setPreview(r.data);
      
      // LOCK THE EXACT DATA HERE so it doesn't recalculate later
      setLockedQuote({
        premium: r.data.weekly_premium,
        benefit: r.data.coverage_amount,
        riskLevel: r.data.risk_level,
        riskScore: r.data.risk_score
      });
      
      setStep(2)
    } catch { setError('Network Error: Could not reach the calculation engine.') }
    finally { setLoading(false) }
  }

  const submit = async () => {
    setLoading(true); setError('')
    try {
      // 1. Register the Worker
      const wr = await workersAPI.register({
        ...form,
        weekly_hours: parseInt(form.weekly_hours),
        avg_daily_orders: parseInt(form.avg_daily_orders),
        avg_weekly_income: parseFloat(form.avg_weekly_income),
      })
      
      // 2. Create the Policy using the LOCKED QUOTE
      const pr = await policiesAPI.create({ 
        worker_id: wr.data.id, 
        auto_renew: true,
        weekly_premium: lockedQuote.premium,
        coverage_amount: lockedQuote.benefit,
        risk_level: lockedQuote.riskLevel,
        risk_score: lockedQuote.riskScore
      })
      
      setWorker(wr.data); 
      setPolicy(pr.data); 
      setStep(3)
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed. Check your details.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* ── DESKTOP SPLIT: Left Branding Panel (Hidden on Mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-950 relative flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 cursor-pointer mb-16" onClick={() => nav('/')}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-md">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">ZeroLoss</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black leading-[1.2] mb-6">
            Your safety net <br/>
            <span className="text-blue-400">built for the road.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Join 5,000+ delivery partners who never lose a day's pay to heavy rain or bad AQI. Protect your income in under 2 minutes.
          </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <Zap className="text-blue-400" size={24} />
            <h3 className="font-bold text-lg">Instant AI Processing</h3>
          </div>
          <p className="text-sm text-slate-400">
            Our pricing engine calculates your specific route risks in real-time to offer the lowest possible premium.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: The Interactive Form ── */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto bg-slate-50">
        
        <div className="w-full max-w-[480px]">
          {/* Header & Stepper */}
          <div className="mb-10">
            <button onClick={() => nav('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {step === 1 ? 'Create Account' : step === 2 ? 'Your Quote' : 'Protection Active'}
                </h1>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">Step {step} of 3</p>
              </div>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          {/* ── Step 1: Input Form ── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Details</h2>
                <div className="space-y-4">
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><User size={20}/></span>
                    <input className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400" placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-600 transition-colors">+91</span>
                    <input className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400" type="tel" placeholder="Phone Number" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={20}/></span>
                    <input className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400" type="email" placeholder="Email Address" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Wallet size={20}/></span>
                    <input className="w-full h-14 bg-blue-50/50 border border-blue-200 rounded-2xl pl-12 pr-4 text-blue-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-blue-400/70" placeholder="UPI ID (e.g. name@okaxis)" value={form.upi_id} onChange={e => set('upi_id', e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Work Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={18}/></span>
                     <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none" value={form.city} onChange={e => set('city', e.target.value)}>
                       {CITIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                     </select>
                  </div>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Briefcase size={18}/></span>
                     <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none" value={form.platform} onChange={e => set('platform', e.target.value)}>
                       {PLATFORMS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                     </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 ml-1 mb-1 tracking-wider">HOURS/WK</label>
                    <input className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 text-center text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600" type="number" value={form.weekly_hours} onChange={e => set('weekly_hours', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 ml-1 mb-1 tracking-wider">DAILY ORD</label>
                    <input className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 text-center text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600" type="number" value={form.avg_daily_orders} onChange={e => set('avg_daily_orders', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 ml-1 mb-1 tracking-wider">INCOME (₹)</label>
                    <input className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 text-center text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600" type="number" value={form.avg_weekly_income} onChange={e => set('avg_weekly_income', e.target.value)} />
                  </div>
                </div>
              </section>

              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-bold text-center animate-in shake">
                  {error}
                </div>
              )}

              <button 
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                onClick={calcPreview} 
                disabled={loading || !form.name || !form.phone}
              >
                {loading ? 'Analyzing Risks...' : 'View Personalized Quote →'}
              </button>
            </div>
          )}

          {/* ── Step 2: Premium Preview ── */}
          {step === 2 && preview && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              
              {/* The "Credit Card" Premium Box */}
              <div className="bg-slate-950 rounded-[2rem] p-8 text-center text-white shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-30"></div>
                <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-20"></div>
                
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Smart Quote Generated</p>
                  <h2 className="text-6xl font-black mb-1 tracking-tighter">₹{preview.weekly_premium}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Weekly Subscription</p>
                  
                  <div className="pt-6 border-t border-white/10 flex justify-center gap-12">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Max Benefit</p>
                      <p className="text-xl font-black">₹{preview.coverage_amount?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Risk Level</p>
                      <p className={`text-xl font-black uppercase ${preview.risk_level === 'high' ? 'text-red-400' : preview.risk_level === 'medium' ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {preview.risk_level}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  ['Risk Score',      `${(preview.risk_score*100).toFixed(1)}%`],
                  ['Weather Risk',    `${(preview.weather_risk_score*100).toFixed(0)}%`],
                  ['Flood Risk',      `${(preview.flood_risk_score*100).toFixed(0)}%`],
                  ['AQI Threat',      `${(preview.aqi_risk_score*100).toFixed(0)}%`],
                  ['Disruption Prob', `${(preview.disruption_probability*100).toFixed(0)}%`],
                  ['Algorithm',       'XGBoost'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm text-center hover:border-blue-200 hover:shadow-md transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-lg font-black text-slate-800">{val}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-blue-50/50 rounded-[1.5rem] border border-blue-100 flex gap-4 items-center">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0">
                   <Zap size={20} />
                </div>
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  Our AI modeled this premium specifically for weather trends in <strong className="font-black text-blue-700">{form.city.toUpperCase()}</strong> based on your delivery history.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-bold text-center animate-in shake">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  className="w-full sm:w-1/3 h-14 bg-white text-slate-600 font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-50 transition-colors" 
                  onClick={() => setStep(1)}
                >
                  Edit Details
                </button>
                <button 
                  className="w-full sm:w-2/3 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50" 
                  onClick={submit} 
                  disabled={loading}
                >
                  {loading ? 'Activating...' : 'Pay & Start Protection'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && worker && policy && (
            <div className="text-center animate-in zoom-in-95 slide-in-from-bottom-8 duration-700 pt-8">
              <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl">
                
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50"></div>
                  <div className="relative bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center">
                    <CheckCircle size={48} className="text-emerald-600" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">You're Protected!</h2>
                <p className="text-base text-slate-500 font-medium leading-relaxed mb-10">
                  Namaste <strong className="text-slate-900">{worker.name.split(' ')[0]}</strong>, your ZeroLoss Shield is now fully active. Instant payouts will be sent securely to <strong className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{worker.upi_id || 'your UPI ID'}</strong>.
                </p>

                <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-4 mb-10 border border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Policy Summary</h3>
                  {[
                    ['Policy Holder',  worker.name],
                    ['Weekly Premium', `₹${parseFloat(policy.weekly_premium).toFixed(2)}`],
                    ['Weekly Benefit', `₹${parseFloat(policy.coverage_amount).toLocaleString('en-IN')}`],
                    ['Risk Level',      policy.risk_level?.toUpperCase()],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{k}</span>
                      <span className="text-sm text-slate-900 font-black">{v}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1" 
                  onClick={() => nav(`/worker/${worker.id}`)}
                >
                  Go to My Dashboard →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}