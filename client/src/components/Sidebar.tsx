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
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 h-full overflow-y-auto">
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end p-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar