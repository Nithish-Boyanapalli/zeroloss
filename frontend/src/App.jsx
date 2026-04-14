import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Registration from './pages/Registration'
import WorkerDashboard from './pages/WorkerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PolicyPage from './pages/PolicyPage'
import Landing from './pages/Landing'
import BusinessModel from './pages/BusinessModel'
import AdminAnalytics from './pages/AnalyticsDashboard'
import Profile from './pages/Profile'
import WorkerPolicies from './pages/WorkerPolicies'
import WorkerClaims from './pages/WorkerClaims'
import BottomNav from './components/ui/BottomNav'

// Temporary placeholders for the components we are about to build
const Placeholder = ({ title }) => <div className="flex min-h-screen items-center justify-center font-bold text-2xl text-slate-400">{title} Component Coming Soon</div>

// Layout component handles injecting the Bottom Nav only on worker pages
function AppLayout() {
  const location = useLocation()
  
  // Check if we are on a worker page to show the bottom nav
  const isWorkerRoute = location.pathname.startsWith('/worker/')
  const workerId = isWorkerRoute ? location.pathname.split('/')[2] : null

  return (
    <div className="w-full min-h-screen bg-slate-50 relative">
      <Routes>
        <Route path="/"               element={<Landing />} />
        <Route path="/register"       element={<Registration />} />
        <Route path="/worker/:id"     element={<WorkerDashboard />} />
        <Route path="/policy/:id"     element={<PolicyPage />} />
        <Route path="/admin"          element={<AdminDashboard />} />
        
        {/* Phase 3 Routes - Ready to be built */}
        <Route path="/business"       element={<BusinessModel />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/worker/:id/profile" element={<Profile />} />
        <Route path="/worker/:id/claims" element={<WorkerClaims />} />
        <Route path="/worker/:id/policies" element={<WorkerPolicies />} />
        
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>

      {/* Inject PhonePe-style Bottom Nav if on a worker route */}
      {isWorkerRoute && workerId && <BottomNav workerId={workerId} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}