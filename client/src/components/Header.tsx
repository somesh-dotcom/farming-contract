import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, User } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import ViewAs from './ViewAs'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('common.welcome')}, {t('navigation.dashboard')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('common.welcome')} {t('common.marketPrices')}</p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ViewAs />
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-5 h-5" />
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

