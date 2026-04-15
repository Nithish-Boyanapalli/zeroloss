import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Registration from './pages/Registration'
import WorkerDashboard from './pages/WorkerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PolicyPage from './pages/PolicyPage'
import Landing from './pages/Landing'
import BusinessModel from './pages/BusinessModel'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import Profile from './pages/Profile'
import WorkerPolicies from './pages/WorkerPolicies'
import WorkerClaims from './pages/WorkerClaims'
import BottomNav from './components/ui/BottomNav'

// ── SESSION HELPERS (localStorage) ──
export const session = {
  save: (workerId, workerName) => {
    localStorage.setItem('zl_worker_id', workerId)
    localStorage.setItem('zl_worker_name', workerName)
  },
  get: () => ({
    id:   localStorage.getItem('zl_worker_id'),
    name: localStorage.getItem('zl_worker_name'),
  }),
  clear: () => {
    localStorage.removeItem('zl_worker_id')
    localStorage.removeItem('zl_worker_name')
  },
  exists: () => !!localStorage.getItem('zl_worker_id'),
}

// ── ADMIN PIN (Simple Demo Protection) ──
export const adminSession = {
  PIN: '2026',
  login:    () => sessionStorage.setItem('zl_admin', 'true'),
  logout:   () => sessionStorage.removeItem('zl_admin'),
  isLoggedIn: () => sessionStorage.getItem('zl_admin') === 'true',
}

// ── SMART LANDING (Auto-Redirect) ──
function SmartLanding() {
  const nav = useNavigate()
  useEffect(() => {
    if (session.exists()) nav(`/worker/${session.get().id}`, { replace: true })
  }, [nav])
  return <Landing />
}

// ── ADMIN GUARD (PIN Protection) ──
function AdminGuard({ children }) {
  const nav = useNavigate()
  if (adminSession.isLoggedIn()) return children

  const handlePin = () => {
    const pin = prompt('Enter Admin PIN:')
    if (pin === adminSession.PIN) {
      adminSession.login()
      window.location.reload()
    } else {
      alert('Incorrect PIN')
      nav('/')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-6 font-sans">
      <div className="bg-slate-900 p-10 rounded-[2rem] border border-slate-800 text-center max-w-sm w-full mx-4 shadow-2xl">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
          <span className="text-blue-500 text-2xl">🔐</span>
        </div>
        <h2 className="text-white text-2xl font-black mb-2 tracking-tight">Admin Access</h2>
        <p className="text-slate-400 text-sm mb-8 font-medium">ZeroLoss Operations Terminal</p>
        <button onClick={handlePin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all hover:-translate-y-1 shadow-lg shadow-blue-900/20">
          Enter PIN →
        </button>
        <p className="text-slate-500 text-xs mt-6 font-bold tracking-widest uppercase">Demo PIN: 2026</p>
      </div>
    </div>
  )
}

// ── MAIN LAYOUT ──
function AppLayout() {
  const location = useLocation()
  const isWorkerRoute = location.pathname.startsWith('/worker/')
  const workerId = isWorkerRoute ? location.pathname.split('/')[2] : null

  return (
    <div className="w-full min-h-screen bg-slate-50 relative">
      <Routes>
        {/* Public */}
        <Route path="/"          element={<SmartLanding />} />
        <Route path="/register"  element={<Registration />} />
        <Route path="/policy/:id" element={<PolicyPage />} />

        {/* Worker */}
        <Route path="/worker/:id"           element={<WorkerDashboard />} />
        <Route path="/worker/:id/policies"  element={<WorkerPolicies />} />
        <Route path="/worker/:id/claims"    element={<WorkerClaims />} />
        <Route path="/worker/:id/profile"   element={<Profile />} />

        {/* Admin */}
        <Route path="/admin"           element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/analytics" element={<AdminGuard><AnalyticsDashboard /></AdminGuard>} />
        <Route path="/business"        element={<AdminGuard><BusinessModel /></AdminGuard>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {isWorkerRoute && workerId && <BottomNav workerId={workerId} />}
    </div>
  )
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>
}