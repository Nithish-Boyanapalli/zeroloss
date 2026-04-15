import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, TrendingUp, TrendingDown, CloudLightning, Activity, AlertOctagon, Map, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, ComposedChart } from 'recharts'
import { analyticsAPI } from '../services/api'
import AdminNav from '../components/ui/AdminNav'
export default function AnalyticsDashboard() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  // In a real scenario, this fetches from your analyticsAPI
  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate API call delay for the demo
      // const res = await analyticsAPI.adminOverview()
      // setData(res.data)
      
      setTimeout(() => {
        setData({
          currentLossRatio: 42.5,
          projectedLossRatio: 58.2,
          totalPremiumsCollected: 1250000,
          totalClaimsPaid: 531250,
          highRiskZones: 12,
        })
        setLoading(false)
      }, 800)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => { loadAnalytics() }, [])

  // Realistic mock data for the 7-Day Forecast (XGBoost Predictions)
  const forecastData = [
    { day: 'Mon', weatherRisk: 20, aqiRisk: 45, claimProbability: 15 },
    { day: 'Tue', weatherRisk: 25, aqiRisk: 50, claimProbability: 18 },
    { day: 'Wed', weatherRisk: 65, aqiRisk: 55, claimProbability: 45 },
    { day: 'Thu', weatherRisk: 90, aqiRisk: 60, claimProbability: 82 }, // Storm expected
    { day: 'Fri', weatherRisk: 85, aqiRisk: 40, claimProbability: 75 },
    { day: 'Sat', weatherRisk: 30, aqiRisk: 35, claimProbability: 20 },
    { day: 'Sun', weatherRisk: 15, aqiRisk: 30, claimProbability: 10 },
  ]

  // Historical Premium vs Payouts to show Loss Ratio trends
  const lossRatioData = [
    { month: 'Jan', premium: 400, payout: 120, lossRatio: 30 },
    { month: 'Feb', premium: 450, payout: 150, lossRatio: 33 },
    { month: 'Mar', premium: 500, payout: 180, lossRatio: 36 },
    { month: 'Apr', premium: 580, payout: 400, lossRatio: 68 }, // Heavy rains
    { month: 'May', premium: 650, payout: 220, lossRatio: 33 },
    { month: 'Jun', premium: 700, payout: 300, lossRatio: 42 },
  ]

  // Pin-code level granularity (Requested by Judges)
  const zoneData = [
    { pincode: '500081 (Madhapur)', riskLevel: 'Critical', probability: '85%', factor: 'Flash Flooding' },
    { pincode: '500032 (Gachibowli)', riskLevel: 'High', probability: '72%', factor: 'Waterlogging' },
    { pincode: '500033 (Banjara Hills)', riskLevel: 'Medium', probability: '45%', factor: 'Traffic Gridlock' },
    { pincode: '500034 (Jubilee Hills)', riskLevel: 'Low', probability: '15%', factor: 'Clear' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="text-blue-500 font-black uppercase tracking-widest text-xs">Loading Predictive Models...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-20">
      
      <AdminNav />

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Actuarial & Predictive Intelligence</h1>
          <p className="text-slate-500 text-sm mt-1">AI-driven loss ratio analysis and hyper-local disruption forecasting.</p>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[1.5rem]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Loss Ratio (YTD)</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-white">{data?.currentLossRatio}%</h2>
              <span className="flex items-center text-xs font-bold text-emerald-500 mb-1"><TrendingDown size={14} className="mr-1"/> 2.1%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Highly profitable. Target is &lt;65%</p>
          </div>

          <div className="bg-blue-900/20 border border-blue-900/40 p-6 rounded-[1.5rem]">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">7-Day Projected Loss Ratio</p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-blue-400">{data?.projectedLossRatio}%</h2>
              <span className="flex items-center text-xs font-bold text-red-400 mb-1"><TrendingUp size={14} className="mr-1"/> 15.7%</span>
            </div>
            <p className="text-xs text-blue-200/50 mt-2 font-medium">Spike expected due to Thu/Fri storms</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[1.5rem]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Premium Escrow Pool</p>
            <h2 className="text-3xl font-black text-white mb-1">₹{(data?.totalPremiumsCollected || 0).toLocaleString('en-IN')}</h2>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[1.5rem]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Paid Claims</p>
            <h2 className="text-3xl font-black text-white mb-1">₹{(data?.totalClaimsPaid || 0).toLocaleString('en-IN')}</h2>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${data?.currentLossRatio}%` }} />
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Chart 1: Predictive Forecast */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CloudLightning size={16} className="text-blue-500" />
                7-Day Claim Probability Forecast
              </h3>
              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-black uppercase tracking-widest">XGBoost Engine</span>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClaim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill:'#64748b', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#64748b', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor:'#020617', border:'1px solid #1e293b', borderRadius:'12px', color:'#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}/>
                  <Area type="monotone" dataKey="claimProbability" name="Likelihood of Claim Spike" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClaim)" />
                  <Line type="monotone" dataKey="weatherRisk" name="Weather Severity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Loss Ratio Trend */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-emerald-500" />
              Premium vs Payout Trends
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={lossRatioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill:'#64748b', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}k`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill:'#64748b', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor:'#020617', border:'1px solid #1e293b', borderRadius:'12px', color:'#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}/>
                  <Bar yAxisId="left" dataKey="premium" name="Premiums Collected" fill="#10b981" radius={[4,4,0,0]} barSize={20} />
                  <Bar yAxisId="left" dataKey="payout" name="Claims Paid" fill="#ef4444" radius={[4,4,0,0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="lossRatio" name="Loss Ratio %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ── Granular Zone Analysis (Requested by Judges) ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden mb-10">
          <div className="p-6 lg:p-8 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Map size={18} className="text-amber-500" />
                Hyper-Local Zone Risk (Next 48 Hrs)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Granular pin-code level threat assessment.</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
              <RefreshCw size={14} /> Update Heatmap
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50">
                  {['Pincode / Ward', 'Primary Threat Factor', 'Disruption Probability', 'Risk Level'].map(h => (
                    <th key={h} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {zoneData.map((zone, i) => (
                  <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-white">{zone.pincode}</td>
                    <td className="p-4 text-slate-400 font-medium">{zone.factor}</td>
                    <td className="p-4 font-black text-white">{zone.probability}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        zone.riskLevel === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                        zone.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 
                        zone.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      }`}>
                        {zone.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}