import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, Calendar, AlertCircle } from 'lucide-react'
import { policiesAPI } from '../services/api'

export default function WorkerPolicies() {
  const { id } = useParams()
  const nav = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    policiesAPI.getByWorker(id)
      .then(res => setPolicies(res.data))
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">My Policies</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Coverage History</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-4">
        {policies.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center flex flex-col items-center">
            <Shield size={40} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-900 mb-1">No Policies Found</h3>
            <p className="text-sm text-slate-500 font-medium">You don't have any active or past insurance policies yet.</p>
          </div>
        ) : (
          policies.map(policy => (
            <div key={policy.id} className={`bg-white rounded-[1.5rem] border overflow-hidden shadow-sm transition-all ${policy.status === 'active' ? 'border-emerald-200 hover:shadow-emerald-900/5 hover:border-emerald-300' : 'border-slate-200'}`}>
              <div className="p-5 flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${policy.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">ZeroLoss Weekly</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      ID: #LSS-{policy.id.slice(0, 6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${policy.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {policy.status}
                </span>
              </div>
              
              <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Calendar size={12} /> Valid Until
                  </p>
                  <p className="text-sm font-black text-slate-700">{policy.end_date}</p>
                </div>
                
                <button 
                  onClick={() => nav(`/policy/${policy.id}`)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}