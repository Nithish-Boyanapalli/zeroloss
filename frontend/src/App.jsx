import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Registration from './pages/Registration'
import WorkerDashboard from './pages/WorkerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PolicyPage from './pages/PolicyPage'
import Landing from './pages/Landing'

export default function App() {
  return (
    <BrowserRouter>
      {/* The 'mobile-container' class ensures the app looks like a phone app even on big screens */}
      <div className="mobile-container overflow-x-hidden">
        <Routes>
          <Route path="/"               element={<Landing />} />
          <Route path="/register"       element={<Registration />} />
          <Route path="/worker/:id"     element={<WorkerDashboard />} />
          <Route path="/policy/:id"     element={<PolicyPage />} />
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="*"               element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}