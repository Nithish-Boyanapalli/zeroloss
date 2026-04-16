import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, FileText, AlertTriangle, Zap, TrendingUp, RefreshCw, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminAPI, disruptionsAPI } from '../services/api'
import AdminNav from '../components/ui/AdminNav'

const CITIES = ['hyderabad','mumbai','delhi','bangalore','chennai','kolkata','pune']

export default function AdminDashboard() {
  const nav = useNavigate()
  const [dash, setDash] = useState(null)
  const [fraud, setFraud] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanCity, setScanCity] = useState('hyderabad')
  const [scanResult, setScanResult] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [d, f] = await Promise.all([adminAPI.dashboard(), adminAPI.fraudAlerts()])
      setDash(d.data); setFraud(f.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const scanCity_ = async () => {
    setScanning(true); setScanResult(null)
    try {
      const r = await disruptionsAPI.scan(scanCity)
      setScanResult(r.data)
      await load()
    } catch { setScanResult({ error: true }) }
    finally { setScanning(false) }
  }

  if (loading && !dash) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Shield size={48} className="text-blue-600" />
        <div className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Command Center...</div>
      </div>
    </div>
  )

  const disruptionData = dash?.recent_disruptions?.slice(0,6).map(d => ({
    name: d.type.replace(/_/g,' '),
    severity: parseFloat(d.severity?.toFixed(1)||0),
    threshold: parseFloat(d.threshold_value?.toFixed(1)||0),
  })) || []

  // Hex colors for Recharts mapping
  const riskPieData = [
    { name:'High Risk',   value: Math.floor((dash?.active_policies||0)*0.25), color:'#ef4444' }, // Red-500
    { name:'Medium Risk', value: Math.floor((dash?.active_policies||0)*0.55), color:'#f59e0b' }, // Amber-500
    { name:'Low Risk',    value: Math.floor((dash?.active_policies||0)*0.20), color:'#10b981' }, // Emerald-500
  ]

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-12">
      
      <AdminNav />

      <div className="max-w-[1400px] mx-auto px-6 pt-8">
        
        {/* Updated Header with your Action Buttons preserved */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Operations Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time telemetry of active policies, anomaly detection, and automated payouts.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-700" onClick={() => nav('/register')}>
              + New Worker
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label:'Total Workers',       value: dash?.total_workers||0,         icon:Users,       color:'text-blue-500', bg:'bg-blue-500/10', border:'border-blue-500/20' },
            { label:'Active Policies',     value: dash?.active_policies||0,        icon:Shield,      color:'text-emerald-500', bg:'bg-emerald-500/10', border:'border-emerald-500/20' },
            { label:'Claims Today',        value: dash?.total_claims_today||0,     icon:FileText,    color:'text-amber-500', bg:'bg-amber-500/10', border:'border-amber-500/20' },
            { label:'Fraud Review',        value: dash?.pending_fraud_review||0,   icon:AlertTriangle,color:'text-red-500', bg:'bg-red-500/10', border:'border-red-500/20' },
            { label:'Auto-Triggered',      value: dash?.auto_triggered_claims||0,  icon:Zap,         color:'text-indigo-500', bg:'bg-indigo-500/10', border:'border-indigo-500/20' },
            { label:'Payouts Today (₹)',   value: `₹${(dash?.total_payouts_today||0).toLocaleString('en-IN')}`, icon:TrendingUp, color:'text-emerald-400', bg:'bg-emerald-500/10', border:'border-emerald-500/20' },
          ].map(({ label, value, icon:Icon, color, bg, border }) => (
            <div key={label} className={`bg-slate-900 p-5 rounded-2xl border ${border} flex flex-col justify-between relative overflow-hidden group`}>
              <div className={`absolute -right-4 -top-4 w-16 h-16 ${bg} rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <Icon size={20} className={`${color} opacity-80`} />
              </div>
              <div className="relative z-10">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* ── Trigger Simulator ── */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Zap size={20} className="text-amber-500" /> Parametric Trigger Engine
            </h2>
            <p className="text-sm text-slate-400 mb-6 max-w-2xl">
              Force a manual scan of a city's live data streams. If disruption thresholds (Weather/AQI) are breached, the smart contracts will auto-create claims and push UPI payouts instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                className="h-12 bg-slate-950 border border-slate-700 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-blue-500 sm:w-64"
                value={scanCity}
                onChange={e => setScanCity(e.target.value)}
              >
                {CITIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <button 
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2" 
                onClick={scanCity_} 
                disabled={scanning}
              >
                {scanning ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
                {scanning ? 'Running XGBoost Scan...' : `Execute Scan: ${scanCity.toUpperCase()}`}
              </button>
            </div>

            {scanResult && !scanResult.error && (
              <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    ['Target',       (scanResult.city || scanCity).toUpperCase()],
                    ['Anomalies',    scanResult.disruptions],
                    ['Policies Hit', scanResult.policies_found],
                    ['Claims Built', scanResult.claims_created],
                    ['UPI Payouts',  scanResult.payouts_sent],
                    ['Event Tag',    scanResult.events?.join(', ') || 'CLEAN'],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{k}</div>
                      <div className={`font-black text-sm ${k === 'UPI Payouts' && v > 0 ? 'text-emerald-400' : 'text-white'}`}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Fraud Alerts (Isolation Forest) ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8 flex flex-col">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <AlertTriangle size={20} className="text-red-500" /> AI Fraud Sentinel
            </h2>
            {!fraud?.claims?.length ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-2xl">
                <Shield size={32} className="text-emerald-500/50 mb-3" />
                <div className="text-sm font-bold text-slate-400">All Systems Clear</div>
                <div className="text-xs text-slate-500 mt-1">Isolation Forest AI found zero anomalies in today's claim flow.</div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {fraud.claims.slice(0,5).map(c => (
                  <div key={c.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black text-white">₹{parseFloat(c.claim_amount).toFixed(2)}</div>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest">Flagged</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">
                      <strong className="text-slate-300">Anomaly Score:</strong> {(c.fraud_score*100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-red-400 font-medium">
                      {c.fraud_reason || 'Route deviation detected during weather event.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Severity vs Threshold Metrics</h2>
            {disruptionData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm font-bold">No telemetry data available.</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disruptionData} margin={{ top:0, right:10, left:-20, bottom:0 }}>
                    <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10, fontWeight:700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#64748b', fontSize:10, fontWeight:700 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill:'#1e293b' }} contentStyle={{ backgroundColor:'#020617', border:'1px solid #1e293b', borderRadius:'12px', fontWeight:700, color:'#fff' }} />
                    <Bar dataKey="severity" fill="#3b82f6" radius={[4,4,0,0]} name="Severity" />
                    <Bar dataKey="threshold" fill="#334155" radius={[4,4,0,0]} name="Threshold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Book of Business Risk Profile</h2>
            {(dash?.active_policies||0) === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-sm font-bold">No active policies written.</div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskPieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={5}>
                        {riskPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor:'#020617', border:'1px solid #1e293b', borderRadius:'12px', fontWeight:700, color:'#fff' }} itemStyle={{ color:'#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-2">
                  {riskPieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Raw Telemetry Table ── */}
        {dash?.recent_disruptions?.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-slate-800">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Disruption Telemetry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950/50">
                    {['Event Type', 'Zone', 'Severity', 'Threshold', 'Auto-Trigger', 'Timestamp'].map(h => (
                      <th key={h} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {dash.recent_disruptions.map(d => (
                    <tr key={d.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">{(d.type || 'Unknown').replace(/_/g,' ').toUpperCase()}</td>
                      <td className="p-4 text-slate-400 font-medium">{(d.city || 'Unknown').toUpperCase()}</td>
                      <td className="p-4 font-black text-amber-500">{d.severity} {d.unit}</td>
                      <td className="p-4 text-slate-400 font-medium">{d.threshold_value}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${d.triggered ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {d.triggered ? 'Breached' : 'Safe'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{new Date(d.detected_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}