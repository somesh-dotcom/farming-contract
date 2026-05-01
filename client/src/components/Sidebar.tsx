import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  CreditCard,
  User,
  PlusCircle,
  Users,
  Send,
  Inbox,
  X,
  Sprout
} from 'lucide-react'

interface SidebarProps {
  onClose?: () => void
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { user } = useAuth()

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/contracts', icon: FileText, label: 'Contracts' },
    ...(user?.role === 'FARMER'
      ? [
          { path: '/contracts/new', icon: PlusCircle, label: 'Create Contract' },
          { path: '/contracts/requests', icon: Inbox, label: 'Contract Requests' }
        ]
      : []),
    ...(user?.role === 'BUYER'
      ? [{ path: '/contracts/send-request', icon: Send, label: 'Send Request' }]
      : []),
    { path: '/market-prices', icon: TrendingUp, label: 'Market Prices' },
    { path: '/transactions', icon: CreditCard, label: 'Transactions' },
    ...(user?.role === 'ADMIN'
      ? [{ path: '/users', icon: Users, label: 'Users' }]
      : []),
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <aside className="w-full h-full bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:rounded-3xl border border-white/50 overflow-hidden flex flex-col relative z-20">
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-between items-center p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 p-2 rounded-xl">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight"></span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Logo */}
      <div className="hidden lg:flex items-center gap-3 p-8 pb-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-2xl shadow-lg shadow-primary-500/30 transform hover:scale-105 transition-transform cursor-pointer">
          <Sprout className="w-7 h-7 text-white" />
        </div>
        <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight"></span>
      </div>
      
      <div className="px-8 pb-4 hidden lg:block">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator line */}
                      <div className={`absolute left-0 w-1.5 h-8 bg-primary-500 rounded-r-full transform transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></div>
                      
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Profile Hint */}
      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100/50">
          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Signed in as</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-indigo-600 font-medium mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar