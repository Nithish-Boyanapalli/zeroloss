import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Brain, ArrowRight, CheckCircle2, User, Smartphone } from 'lucide-react'
import { session } from '../App'

const features = [
  { icon: Shield, title: 'Parametric Shield', desc: 'No paperwork. No phone calls. Auto-triggered by rainfall, AQI, and local disruptions.' },
  { icon: Zap, title: 'Instant UPI Payout', desc: 'The moment a disruption threshold is crossed, your benefit is sent to your UPI ID.' },
  { icon: Brain, title: 'AI-Powered Pricing', desc: 'Our XGBoost engine calculates your premium based on 11 real-time Indian risk factors.' },
  { icon: CheckCircle2, title: 'Fraud-Free Tech', desc: 'Isolation Forest AI monitors every settlement, ensuring 100% trust for our partners.' },
]

export default function Landing() {
  const nav = useNavigate()
  const existingSession = session.get()
  const isReturning = session.exists()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav('/')}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 leading-tight text-xl">ZeroLoss</h2>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Income Protection</p>
            </div>
          </div>
          <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest" onClick={() => nav('/admin')}>
            Admin Portal
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Copy & Actions */}
        <div className="w-full lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 shadow-sm">
             <span className="text-blue-400">✦</span> DEVTrails Hackathon 2026
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            Zero Income Loss.<br/>
            <span className="text-blue-600">Guaranteed.</span>
          </h1>
          
          <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
            Smart parametric insurance for <strong className="text-slate-900">Zomato, Swiggy, & Blinkit</strong> partners. 
            We pay you instantly when weather or city issues stop your work.
          </p>

          <div className="space-y-4 max-w-md">
            {isReturning ? (
              <>
                <button 
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95" 
                  onClick={() => nav(`/worker/${existingSession.id}`)}
                >
                  <User size={20} /> Open {existingSession.name?.split(' ')[0]}'s Dashboard <ArrowRight size={20} />
                </button>
                <button 
                  className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors uppercase tracking-widest"
                  onClick={() => { session.clear(); window.location.reload() }}
                >
                  Not {existingSession.name?.split(' ')[0]}? Switch account
                </button>
              </>
            ) : (
              <>
                <button 
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95" 
                  onClick={() => nav('/register')}
                >
                  Protect My Earnings <ArrowRight size={20} />
                </button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Trusted by 5,000+ Delivery Partners
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right: Feature Grid */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
                  <Icon size={24} />
                </div>
                <h3 className="font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Premium Fintech Footer */}
      <footer className="bg-slate-950 pt-20 pb-10 px-6 border-t border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Shield size={24} className="text-white" />
                </div>
                <span className="text-3xl font-black text-white tracking-tight">ZeroLoss</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                Designed for Bharat's last mile. We provide AI-powered parametric insurance that guarantees income for delivery partners when extreme weather strikes.
              </p>
              <div className="flex gap-6 text-slate-500">
                  <Smartphone size={22} className="hover:text-blue-400 cursor-pointer transition-colors" />
                  <Shield size={22} className="hover:text-blue-400 cursor-pointer transition-colors" />
                  <Zap size={22} className="hover:text-blue-400 cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Support & Help</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer">24/7 WhatsApp Support</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer">Claims FAQ</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer">Grievance Redressal</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Legal & Compliance</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer">IRDAI Guidelines</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><span onClick={() => nav('/admin')} className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2">Admin Portal <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">Secure</span></span></li>
                <li><span className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> System Status</span></li>
              </ul>
            </div>
          </div>
          <div className="w-full pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2"><span>© 2026 ZeroLoss InsurTech.</span><span className="hidden sm:inline text-slate-700">|</span> <span>AI-Powered Parametric Insurance.</span></p>
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">DEVTrails Hackathon 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}