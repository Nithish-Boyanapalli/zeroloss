// frontend/src/components/ui/AdminNav.jsx
// Add this component to AdminDashboard, AnalyticsDashboard, and BusinessModel pages

import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, BarChart2, TrendingUp, LogOut } from 'lucide-react'
import { adminSession } from '../../App'

export default function AdminNav() {
  const nav = useNavigate()
  const location = useLocation()

  const tabs = [
    { name: 'Operations',  path: '/admin',            icon: Shield },
    { name: 'Analytics',   path: '/admin/analytics',  icon: BarChart2 },
    { name: 'Business',    path: '/business',         icon: TrendingUp },
  ]

  const handleLogout = () => {
    adminSession.logout()
    nav('/')
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-black text-lg">ZeroLoss</span>
          <span className="text-slate-500 text-xs font-bold uppercase ml-1">Admin</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map(({ name, path, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={name}
                onClick={() => nav(path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{name}</span>
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs font-bold transition-colors px-3 py-2 rounded-xl hover:bg-slate-800"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </div>
  )
}