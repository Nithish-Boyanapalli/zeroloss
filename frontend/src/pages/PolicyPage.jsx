import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Download, Calendar, CheckCircle2, RefreshCw } from 'lucide-react'
import { policiesAPI } from '../services/api'

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
    <div className="flex items-center justify-center min-vh-100 bg-slate-50">
      <div className="shimmer w-48 h-6 rounded" />
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
    <div className="min-vh-100 bg-slate-50 pb-10">
      {/* Header Area */}
      <div className="max-w-[480px] mx-auto p-6">
        <button 
          onClick={() => nav(-1)} 
          className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
          {/* Top Visual Banner */}
          <div className="bg-blue-600 p-8 text-center text-white relative">
             <div className="absolute top-4 right-4 opacity-20">
                <Shield size={60} />
             </div>
             <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <CheckCircle2 size={28} className="text-white" />
             </div>
             <h1 className="text-xl font-black tracking-tight">Policy Certificate</h1>
             <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">ID: #LSS-{id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Details List */}
          <div className="p-6 space-y-1">
            {details.map((item, index) => (
              <div 
                key={item.label} 
                className={`flex justify-between items-center py-4 ${index !== details.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <item.icon size={16} className="text-slate-300" />}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                </div>
                
                {item.type === 'badge' ? (
                  <span className={`badge ${policy.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {item.value.toUpperCase()}
                  </span>
                ) : (
                  <span className={`text-sm font-black text-slate-900 ${item.label === 'Max Benefit' ? 'currency' : ''} ${item.label.includes('Risk') ? 'text-blue-600' : ''}`}>
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <button className="btn-secondary flex items-center justify-center gap-2 py-4">
                <Download size={18} />
                Download PDF Receipt
             </button>
             <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-tighter">
                Verified by Guidewire DEVTrails Node 2026
             </p>
          </div>
        </div>

        {/* Small Print for the Indian Context */}
        <div className="mt-8 px-4">
           <div className="flex gap-3 items-start opacity-60">
              <Shield size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                This policy covers income loss caused by weather events exceeding the 85th percentile, 
                AQI thresholds above 350, and local government-mandated disruptions. 
                Payouts are handled via NPCI/UPI gateways instantly.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}