import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle, Smartphone, User, Mail, Wallet, Zap } from 'lucide-react'
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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calcPreview = async () => {
    setLoading(true); setError('')
    try {
      const r = await policiesAPI.calculatePremium({
        city: form.city, platform: form.platform,
        weekly_hours: form.weekly_hours,
        avg_weekly_income: form.avg_weekly_income,
      })
      setPreview(r.data); setStep(2)
    } catch { setError('Network Error: Could not reach the calculation engine.') }
    finally { setLoading(false) }
  }

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const wr = await workersAPI.register({
        ...form,
        weekly_hours: parseInt(form.weekly_hours),
        avg_daily_orders: parseInt(form.avg_daily_orders),
        avg_weekly_income: parseFloat(form.avg_weekly_income),
      })
      const pr = await policiesAPI.create({ worker_id: wr.data.id, auto_renew: true })
      setWorker(wr.data); setPolicy(pr.data); setStep(3)
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed. Check your details.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-vh-100 bg-slate-50 flex flex-col items-center p-4">
      {/* Header & Stepper */}
      <div className="w-full max-w-[480px] pt-4 mb-6">
        <button onClick={() => nav('/')} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Create Account</h1>
            <p className="text-xs font-bold text-blue-600 uppercase">Step {step} of 3</p>
          </div>
          <Shield size={32} className="text-blue-600" />
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {/* ── Step 1: Input Form ── */}
      {step === 1 && (
        <div className="w-full max-w-[480px] space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <section className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Personal Details</h2>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={18}/></span>
                <input className="input !pl-12" placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
                <input className="input !pl-14" type="tel" placeholder="Phone Number" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18}/></span>
                <input className="input !pl-12" type="email" placeholder="Email Address" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"><Wallet size={18}/></span>
                <input className="input !pl-12 border-blue-100 bg-blue-50/30" placeholder="UPI ID (e.g. name@okaxis)" value={form.upi_id} onChange={e => set('upi_id', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Work Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <select className="select" value={form.city} onChange={e => set('city', e.target.value)}>
                {CITIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <select className="select" value={form.platform} onChange={e => set('platform', e.target.value)}>
                {PLATFORMS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
            
            {/* Fix 5: Restored 3-column grid including Daily Orders */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 ml-2">HOURS/WK</label>
                <input className="input mt-1" type="number" value={form.weekly_hours} onChange={e => set('weekly_hours', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 ml-2">DAILY ORD</label>
                <input className="input mt-1" type="number" value={form.avg_daily_orders} onChange={e => set('avg_daily_orders', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 ml-2">INCOME (₹)</label>
                <input className="input mt-1" type="number" value={form.avg_weekly_income} onChange={e => set('avg_weekly_income', e.target.value)} />
              </div>
            </div>
          </section>

          <button className="btn-primary !py-4 shadow-lg shadow-blue-200" onClick={calcPreview} disabled={loading || !form.name || !form.phone}>
            {loading ? 'Analyzing Risks...' : 'View Personalized Quote →'}
          </button>
        </div>
      )}

      {/* ── Step 2: Premium Preview ── */}
      {step === 2 && preview && (
        <div className="w-full max-w-[480px] space-y-5 animate-in fade-in slide-in-from-right-4">
          <div className="bg-slate-900 rounded-[32px] p-8 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-40"></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Smart Quote Generated</p>
            <h2 className="text-5xl font-black mb-2 currency">{preview.weekly_premium}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase">Weekly Subscription</p>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-center gap-8">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Max Benefit</p>
                <p className="text-lg font-black currency">{preview.coverage_amount?.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Risk Level</p>
                <p className="text-lg font-black text-orange-400 uppercase">{preview.risk_level}</p>
              </div>
            </div>
          </div>

          {/* Fix 6: Restored all 6 risk tiles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Risk Score',       `${(preview.risk_score*100).toFixed(1)}%`],
              ['Risk Level',        preview.risk_level?.toUpperCase()],
              ['Weather Risk',     `${(preview.weather_risk_score*100).toFixed(0)}%`],
              ['Flood Risk',       `${(preview.flood_risk_score*100).toFixed(0)}%`],
              ['AQI Threat',       `${(preview.aqi_risk_score*100).toFixed(0)}%`],
              ['Disruption Prob',  `${(preview.disruption_probability*100).toFixed(0)}%`],
            ].map(([label, val]) => (
              <div key={label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                <p className="text-xl font-black text-slate-800 mt-1">{val}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
            <Zap className="text-indigo-600 shrink-0" size={18} />
            <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
              Our XGBoost AI modeled this premium based on weather trends in <b>{form.city}</b> and your <b>{form.platform}</b> delivery history.
            </p>
          </div>

          {/* Fix 7.2: Error Display */}
          {error && (
            <p style={{ color:'#ef4444', fontSize:'0.8rem', marginBottom:'0.5rem', textAlign:'center' }}>{error}</p>
          )}

          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Edit Details</button>
            <button className="btn-primary flex-[2] !py-4 shadow-xl shadow-blue-200" onClick={submit} disabled={loading}>
              {loading ? 'Activating...' : 'Pay & Start Protection'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && worker && policy && (
        <div className="w-full max-w-[480px] text-center animate-in zoom-in-95 duration-500">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">You're Protected!</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
              Namaste {worker.name.split(' ')[0]}, your ZeroLoss Shield is now active. Instant payouts will be sent to <b>{worker.upi_id || 'your UPI ID'}</b>.
            </p>

            {/* Fix 7.1: Restored detailed policy summary block */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-3 mb-8">
              {[
                ['Policy Holder',  worker.name],
                ['Weekly Premium', `₹${parseFloat(policy.weekly_premium).toFixed(2)}`],
                ['Weekly Benefit', `₹${parseFloat(policy.coverage_amount).toLocaleString('en-IN')}`],
                ['Risk Level',      policy.risk_level?.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">{k}</span>
                  <span className="text-slate-900 font-black">{v}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary !py-4 shadow-lg shadow-blue-200" onClick={() => nav(`/worker/${worker.id}`)}>
              Go to My Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}