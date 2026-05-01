import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Menu, Bell } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import ViewAs from './ViewAs'

interface HeaderProps {
  onMenuClick?: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white/70 backdrop-blur-xl shadow-sm border border-white/50 lg:rounded-3xl px-4 md:px-8 py-4 relative z-30 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {t('common.welcome')}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Manage your agricultural contracts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hidden md:flex items-center gap-3 mr-2">
            <LanguageSelector />
            <ViewAs />
          </div>

          {/* Notifications Button */}
          <button className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors relative group">
            <Bell className="w-5 h-5 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>

          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

          <div className="flex items-center gap-3 text-gray-700 hover:bg-gray-50 p-1.5 pr-4 rounded-full transition-colors cursor-pointer border border-transparent hover:border-gray-100 group">
            <div className="bg-gradient-to-br from-primary-100 to-indigo-100 p-2 rounded-full text-primary-600 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm text-gray-900 leading-tight">{user?.name}</div>
              <div className="text-xs font-semibold text-primary-600 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2.5 text-rose-600 hover:bg-rose-50 hover:shadow-sm rounded-xl transition-all active:scale-95"
            title={t('common.logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

