import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import {
  FileText,
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  ShoppingCart,
  TrendingDown
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Contract } from '../types'

const Dashboard = () => {
  const { user } = useAuth()
  const { t } = useTranslation()

  const { data: contractsData } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      const res = await axios.get('/api/contracts')
      return res.data.contracts as Contract[]
    },
    enabled: !!user?.id,
  })

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/users/stats/${user?.id}`)
      return res.data
    },
    enabled: !!user?.id,
  })

  const { data: marketPricesData } = useQuery({
    queryKey: ['marketPrices', 'latest'],
    queryFn: async () => {
      const res = await axios.get('/api/market-prices?latest=true')
      return res.data.prices
    },
  })

  // Added query for admin user count
  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await axios.get('/api/users')
      return res.data.users
    },
    enabled: user?.role === 'ADMIN',
  })

  const contracts = contractsData || []
  const marketPrices = marketPricesData || []
  
  // Filter contracts based on role (admins see all contracts)
  const myContracts = user?.role === 'ADMIN'
    ? contracts
    : contracts.filter(
        (c) => c.farmerId === user?.id || c.buyerId === user?.id
      )

  const activeContracts = myContracts.filter((c) => c.status === 'ACTIVE')
  const pendingContracts = myContracts.filter((c) => c.status === 'PENDING')
  const completedContracts = myContracts.filter((c) => c.status === 'COMPLETED')
  const cancelledContracts = myContracts.filter((c) => c.status === 'CANCELLED')
  
  // Fixed statistics calculation
  const calculatedTotalContracts = myContracts.length
  const calculatedTotalValue = myContracts.reduce((sum, c) => sum + (c.totalValue || 0), 0)
  const calculatedTotalTransactions = userStats?.transactions?.reduce((sum: number, t: any) => sum + t._count, 0) || 0
  const totalUserCount = allUsers?.length || 0

  const upcomingDeliveries = myContracts
    .filter((c) => c.status === 'ACTIVE' || c.status === 'PENDING')
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .slice(0, 5)

  const statCards = user?.role === 'ADMIN' 
    ? [
        {
          title: t('dashboard.totalUsers'),
          value: totalUserCount,
          icon: Users,
          gradient: 'from-blue-500 to-indigo-600',
          change: '+12%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.totalContracts'),
          value: calculatedTotalContracts,
          icon: FileText,
          gradient: 'from-purple-500 to-pink-600',
          change: '+8%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.totalRevenue'),
          value: `₹${calculatedTotalValue.toLocaleString()}`,
          icon: DollarSign,
          gradient: 'from-amber-400 to-orange-500',
          change: '+15%',
          changeType: 'positive'
        },
      ]
    : [
        {
          title: t('dashboard.totalContracts'),
          value: calculatedTotalContracts,
          icon: FileText,
          gradient: 'from-blue-500 to-cyan-500',
          change: '+5%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.activeContracts'),
          value: activeContracts.length,
          icon: TrendingUp,
          gradient: 'from-emerald-400 to-green-600',
          change: '+2%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.totalValue'),
          value: `₹${calculatedTotalValue.toLocaleString()}`,
          icon: DollarSign,
          gradient: 'from-amber-400 to-orange-500',
          change: '+10%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.transactions'),
          value: calculatedTotalTransactions,
          icon: CreditCard,
          gradient: 'from-purple-500 to-indigo-600',
          change: '+3%',
          changeType: 'positive'
        },
      ]

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-medium">
            {t('dashboard.overview')} <span className="text-primary-600 font-semibold">{user?.name}</span>!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full transition-transform duration-500 group-hover:scale-150`}></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center mt-2 bg-gray-50 inline-flex px-2 py-1 rounded-full">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl shadow-inner`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.marketInsights')}</h2>
          </div>
          {marketPrices.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketPrices.slice(0, 4).map((price: any) => (
                  <div key={price.id} className="p-4 bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-xl hover:border-primary-200 transition-colors group">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{price.product?.name}</p>
                    <p className="text-2xl font-extrabold text-primary-600 group-hover:scale-105 transition-transform transform origin-left">₹{price.price}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{price.unit}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {t('dashboard.latestMarketPrices', { count: marketPrices.length })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">{t('dashboard.noMarketData')}</p>
            </div>
          )}
        </div>

        {/* Contract Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.contractStatus')}</h2>
          </div>
          <div className="space-y-5">
            {[
              { label: t('dashboard.active'), count: activeContracts.length, color: 'bg-emerald-500' },
              { label: t('dashboard.pending'), count: pendingContracts.length, color: 'bg-amber-500' },
              { label: t('dashboard.completed'), count: completedContracts.length, color: 'bg-blue-500' },
              { label: t('dashboard.cancelled'), count: cancelledContracts.length, color: 'bg-rose-500' },
            ].map((status, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-gray-600">{status.label}</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md text-sm">{status.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${status.color} h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`} 
                    style={{ width: `${calculatedTotalContracts > 0 ? (status.count / calculatedTotalContracts) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.upcomingDeliveries')}</h2>
            </div>
          </div>
          {upcomingDeliveries.length > 0 ? (
            <div className="space-y-4">
              {upcomingDeliveries.map((contract) => (
                <div
                  key={contract.id}
                  className="group p-4 bg-white border border-gray-100 rounded-xl hover:border-rose-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-lg">
                      {contract.product?.name}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                      {contract.deliveryDate ? format(new Date(contract.deliveryDate), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm font-medium text-gray-500">
                      <span className="text-gray-900 font-bold">{contract.quantity}</span> {contract.unit}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      ₹{contract.totalValue?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Calendar className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">{t('dashboard.noUpcomingDeliveries')}</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-xl">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.pendingContracts')}</h2>
          </div>
          {pendingContracts.length > 0 ? (
            <div className="space-y-4">
              {pendingContracts.slice(0, 5).map((contract) => (
                <div
                  key={contract.id}
                  className="group p-4 bg-white border border-gray-100 rounded-xl hover:border-amber-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-lg">
                      {contract.product?.name}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full animate-pulse">
                      PENDING
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    with <span className="text-gray-900 font-semibold">{user?.role === 'FARMER' ? contract.buyer?.name : contract.farmer?.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-sm font-medium text-gray-500">{contract.quantity} {contract.unit}</span>
                    <span className="text-sm font-bold text-gray-900">₹{contract.totalValue?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">{t('dashboard.noPendingContracts')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard