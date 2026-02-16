import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { User, Mail, Phone, MapPin, Calendar, Home } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

const Profile = () => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const { data: statsData } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/users/stats/${user?.id}`)
      return res.data
    },
    enabled: !!user?.id,
  })

  const stats = statsData?.stats || {
    totalContracts: 0,
    totalTransactions: 0,
    totalContractValue: 0,
    totalTransactionAmount: 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('navigation.profile')}</h1>
        <p className="text-gray-600 mt-1">{t('common.accountInformation')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('common.personalInformation')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('auth.name')}</p>
                  <p className="font-medium text-gray-900 text-lg">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('auth.email')}</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('auth.phone')}</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              {(user?.city || user?.state) && (
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('common.location')}</p>
                    <p className="font-medium text-gray-900">
                      {user.city && user.state 
                        ? `${user.city}, ${user.state}` 
                        : user.city || user.state}
                      {user.pincode && `, ${user.pincode}`}
                    </p>
                  </div>
                </div>
              )}

              {user?.address && (
                <div className="flex items-start gap-4">
                  <Home className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('common.area')}</p>
                    <p className="font-medium text-gray-900">{user.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('common.memberSince')}</p>
                  <p className="font-medium text-gray-900">
                    {user?.createdAt && format(new Date(user.createdAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{t('auth.role')}</p>
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium capitalize">
                    {user?.role?.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.statistics')}</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalContracts')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalContracts}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalTransactions')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.totalValue')}</p>
                <p className="text-2xl font-bold text-primary-600">
                  ₹{stats.totalContractValue.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('transaction.totalAmount')}</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{stats.totalTransactionAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

