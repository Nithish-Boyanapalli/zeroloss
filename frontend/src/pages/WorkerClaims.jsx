import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, IndianRupee, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { claimsAPI } from '../services/api'

// Status badge helper for Claims
const ClaimBadge = ({ status }) => {
  const map = {
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2 },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2 },
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock },
    fraud_review: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: AlertTriangle }
  }
  const config = map[status] || map.pending
  const Icon = config.icon

  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={10} strokeWidth={3} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default function WorkerClaims() {
  const { id } = useParams()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    claimsAPI.getByWorker(id)
      .then(res => setClaims(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-24">
      <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Settlements</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Automated Claims History</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-4">
        {claims.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center">
            <FileText size={40} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-1">No Claims Yet</h3>
            <p className="text-sm text-slate-500 font-medium">Your earnings are currently protected. Any weather payouts will appear here instantly.</p>
          </div>
        ) : (
          claims.map(claim => (
            <div key={claim.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                    <IndianRupee size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">₹{parseFloat(claim.claim_amount).toLocaleString('en-IN')}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Auto-Payout
                    </p>
                  </div>
                </div>
                <ClaimBadge status={claim.status} />
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Date Triggered</span>
                  <span className="font-black text-slate-700">
                    {new Date(claim.triggered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Trigger Event</span>
                  <span className="font-black text-slate-700 uppercase">
                    {claim.trigger_type || 'Weather Anomaly'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}