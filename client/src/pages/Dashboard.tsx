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

  const contracts = contractsData || []
  const marketPrices = marketPricesData || []
  
  const stats = userStats?.stats || {
    totalContracts: 0,
    totalTransactions: 0,
    totalContractValue: 0,
    totalTransactionAmount: 0,
  }

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
  
  const upcomingDeliveries = myContracts
    .filter((c) => c.status === 'ACTIVE' || c.status === 'PENDING')
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .slice(0, 5)

  // Calculate revenue trends
  const totalRevenue = stats.totalContractValue
  const monthlyAverage = totalRevenue > 0 && stats.totalContracts > 0 
    ? totalRevenue / stats.totalContracts 
    : 0

  const statCards = user?.role === 'ADMIN' 
    ? [
        {
          title: t('dashboard.totalUsers'),
          value: userStats?.userCount || 0,
          icon: Users,
          color: 'bg-blue-500',
          change: '+12%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.totalContracts'),
          value: stats.totalContracts,
          icon: FileText,
          color: 'bg-purple-500',
          change: '+8%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.totalRevenue'),
          value: `₹${stats.totalContractValue.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-yellow-500',
          change: '+15%',
          changeType: 'positive'
        },
      ]
    : [
        {
          title: t('dashboard.totalContracts'),
          value: stats.totalContracts,
          icon: FileText,
          color: 'bg-blue-500',
          change: '+5%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.activeContracts'),
          value: activeContracts.length,
          icon: TrendingUp,
          color: 'bg-green-500',
          change: '+2%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.totalValue'),
          value: `₹${stats.totalContractValue.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-yellow-500',
          change: '+10%',
          changeType: 'positive'
        },
        {
          title: t('dashboard.transactions'),
          value: stats.totalTransactions,
          icon: CreditCard,
          color: 'bg-purple-500',
          change: '+3%',
          changeType: 'positive'
        },
      ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.welcome')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.overview')} {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center mt-1">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Trends */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.marketInsights')}</h2>
          </div>
          {marketPrices.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketPrices.slice(0, 4).map((price: any) => (
                  <div key={price.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{price.product?.name}</p>
                    <p className="text-lg font-bold text-primary-600">₹{price.price}</p>
                    <p className="text-xs text-gray-500">{price.unit}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {t('dashboard.latestMarketPrices', { count: marketPrices.length })}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('dashboard.noMarketData')}</p>
          )}
        </div>

        {/* Contract Status Distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.contractStatus')}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.active')}</span>
              <span className="font-medium">{activeContracts.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.totalContracts > 0 ? (activeContracts.length / stats.totalContracts) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.pending')}</span>
              <span className="font-medium">{pendingContracts.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${stats.totalContracts > 0 ? (pendingContracts.length / stats.totalContracts) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.completed')}</span>
              <span className="font-medium">{completedContracts.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${stats.totalContracts > 0 ? (completedContracts.length / stats.totalContracts) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('dashboard.cancelled')}</span>
              <span className="font-medium">{cancelledContracts.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${stats.totalContracts > 0 ? (cancelledContracts.length / stats.totalContracts) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.upcomingDeliveries')}</h2>
          </div>
          {upcomingDeliveries.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeliveries.map((contract) => (
                <div
                  key={contract.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {contract.product?.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(contract.deliveryDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {contract.quantity} {contract.unit} • ₹{contract.totalValue.toLocaleString()}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        contract.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {contract.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('dashboard.noUpcomingDeliveries')}</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.pendingContracts')}</h2>
          </div>
          {pendingContracts.length > 0 ? (
            <div className="space-y-3">
              {pendingContracts.slice(0, 5).map((contract) => (
                <div
                  key={contract.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {contract.product?.name}
                    </span>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                      PENDING
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {user?.role === 'FARMER' ? contract.buyer?.name : contract.farmer?.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {contract.quantity} {contract.unit} • ₹{contract.totalValue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('dashboard.noPendingContracts')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard