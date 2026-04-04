import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Brain, TrendingUp, ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react'

const features = [
  { icon: Shield, title: 'Parametric Shield', desc: 'No paperwork. No phone calls. Auto-triggered by rainfall, AQI, and local disruptions.' },
  { icon: Zap, title: 'Instant UPI Payout', desc: 'The moment a disruption threshold is crossed, your benefit is sent to your UPI ID.' },
  { icon: Brain, title: 'AI-Powered Pricing', desc: 'Our XGBoost engine calculates your premium based on 11 real-time Indian risk factors.' },
  { icon: CheckCircle2, title: 'Fraud-Free Tech', desc: 'Isolation Forest AI monitors every settlement, ensuring 100% trust for our partners.' },
]

const stats = [
  { value: '₹49', label: 'Starts Weekly' },
  { value: '<3s', label: 'Payout Time' },
  { value: '8+', label: 'City Triggers' },
  { value: '0', label: 'Manual Steps' },
]

export default function Landing() {
  const nav = useNavigate()
  
  return (
    <div className="min-vh-100 bg-white">
      {/* Premium Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center max-w-[480px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-lg font-black text-slate-900 tracking-tight">ZeroLoss</span>
        </div>
        <button 
          className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
          onClick={() => nav('/admin')}
        >
          ADMIN
        </button>
      </nav>

      <main className="max-w-[480px] mx-auto pb-20">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 animate-bounce">
            <span className="text-blue-400">✦</span> DEVTrails Hackathon 2026
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
            Zero Income Loss.<br />
            <span className="text-blue-600">Guaranteed.</span>
          </h1>
          
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 px-4">
            Smart parametric insurance for <span className="text-slate-900 font-bold">Zomato, Swiggy, & Blinkit</span> partners. We pay you instantly when weather or city issues stop your work.
          </p>

          <div className="space-y-3 px-2">
            <button 
              className="btn-primary !py-4 shadow-xl shadow-blue-200 group"
              onClick={() => nav('/register')}
            >
              Protect My Earnings
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Trusted by 5,000+ Delivery Partners
            </p>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div key={s.label} className={`p-5 rounded-[24px] border border-slate-100 shadow-sm ${i === 0 ? 'bg-blue-600 text-white border-none' : 'bg-white text-slate-900'}`}>
                <div className={`text-2xl font-black mb-1 ${i === 0 ? 'text-white' : 'text-blue-600'}`}>{s.value}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-blue-100' : 'text-slate-400'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section className="px-6 py-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">How ZeroLoss Works</h3>
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-5 p-5 bg-slate-50 rounded-[28px] border border-slate-100 items-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-blue-600">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Localized Footer */}
        <footer className="mt-10 px-8 py-10 bg-slate-900 rounded-t-[40px] text-center">
          <div className="flex justify-center gap-2 mb-4">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">ZeroLoss</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Made for the Indian Gig Economy</p>
          <div className="flex justify-center gap-4 text-white/50 mb-8">
             <Smartphone size={20} />
             <Shield size={20} />
             <Zap size={20} />
          </div>
          <p className="text-slate-600 text-[10px] font-medium">
            © 2026 ZeroLoss InsurTech. <br/>
            An Enterprise RAG Project Concept.
          </p>
        </footer>
      </main>
    </div>
  )
}