import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, User, Shield } from 'lucide-react';

export default function BottomNav({ workerId }) {
  const nav = useNavigate();
  const location = useLocation();

  // If we aren't on a worker-specific page, don't show the nav
  // Adjust this logic based on your actual route structure
  if (!location.pathname.includes('/worker/')) return null;

  const tabs = [
    { name: 'Home', path: `/worker/${workerId}`, icon: Home },
    { name: 'Policies', path: `/worker/${workerId}/policies`, icon: Shield },
    { name: 'Claims', path: `/worker/${workerId}/claims`, icon: FileText },
    { name: 'Profile', path: `/worker/${workerId}/profile`, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.name}
              onClick={() => nav(tab.path)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95"
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}