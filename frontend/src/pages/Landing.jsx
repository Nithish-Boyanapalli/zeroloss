import { useNavigate } from 'react-router-dom'
import { Shield, Zap, Brain, ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* Premium Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 w-full transition-all">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav('/')}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-200">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">ZeroLoss</span>
          </div>
          <button 
            className="text-xs font-bold text-blue-700 bg-blue-50 px-6 py-2.5 rounded-full border border-blue-100 hover:bg-blue-100 hover:shadow-sm transition-all"
            onClick={() => nav('/admin')}
          >
            ADMIN ACCESS
          </button>
        </div>
      </nav>

      <main className="w-full">
        
        {/* HERO SECTION - Strictly split on Desktop, Stacked on Mobile */}
        <section className="bg-white border-b border-slate-100 relative overflow-hidden">
          {/* Subtle background glow for premium feel */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            
            {/* Left Column: Copy & CTAs */}
            <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-sm">
                <span className="text-blue-400">✦</span> DEVTrails Hackathon 2026
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
                Zero Income Loss.<br />
                <span className="text-blue-600">Guaranteed.</span>
              </h1>
              
              <p className="text-slate-600 font-medium text-lg sm:text-xl leading-relaxed max-w-2xl">
                Smart parametric insurance for <span className="text-slate-900 font-bold">Zomato, Swiggy, & Blinkit</span> partners. We pay you instantly when weather or city issues stop your work.
              </p>

              {/* Accessible Touch Targets */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <button 
                  className="min-h-[60px] px-8 text-lg font-bold rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group w-full sm:w-auto"
                  onClick={() => nav('/register')}
                >
                  Protect My Earnings
                  <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button className="min-h-[60px] px-8 text-lg font-bold rounded-2xl bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center w-full sm:w-auto">
                  How it Works
                </button>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Trusted by 5,000+ Partners
                </p>
              </div>
            </div>

            {/* Right Column: Visual/Stats */}
            <div className="w-full lg:w-[45%] flex justify-center lg:justify-end">
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {stats.map((s, i) => (
                  <div key={s.label} className={`p-6 rounded-[2rem] flex flex-col justify-center items-center text-center aspect-square transition-all hover:scale-105 ${i === 0 ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-white text-slate-900 border-2 border-slate-100 shadow-xl shadow-slate-200/20'}`}>
                    <div className={`text-4xl sm:text-5xl font-black mb-3 ${i === 0 ? 'text-white' : 'text-blue-600'}`}>{s.value}</div>
                    <div className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? 'text-blue-100' : 'text-slate-400'}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Advantage Section - Strict Responsive Grid */}
        <section className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center mb-16 lg:mb-20">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">ZeroLoss Advantage</h3>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Why Delivery Partners Choose Us</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col items-center text-center group">
                <div className="bg-slate-50 group-hover:bg-blue-50 p-5 rounded-2xl text-blue-600 mb-6 transition-colors duration-300">
                  <Icon size={32} />
                </div>
                <h4 className="font-black text-xl text-slate-900 mb-4">{title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 py-16 px-6 border-t border-slate-900">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Shield size={24} className="text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tight">ZeroLoss</span>
            </div>
            
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">Designed for Bharat's Last Mile</p>
            
            <div className="flex gap-8 text-slate-600 mb-12">
               <Smartphone size={24} className="hover:text-blue-400 cursor-pointer transition-colors" />
               <Shield size={24} className="hover:text-blue-400 cursor-pointer transition-colors" />
               <Zap size={24} className="hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
            
            <div className="w-full pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-500 text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>© 2026 ZeroLoss InsurTech.</span>
                <span className="hidden sm:inline text-slate-700">|</span> 
                <span>AI-Powered Parametric Insurance Platform.</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}