import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Zap, Clock, CheckCircle, IndianRupee, MapPin, Smartphone, Activity } from 'lucide-react'
import { workersAPI, disruptionsAPI } from '../services/api'

// Tailwind-safe color mapping (prevents CSS purging issues)
const StatusBadge = ({ s }) => {
  const map = {
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    auto_triggered: 'bg-blue-100 text-blue-800 border-blue-200',
    fraud_review: 'bg-orange-100 text-orange-800 border-orange-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  const colorClass = map[s] || 'bg-slate-100 text-slate-800 border-slate-200'
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colorClass}`}>
      {s.replace(/_/g, ' ')}
    </span>
  )
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 bg-blue-200 rounded-2xl"></div>
        <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  )

  if (!data) return null

  const { worker, active_policy, total_claims, total_paid_out, recent_claims } = data

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 lg:pb-8">
      
      {/* ── Top Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav('/')}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 leading-tight text-xl">ZeroLoss</h2>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Partner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black tracking-widest uppercase text-emerald-700">Protected</span>
          </div>
        </div>
      </nav>

      {/* ── Main Dashboard Layout ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Namaste, {worker.name}</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
              <Smartphone size={14} className="text-blue-500" /> {worker.platform.toUpperCase()}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
              <MapPin size={14} className="text-blue-500" /> {worker.city.toUpperCase()}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
              <Clock size={14} className="text-blue-500" /> {worker.weekly_hours} HRS/WK
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── LEFT COLUMN: Core Protection Data (65% width on PC) ── */}
          <div className="w-full lg:w-[65%] space-y-8">
            
            {/* The Live Risk Shield Card */}
            {active_policy && (
              <div className="bg-slate-950 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-40"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black flex items-center gap-2">
                      <Activity size={20} className="text-blue-400" />
                      Live Risk Shield
                    </h3>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${active_policy.risk_level === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : active_policy.risk_level === 'medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                      {active_policy.risk_level} Risk
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Weather Threat</p>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-orange-400 leading-none">{(active_policy.weather_risk_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${active_policy.weather_risk_score * 100}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AQI Threat</p>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-emerald-400 leading-none">{(active_policy.aqi_risk_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000" style={{ width: `${active_policy.aqi_risk_score * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Coverage Valid Until</p>
                      <p className="text-sm font-bold">{active_policy.end_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Policy ID</p>
                      <button 
                        onClick={() => nav(`/policy/${active_policy.id}`)}
                        className="text-sm font-black text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 justify-end underline decoration-blue-400/30 underline-offset-4"
                      >
                        #LSS-{id.slice(0, 6).toUpperCase()}
                        <span className="text-[10px] no-underline">↗</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm border-t-4 border-t-blue-600 hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Premium</p>
                <h2 className="text-2xl font-black text-slate-900">₹{parseFloat(active_policy?.weekly_premium || 0).toFixed(2)}</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Weekly Bill</p>
              </div>
              
              <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Benefit</p>
                <h2 className="text-2xl font-black text-slate-900">₹{parseFloat(active_policy?.coverage_amount || 0).toLocaleString('en-IN')}</h2>
                <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase">Guaranteed</p>
              </div>
              
              <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Claims</p>
                <h2 className="text-2xl font-black text-slate-900">{total_claims}</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Auto-Submitted</p>
              </div>
              
              <div className="bg-indigo-600 p-5 rounded-[1.5rem] shadow-md shadow-indigo-600/20 hover:shadow-lg transition-shadow">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Payout</p>
                <h2 className="text-2xl font-black text-white">₹{total_paid_out.toLocaleString('en-IN')}</h2>
                <p className="text-[9px] font-bold text-indigo-300 mt-1 uppercase tracking-widest">To UPI ID</p>
              </div>
            </div>

            {/* Scan Notifications */}
            {scanResult && !scanResult.error && (
              <div className={`p-6 rounded-[1.5rem] border-2 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm ${scanResult.claims_created > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${scanResult.claims_created > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {scanResult.claims_created > 0 ? <CheckCircle size={24} /> : <Zap size={24} />}
                  </div>
                  <div>
                    <p className={`text-base font-black ${scanResult.claims_created > 0 ? 'text-emerald-900' : 'text-blue-900'}`}>
                      {scanResult.claims_created > 0 
                        ? `Disruption Detected: ${scanResult.events?.join(', ')}` 
                        : `Clear conditions in ${worker.city.toUpperCase()}`}
                    </p>
                    <p className="text-sm mt-1 text-slate-600 font-medium">
                      {scanResult.claims_created > 0 
                        ? `Auto-payout initiated to your registered UPI ID.`
                        : `No disruptions found. Your daily earnings are secure.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Activity & Actions (35% width on PC) ── */}
          <div className="w-full lg:w-[35%] space-y-6">
            
            {/* Action Trigger - Hidden on Mobile (Mobile uses fixed bottom bar) */}
            <div className="hidden lg:block bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Environment Scanner</h3>
              <button 
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3" 
                onClick={triggerScan} 
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={22} className="fill-white" />
                    <span>Simulate Disruption</span>
                  </>
                )}
              </button>
            </div>

            {/* Claims Feed */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-full max-h-[600px] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Settlements</h3>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">View All</span>
              </div>
              
              <div className="space-y-4">
                {recent_claims.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <CheckCircle size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-500">No claims detected yet.</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Your earnings are protected.</p>
                  </div>
                ) : (
                  recent_claims.map(c => (
                    <div key={c.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center transition-all hover:border-blue-100 hover:shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 border border-slate-200 shadow-sm">
                          <IndianRupee size={18} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">Auto-Payout</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                            {new Date(c.triggered_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {new Date(c.triggered_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-emerald-600 mb-1">+₹{parseFloat(c.claim_amount).toLocaleString('en-IN')}</p>
                        <StatusBadge s={c.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── MOBILE ONLY: Floating Action Button ── */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent z-50">
        <button 
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-[0_8px_30px_rgb(37,99,235,0.3)] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3" 
          onClick={triggerScan} 
          disabled={scanning}
        >
          {scanning ? (
            <>
              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap size={22} className="fill-white" />
              <span>Simulate Disruption</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}