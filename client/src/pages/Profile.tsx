import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { User, Mail, Phone, MapPin, Calendar, Home, Star } from 'lucide-react'
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
            
            {/* Rating Display */}
            {user?.rating && user.rating > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">User Rating</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">{user.rating.toFixed(1)}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= Math.round(user.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {user.totalRatings && user.totalRatings > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Based on {user.totalRatings} {user.totalRatings === 1 ? 'review' : 'reviews'}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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

