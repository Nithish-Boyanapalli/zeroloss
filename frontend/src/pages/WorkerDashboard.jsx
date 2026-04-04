import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Zap, TrendingUp, Clock, AlertTriangle, CheckCircle, IndianRupee, MapPin, Smartphone } from 'lucide-react'
import { workersAPI, disruptionsAPI } from '../services/api'

const StatusBadge = ({ s }) => {
  const map = {
    paid: 'green', approved: 'green', auto_triggered: 'blue',
    fraud_review: 'yellow', rejected: 'red',
  }
  return <span className={`badge badge-${map[s] || 'gray'}`}>{s.replace(/_/g, ' ')}</span>
}

export default function WorkerDashboard() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  useEffect(() => {
    workersAPI.dashboard(id)
      .then(r => setData(r.data))
      .catch(() => nav('/'))
      .finally(() => setLoading(false))
  }, [id, nav])

  const triggerScan = async () => {
    if (!data) return
    setScanning(true); setScanResult(null)
    try {
      const r = await disruptionsAPI.scan(data.worker.city)
      setScanResult(r.data)
      const updated = await workersAPI.dashboard(id)
      setData(updated.data)
    } catch { setScanResult({ error: true }) }
    finally { setScanning(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-vh-100 bg-slate-50">
      <div className="shimmer w-64 h-8 rounded-lg" />
    </div>
  )

  if (!data) return null

  const { worker, active_policy, total_claims, total_paid_out, recent_claims } = data

  return (
    <div className="pb-28">
      {/* Top Header - Indian Branding */}
      <header className="p-5 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 leading-tight">ZeroLoss</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Partner Safety</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <div className="pulse-dot bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-700">Policy Active</span>
        </div>
      </header>

      <main className="p-4 space-y-5">
        {/* Profile Card */}
        <div className="flex justify-between items-start pt-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Namaste, {worker.name}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Smartphone size={12} /> {worker.platform.toUpperCase()}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <MapPin size={12} /> {worker.city.charAt(0).toUpperCase() + worker.city.slice(1)}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Clock size={12} /> {worker.weekly_hours} hrs/wk
              </span>
            </div>
          </div>
        </div>

        {/* Scan Result Notification - Indian Context */}
        {scanResult && !scanResult.error && (
          <div className={`p-4 rounded-2xl border-2 animate-in fade-in slide-in-from-top-4 duration-300 ${scanResult.claims_created > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex gap-3">
              {scanResult.claims_created > 0 ? <CheckCircle className="text-emerald-600 shrink-0" /> : <Zap className="text-blue-600 shrink-0" />}
              <div>
                <p className={`text-sm font-bold ${scanResult.claims_created > 0 ? 'text-emerald-900' : 'text-blue-900'}`}>
                  {scanResult.claims_created > 0 
                    ? `Disruption Detected: ${scanResult.events?.join(', ')}` 
                    : `Weather is clear in ${scanResult.city}`}
                </p>
                <p className="text-xs mt-1 text-slate-600 font-medium">
                  {scanResult.claims_created > 0 
                    ? `Auto-payout initiated to your UPI ID: ${worker.upi_id}`
                    : `No disruptions found. Your earnings are safe.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bento Grid Stats */}
        <div className="bento-grid !p-0">
          <div className="bento-item border-l-4 border-l-blue-600">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium</p>
            <h2 className="text-xl font-black text-slate-900 mt-1">₹{parseFloat(active_policy?.weekly_premium || 0).toFixed(2)}</h2>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">WEEKLY BILL</p>
          </div>
          <div className="bento-item border-l-4 border-l-emerald-600">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coverage</p>
            <h2 className="text-xl font-black text-slate-900 mt-1">₹{parseFloat(active_policy?.coverage_amount || 0).toLocaleString('en-IN')}</h2>
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">MAX LIMIT</p>
          </div>
          <div className="bento-item">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claims</p>
            <h2 className="text-xl font-black text-slate-900 mt-1">{total_claims}</h2>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">SUBMITTED</p>
          </div>
          <div className="bento-item bg-indigo-600 border-none">
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Total Payout</p>
            <h2 className="text-xl font-black text-white mt-1">₹{total_paid_out.toLocaleString('en-IN')}</h2>
            <p className="text-[9px] font-bold text-indigo-200 mt-0.5 tracking-tighter">TRANSFERRED</p>
          </div>
        </div>

        {/* Active Policy / Risk Shield */}
        {active_policy && (
          <div className="bg-slate-900 rounded-[28px] p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                Live Risk Shield
              </h3>
              <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">
                {active_policy.risk_level}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Weather Risk</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-orange-400 leading-none">{(active_policy.weather_risk_score * 100).toFixed(0)}%</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mb-1 overflow-hidden">
                    <div className="bg-orange-400 h-full rounded-full" style={{ width: `${active_policy.weather_risk_score * 100}%` }} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">AQI Risk (Delhi/NCR)</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-emerald-400 leading-none">{(active_policy.aqi_risk_score * 100).toFixed(0)}%</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mb-1 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${active_policy.aqi_risk_score * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Valid Until</p>
                <p className="text-sm font-bold tracking-tight date-format">{active_policy.end_date}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Policy ID</p>
                <p className="text-sm font-bold tracking-tight opacity-70">#LSS-{id.slice(0, 5).toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Claims History List */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Recent Settlements</h3>
            <button className="text-[10px] font-bold text-blue-600 uppercase underline decoration-2 underline-offset-4">View All</button>
          </div>
          
          <div className="space-y-3">
            {recent_claims.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <p className="text-xs font-bold text-slate-400">No claims detected yet. Your earnings are protected.</p>
              </div>
            ) : (
              recent_claims.map(c => (
                <div key={c.id} className="bg-white border border-slate-100 p-4 rounded-[20px] flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <IndianRupee size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Auto-Payout</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase date-format">
                        {new Date(c.triggered_at).toLocaleDateString('en-IN')} • {new Date(c.triggered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">+₹{parseFloat(c.claim_amount).toLocaleString('en-IN')}</p>
                    <StatusBadge s={c.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button - Mobile Thumb Zone */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent max-w-[480px] mx-auto z-50">
        <button 
          className="btn-primary shadow-xl shadow-blue-200 active:scale-95 transition-transform" 
          onClick={triggerScan} 
          disabled={scanning}
        >
          {scanning ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Environment...</span>
            </div>
          ) : (
            <>
              <Zap size={20} className="fill-white" />
              <span>Simulate Disruption</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}