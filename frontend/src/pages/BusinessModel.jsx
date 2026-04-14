import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, TrendingUp, IndianRupee, Users, Shield, Zap, PieChart } from 'lucide-react'

export default function BusinessModel() {
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-20">
      
      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-white leading-tight text-xl">ZeroLoss</h2>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Pitch Deck & Economics</p>
            </div>
          </div>
          <button 
            onClick={() => nav('/')} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Exit Pitch
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 lg:pt-16">
        
        {/* Header */}
        <div className="text-center mb-16 lg:mb-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            The Business of <span className="text-blue-500">Protection.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            A sustainable, scalable parametric insurance model designed for the 15 million+ gig workers driving Bharat's economy.
          </p>
        </div>

        {/* ── SECTION 1: MARKET SIZING (TAM/SAM/SOM) ── */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Target className="text-blue-500" size={28} />
            <h2 className="text-2xl font-black text-white">Market Opportunity</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TAM */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full opacity-20 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">TAM (Total Addressable Market)</p>
              <h3 className="text-4xl font-black text-white mb-2">₹12,000 Cr</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">All Indian Gig Workers</p>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                ~15 Million total gig and platform workers in India by 2026. Assuming an average potential premium spend of ₹8,000/year for comprehensive income protection.
              </p>
            </div>

            {/* SAM */}
            <div className="bg-blue-900/20 border border-blue-900/30 p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-800/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-bl-full opacity-10 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">SAM (Serviceable Available)</p>
              <h3 className="text-4xl font-black text-white mb-2">₹2,800 Cr</h3>
              <p className="text-sm font-bold text-blue-300/80 uppercase tracking-wider mb-4">Top Tier City Delivery</p>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                ~3.5 Million food & grocery delivery partners (Zomato, Swiggy, Blinkit) in top 10 metropolitan areas highly susceptible to extreme weather disruptions.
              </p>
            </div>

            {/* SOM */}
            <div className="bg-blue-600 border border-blue-500 p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-blue-900/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-full opacity-10 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">SOM (Year 1 Target)</p>
              <h3 className="text-4xl font-black text-white mb-2">₹40 Cr</h3>
              <p className="text-sm font-bold text-white/90 uppercase tracking-wider mb-4">Initial Capture (100k Users)</p>
              <p className="text-sm text-blue-100 leading-relaxed font-medium">
                Targeting 100,000 highly active delivery partners in Hyderabad, Bangalore, and Mumbai with our core ₹99/week parametric weather shield.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: UNIT ECONOMICS ── */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <PieChart className="text-emerald-500" size={28} />
            <h2 className="text-2xl font-black text-white">Unit Economics (Per Worker)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-6 rounded-[1.5rem] border border-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Premium</p>
              <h3 className="text-3xl font-black text-white mb-1">₹99</h3>
              <p className="text-xs text-slate-400 font-medium">Average starting tier</p>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-[1.5rem] border border-slate-800">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Customer Acquisition (CAC)</p>
              <h3 className="text-3xl font-black text-white mb-1">₹45</h3>
              <p className="text-xs text-slate-400 font-medium">Extremely low via B2B2C integration</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[1.5rem] border border-slate-800">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Expected Claim Rate</p>
              <h3 className="text-3xl font-black text-white mb-1">12%</h3>
              <p className="text-xs text-slate-400 font-medium">Based on 5-year monsoon data</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-[1.5rem] border border-slate-800 border-b-4 border-b-emerald-500">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Est. Lifetime Value (LTV)</p>
              <h3 className="text-3xl font-black text-emerald-400 mb-1">₹1,850</h3>
              <p className="text-xs text-emerald-400/70 font-medium">3-year retention model</p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: REVENUE MODEL ── */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <IndianRupee className="text-amber-500" size={28} />
            <h2 className="text-2xl font-black text-white">How ZeroLoss Makes Money</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Stream 1 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem]">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-black text-white mb-3">1. Platform Tech Fee</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                ZeroLoss operates as a Managing General Agent (MGA). We take a flat <strong className="text-white">15% platform commission</strong> on all premiums collected for operating the AI risk engine and triggering the smart contracts, passing the remaining risk pool to our underwriting partners.
              </p>
            </div>

            {/* Revenue Stream 2 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem]">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black text-white mb-3">2. B2B SaaS Licensing</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Our "Parametric-as-a-Service" API can be licensed directly to gig platforms (like Swiggy/Zomato). They pay a <strong className="text-white">SaaS usage fee</strong> to offer our insurance natively inside their own driver apps, increasing their driver retention.
              </p>
            </div>

            {/* Revenue Stream 3 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem]">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-black text-white mb-3">3. Premium Float Interest</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Since gig workers pay weekly premiums upfront, and payouts only occur during specific weather events (monsoon season), we generate short-term <strong className="text-white">treasury yield (float)</strong> on the capital held in the escrow pool before claims are settled.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}