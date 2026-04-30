import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Menu } from 'lucide-react'
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
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">{t('common.welcome')}, {t('navigation.dashboard')}</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">{t('common.welcome')} {t('common.marketPrices')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSelector />
          <ViewAs />
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 md:w-5 md:h-5" />
            <div className="hidden sm:block">
              <div className="font-medium text-sm md:text-base">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm md:text-base"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

