import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Download, Calendar, CheckCircle2, RefreshCw, Zap } from 'lucide-react'
import { policiesAPI } from '../services/api'

// Explicit Tailwind mapping for purge safety
const getBadgeStyles = (status) => {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

export default function PolicyPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [policy, setPolicy] = useState(null)

  useEffect(() => {
    policiesAPI.get(id)
      .then(r => setPolicy(r.data))
      .catch(() => nav('/'))
  }, [id, nav])

  if (!policy) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
          <Shield size={32} className="text-blue-300" />
        </div>
        <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  )

  const details = [
    { label: 'Policy Status', value: policy.status, type: 'badge' },
    { label: 'Weekly Premium', value: `₹${parseFloat(policy.weekly_premium).toFixed(2)}`, icon: RefreshCw },
    { label: 'Max Benefit', value: `₹${parseFloat(policy.coverage_amount).toLocaleString('en-IN')}`, icon: Shield },
    { label: 'Risk Score', value: `${(policy.risk_score * 100).toFixed(1)}%`, type: 'text' },
    { label: 'Risk Level', value: policy.risk_level?.toUpperCase(), type: 'text' },
    { label: 'Valid From', value: policy.start_date, icon: Calendar },
    { label: 'Valid Until', value: policy.end_date, icon: Calendar },
    { label: 'Auto-Renew', value: policy.auto_renew ? 'Enabled' : 'Disabled', type: 'text' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => nav(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* ── The Digital Certificate Card ── */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-blue-600 p-10 text-center text-white relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-2xl opacity-50"></div>
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
             <Shield size={120} className="absolute -right-4 top-4 text-blue-500/20 rotate-12" />
             
             <div className="relative z-10">
               <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg border border-white/20">
                  <CheckCircle2 size={32} className="text-white" />
               </div>
               <h1 className="text-2xl font-black tracking-tight mb-1">ZeroLoss Policy</h1>
               <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em]">Certificate ID: #LSS-{id.slice(0, 8).toUpperCase()}</p>
             </div>
          </div>

          {/* Policy Data Rows */}
          <div className="p-6 sm:p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-2">Coverage Details</h3>
            
            <div className="space-y-1">
              {details.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.icon ? <item.icon size={16} className="text-blue-500" /> : <div className="w-4" />}
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  
                  {item.type === 'badge' ? (
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getBadgeStyles(policy.status)}`}>
                      {item.value}
                    </span>
                  ) : (
                    <span className={`text-sm font-black text-slate-900 ${item.label === 'Max Benefit' ? 'text-lg text-emerald-600' : ''} ${item.label.includes('Risk') ? 'text-amber-500' : ''}`}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
             <button className="w-full h-14 bg-white text-slate-700 font-black text-sm rounded-xl border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95">
                <Download size={18} />
                Download PDF Receipt
             </button>
             <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] flex justify-center items-center gap-1.5 opacity-60">
                <Shield size={10} /> Verified by ZeroLoss Network
             </p>
          </div>
        </div>

        {/* ── Legal & Context Disclosures ── */}
        <div className="mt-8 px-2">
           <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex gap-3 items-start">
              <Zap size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-900/80 leading-relaxed font-medium">
                This parametric policy guarantees income protection against hyper-local weather events exceeding the 85th percentile, AQI thresholds above 350, and authorized city disruptions. All settlements are validated by our AI engine and executed instantly via NPCI/UPI gateways.
              </p>
           </div>
        </div>
      </div>

    </div>
  )
}