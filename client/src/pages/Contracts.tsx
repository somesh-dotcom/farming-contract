import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { format } from 'date-fns'
import { PlusCircle, Calendar, Package, DollarSign, FileText, CreditCard, ChevronRight } from 'lucide-react'
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('navigation.contracts')}</h1>
          <p className="text-base text-gray-500 mt-2 font-medium">{t('contract.manage')} {t('contract.farming')}</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto relative z-10">
          {user?.role === 'BUYER' && (
            <button
              onClick={() => navigate('/contracts/my-requests')}
              className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex-1 sm:flex-initial"
            >
              <FileText className="w-5 h-5" />
              <span>My Requests</span>
            </button>
          )}
          {user?.role === 'FARMER' && (
            <button
              onClick={() => navigate('/contracts/new')}
              className="btn btn-primary flex-1 sm:flex-initial shadow-primary-500/30 shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t('contract.createContract')}</span>
            </button>
          )}
        </div>
      </div>

      {myContracts.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('contract.noContractsFound')}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
            {user?.role === 'FARMER'
              ? t('contract.createFirstContract')
              : t('contract.noContractsAvailable')}
          </p>
          {user?.role === 'FARMER' && (
            <button
              onClick={() => navigate('/contracts/new')}
              className="btn btn-primary px-8 py-3 shadow-lg shadow-primary-500/30"
            >
              <PlusCircle className="w-5 h-5" />
              {t('contract.createContract')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {myContracts.map((contract) => (
            <div 
              key={contract.id} 
              className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
            >
              {/* Hover effect bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-400 to-indigo-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3.5 rounded-2xl border border-gray-200 group-hover:border-primary-200 transition-colors">
                    <Package className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {contract.product?.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">
                      ID: {contract.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-bold border uppercase tracking-wider ${getStatusStyle(
                    contract.status
                  )}`}
                >
                  {contract.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('contract.quantity')}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    {contract.quantity} <span className="text-sm font-medium text-gray-500">{contract.unit}</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('contract.pricePerUnit')}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{contract.pricePerUnit}
                  </p>
                </div>

                <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100/50 group-hover:bg-primary-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <DollarSign className="w-4 h-4 text-primary-400" />
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{t('contract.totalValue')}</p>
                  </div>
                  <p className="font-extrabold text-primary-700 text-lg">
                    ₹{contract.totalValue.toLocaleString()}
                  </p>
                </div>

                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50 group-hover:bg-rose-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-4 h-4 text-rose-400" />
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">{t('contract.deliveryDate')}</p>
                  </div>
                  <p className="font-bold text-rose-700 text-sm mt-1">
                    {format(new Date(contract.deliveryDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs border border-white shadow-sm">
                    {(user?.role === 'FARMER' ? contract.buyer?.name : contract.farmer?.name)?.charAt(0)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 font-medium text-xs block">
                      {user?.role === 'FARMER' ? t('contract.buyer') : t('contract.farmer')}
                    </span>
                    <span className="font-bold text-gray-900">
                      {user?.role === 'FARMER' ? contract.buyer?.name : contract.farmer?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {contract.status === 'ACTIVE' && user?.role === 'BUYER' && (
                    <button
                      onClick={() => navigate(`/payment/${contract.id}`)}
                      className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 border border-emerald-100"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="hidden sm:inline">Pay</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                    className="p-2.5 text-gray-600 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 border border-gray-200 hover:border-primary-200 group/btn"
                  >
                    <span className="hidden sm:inline">Details</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Contracts

