import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { format } from 'date-fns'
import { PlusCircle, Eye, Calendar, Package, DollarSign } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Contract } from '../types'

const Contracts = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: contractsData, isLoading } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: async () => {
      const res = await axios.get('/api/contracts')
      return res.data.contracts as Contract[]
    },
    enabled: !!user?.id,
  })

  const contracts = contractsData || []
  
  // Filter contracts based on user role (admins see all contracts)
  const myContracts = user?.role === 'ADMIN' 
    ? contracts 
    : contracts.filter(
        (c) => c.farmerId === user?.id || c.buyerId === user?.id
      )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('common.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('navigation.contracts')}</h1>
          <p className="text-gray-600 mt-1">{t('contract.manage')} {t('contract.farming')}</p>
        </div>
        {user?.role === 'FARMER' && (
          <button
            onClick={() => navigate('/contracts/new')}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            {t('contract.createContract')}
          </button>
        )}
      </div>

      {myContracts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('contract.noContractsFound')}</h3>
          <p className="text-gray-600 mb-4">
            {user?.role === 'FARMER'
              ? t('contract.createFirstContract')
              : t('contract.noContractsAvailable')}
          </p>
          {user?.role === 'FARMER' && (
            <button
              onClick={() => navigate('/contracts/new')}
              className="btn btn-primary"
            >
              {t('contract.createContract')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myContracts.map((contract) => (
            <div key={contract.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {contract.product?.name}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700 mr-2"
                    >
                      Order ID: {contract.id.substring(0, 8)}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">{t('contract.quantity')}</p>
                        <p className="font-medium text-gray-900">
                          {contract.quantity} {contract.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">{t('contract.pricePerUnit')}</p>
                        <p className="font-medium text-gray-900">
                          ₹{contract.pricePerUnit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">{t('contract.totalValue')}</p>
                        <p className="font-medium text-gray-900">
                          ₹{contract.totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">{t('contract.deliveryDate')}</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(contract.deliveryDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {user?.role === 'FARMER' ? `${t('contract.buyer')}: ` : `${t('contract.farmer')}: `}
                    </span>
                    {user?.role === 'FARMER'
                      ? contract.buyer?.name
                      : contract.farmer?.name}
                    {contract.location && (
                      <>
                        {' • '}
                        <span className="font-medium">{`${t('contract.location')}: `}</span>
                        {contract.location}
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className="ml-4 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Contracts

