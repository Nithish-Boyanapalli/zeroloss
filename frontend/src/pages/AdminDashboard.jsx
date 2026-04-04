import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, FileText, AlertTriangle, Zap, TrendingUp, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminAPI, disruptionsAPI, claimsAPI } from '../services/api'

const CITIES = ['hyderabad','mumbai','delhi','bangalore','chennai','kolkata','pune']

export default function AdminDashboard() {
  const nav = useNavigate()
  const [dash, setDash]         = useState(null)
  const [fraud, setFraud]       = useState(null)
  const [loading, setLoading]   = useState(true)
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
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'#0f1117' }}>
      <div style={{ color:'#64748b' }}>Loading admin dashboard...</div>
    </div>
  )

  const disruptionData = dash?.recent_disruptions?.slice(0,6).map(d => ({
    name: d.type.replace(/_/g,' '),
    severity: parseFloat(d.severity?.toFixed(1)||0),
    threshold: parseFloat(d.threshold_value?.toFixed(1)||0),
  })) || []

  const riskPieData = [
    { name:'High Risk',   value: Math.floor((dash?.active_policies||0)*0.25), color:'#ef4444' },
    { name:'Medium Risk', value: Math.floor((dash?.active_policies||0)*0.55), color:'#f59e0b' },
    { name:'Low Risk',    value: Math.floor((dash?.active_policies||0)*0.20), color:'#10b981' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#0f1117' }}>
      {/* Top bar */}
      <div style={{ background:'#1a1d27', borderBottom:'1px solid #2a2d3d',
        padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <Shield size={22} color="#6366f1" />
          <span style={{ fontWeight:700 }}>ZeroLoss Admin</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn-secondary" onClick={() => nav('/register')}
            style={{ fontSize:'0.8rem' }}>+ New Worker</button>
          <button className="btn-secondary" onClick={load}
            style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'1.5rem' }}>
        <h1 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:'0.25rem' }}>
          Operations Dashboard
        </h1>
        <p style={{ color:'#64748b', fontSize:'0.875rem', marginBottom:'1.5rem' }}>
          Real-time view of all active policies, claims, and disruption events.
        </p>

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
          gap:'1rem', marginBottom:'1.5rem' }}>
          {[
            { label:'Total Workers',       value: dash?.total_workers||0,         icon:Users,       color:'#6366f1' },
            { label:'Active Policies',     value: dash?.active_policies||0,        icon:Shield,      color:'#10b981' },
            { label:'Claims Today',        value: dash?.total_claims_today||0,     icon:FileText,    color:'#f59e0b' },
            { label:'Fraud Review',        value: dash?.pending_fraud_review||0,   icon:AlertTriangle,color:'#ef4444' },
            { label:'Auto-Triggered',      value: dash?.auto_triggered_claims||0,  icon:Zap,         color:'#a78bfa' },
            { label:'Payouts Today (₹)',   value: `₹${(dash?.total_payouts_today||0).toLocaleString('en-IN')}`,
              icon:TrendingUp, color:'#10b981' },
          ].map(({ label, value, icon:Icon, color }) => (
            <div key={label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:'0.7rem', color:'#64748b', marginBottom:'0.4rem' }}>{label}</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:700, color }}>{value}</div>
                </div>
                <Icon size={16} color={color} style={{ opacity:0.7 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Trigger simulator */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontWeight:600, marginBottom:'1rem', display:'flex',
            alignItems:'center', gap:'0.5rem' }}>
            <Zap size={18} color="#f59e0b" /> Parametric Trigger Simulator
          </h2>
          <p style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:'1rem', lineHeight:1.6 }}>
            Scan a city for live disruptions. If thresholds are breached, claims are
            auto-created and payouts fired instantly — zero human intervention.
          </p>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <select className="select" value={scanCity}
              onChange={e => setScanCity(e.target.value)}
              style={{ maxWidth:'200px' }}>
              {CITIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            <button className="btn-primary" onClick={scanCity_} disabled={scanning}
              style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Zap size={14} />
              {scanning ? 'Scanning...' : `Scan ${scanCity.charAt(0).toUpperCase()+scanCity.slice(1)}`}
            </button>
          </div>

          {scanResult && !scanResult.error && (
            <div style={{ marginTop:'1rem', background:'#0f1117', border:'1px solid #2a2d3d',
              borderRadius:'8px', padding:'1rem', fontSize:'0.8rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',
                gap:'0.75rem' }}>
                {[
                  ['City',       scanResult.city],
                  ['Disruptions',scanResult.disruptions],
                  ['Policies',   scanResult.policies_found],
                  ['Claims',     scanResult.claims_created],
                  ['Payouts',    scanResult.payouts_sent],
                  ['Events',     scanResult.events?.join(', ') || 'none'],
                ].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ color:'#64748b', marginBottom:'0.2rem' }}>{k}</div>
                    <div style={{ fontWeight:500, color: k==='Payouts'&&v>0 ? '#10b981' : '#e2e8f0' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>

          {/* Disruption severity chart */}
          <div className="card">
            <h2 style={{ fontWeight:600, marginBottom:'1rem', fontSize:'0.9rem' }}>
              Recent Disruptions — Severity vs Threshold
            </h2>
            {disruptionData.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#4a5568', fontSize:'0.8rem' }}>
                No disruptions yet. Use the trigger simulator above.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={disruptionData} margin={{ top:0, right:10, left:0, bottom:40 }}>
                  <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:10 }}
                    angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }} />
                  <Tooltip
                    contentStyle={{ background:'#1a1d27', border:'1px solid #2a2d3d',
                      borderRadius:'8px', fontSize:'0.75rem' }} />
                  <Bar dataKey="severity"  fill="#6366f1" radius={[4,4,0,0]} name="Severity" />
                  <Bar dataKey="threshold" fill="#374151" radius={[4,4,0,0]} name="Threshold" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Risk distribution pie */}
          <div className="card">
            <h2 style={{ fontWeight:600, marginBottom:'1rem', fontSize:'0.9rem' }}>
              Policy Risk Distribution
            </h2>
            {(dash?.active_policies||0) === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#4a5568', fontSize:'0.8rem' }}>
                No active policies yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={riskPieData} dataKey="value" cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {riskPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#1a1d27', border:'1px solid #2a2d3d',
                      borderRadius:'8px', fontSize:'0.75rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', justifyContent:'center', gap:'1rem' }}>
                  {riskPieData.map(d => (
                    <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'0.4rem',
                      fontSize:'0.75rem', color:'#94a3b8' }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                      {d.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fraud alerts */}
        <div className="card">
          <h2 style={{ fontWeight:600, marginBottom:'1rem', display:'flex',
            alignItems:'center', gap:'0.5rem' }}>
            <AlertTriangle size={16} color="#ef4444" /> Fraud Alerts
          </h2>
          {!fraud?.claims?.length ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'#4a5568', fontSize:'0.875rem' }}>
              No fraud alerts. Isolation Forest model is monitoring all claims.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {fraud.claims.slice(0,5).map(c => (
                <div key={c.id} style={{ background:'#0f1117', border:'1px solid rgba(239,68,68,0.2)',
                  borderRadius:'8px', padding:'0.875rem',
                  display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
                  <div>
                    <div style={{ fontSize:'0.875rem', fontWeight:500 }}>
                      ₹{parseFloat(c.claim_amount).toFixed(2)} — Score: {(c.fraud_score*100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:'0.2rem' }}>
                      {c.fraud_reason || 'Anomaly detected by Isolation Forest'}
                    </div>
                  </div>
                  <span className="badge badge-red">{c.status.replace(/_/g,' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent disruptions table */}
        {dash?.recent_disruptions?.length > 0 && (
          <div className="card" style={{ marginTop:'1.5rem' }}>
            <h2 style={{ fontWeight:600, marginBottom:'1rem' }}>Recent Disruptions</h2>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2a2d3d' }}>
                    {['Type','City','Severity','Threshold','Triggered','Detected At'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'0.5rem 0.75rem',
                        color:'#64748b', fontWeight:500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dash.recent_disruptions.map(d => (
                    <tr key={d.id} style={{ borderBottom:'1px solid #1a1d27' }}>
                      <td style={{ padding:'0.625rem 0.75rem' }}>
                        {d.type.replace(/_/g,' ')}
                      </td>
                      <td style={{ padding:'0.625rem 0.75rem', textTransform:'capitalize' }}>{d.city}</td>
                      <td style={{ padding:'0.625rem 0.75rem', color:'#f59e0b' }}>
                        {d.severity} {d.unit}
                      </td>
                      <td style={{ padding:'0.625rem 0.75rem', color:'#64748b' }}>
                        {d.threshold_value}
                      </td>
                      <td style={{ padding:'0.625rem 0.75rem' }}>
                        <span className={`badge badge-${d.triggered?'green':'gray'}`}>
                          {d.triggered ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding:'0.625rem 0.75rem', color:'#64748b' }}>
                        {new Date(d.detected_at).toLocaleString('en-IN')}
                      </td>
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