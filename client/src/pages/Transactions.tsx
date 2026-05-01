import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { CreditCard, DollarSign, Calendar, FileText, Filter, Search, Trash2, ExternalLink, ArrowRightLeft, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Transaction } from '../types'

const Transactions = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Mutation to update transaction status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ transactionId, status }: { transactionId: string; status: string }) => {
      const res = await axios.patch(`/api/transactions/${transactionId}/status`, { status })
      return res.data
    },
    onMutate: async ({ transactionId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData(['transactions']);
      
      // Update the transaction status optimistically
      queryClient.setQueryData(['transactions'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          transactions: old.transactions.map((t: any) =>
            t.id === transactionId ? { ...t, status } : t
          ),
        };
      });
      
      return { previousTransactions };
    },
    onError: () => {
      // Rollback on error - simplified
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      // Also invalidate specific contract details that might contain these transactions
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'contract' })
      // Invalidate user stats that might be affected by transaction changes
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'userStats' })
      // Invalidate all related queries to ensure updates propagate to farmers and buyers
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('contract') });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('transaction') });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('user') });
    },
  })

  // Mutation to delete transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await axios.delete(`/api/transactions/${transactionId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      // Also invalidate specific contract details that might contain these transactions
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'contract' })
      // Invalidate user stats that might be affected by transaction changes
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'userStats' })
      // Invalidate all related queries to ensure updates propagate to farmers and buyers
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('contract') });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('transaction') });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey.includes('user') });
    },
  })

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', statusFilter, paymentMethodFilter, paymentTypeFilter, searchTerm],
    queryFn: async () => {
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter
      if (searchTerm) params.search = searchTerm
      const res = await axios.get('/api/transactions', { params })
      return res.data.transactions as Transaction[]
    },
  })

  let transactions = transactionsData || []

  // Filter by payment type on client side (if needed)
  if (paymentTypeFilter) {
    transactions = transactions.filter((t) => t.paymentType === paymentTypeFilter)
  }
  
  // Filter by search term on client side
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    transactions = transactions.filter((t) => 
      (t.contract?.product?.name?.toLowerCase().includes(term)) ||
      (t.contract?.farmer?.name?.toLowerCase().includes(term)) ||
      (t.contract?.buyer?.name?.toLowerCase().includes(term)) ||
      (t.amount.toString().includes(term)) ||
      (t.status.toLowerCase().includes(term)) ||
      (t.paymentMethod?.toLowerCase().includes(term)) ||
      (t.paymentType?.toLowerCase().includes(term)) ||
      (t.id.toLowerCase().includes(term)) ||
      (t.contractId.toLowerCase().includes(term))
    );
  }

  // Get unique payment methods and types for filters
  const paymentMethods = Array.from(
    new Set(transactions.map((t) => t.paymentMethod).filter((method): method is string => Boolean(method)))
  ).sort()

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse'
      case 'FAILED':
        return 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <ShieldCheck className="w-4 h-4 mr-1.5" />
      case 'PENDING': return <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
      case 'FAILED': return <AlertCircle className="w-4 h-4 mr-1.5" />
      default: return null
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'upi':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'bank_transfer':
      case 'neft':
      case 'rtgs':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'cash':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'cheque':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'ADVANCE':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'PARTIAL':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'FINAL':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'REFUND':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatPaymentMethod = (method: string) => {
    if (!method) return t('common.na') || 'N/A'
    
    // Map payment method codes to translation keys
    const methodMap: Record<string, string> = {
      'cash': t('transaction.cash'),
      'bank_transfer': t('transaction.bankTransfer'),
      'upi': t('transaction.upi'),
      'cheque': t('transaction.cheque'),
      'neft': t('transaction.neft'),
      'rtgs': t('transaction.rtgs'),
      'imps': t('transaction.imps'),
      'card': t('transaction.card'),
      'digital_wallet': t('transaction.digitalWallet'),
      'paytm': t('transaction.paytm'),
      'google_pay': t('transaction.googlePay'),
      'amazon_pay': t('transaction.amazonPay'),
      'phonepe': t('transaction.phonePe'),
    };
    
    const translated = methodMap[method.toLowerCase()] || method
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return translated;
  }

  // Translation mapping for payment types
  const getTranslatedPaymentType = (type: string) => {
    const typeMap: Record<string, string> = {
      'ADVANCE': t('transaction.advance'),
      'PARTIAL': t('transaction.partial'),
      'FINAL': t('transaction.final'),
      'REFUND': t('transaction.refund'),
      'OTHER': t('transaction.other'),
    };
    return typeMap[type] || type;
  }

  const totalAmount = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingAmount = transactions
    .filter((t) => t.status === 'PENDING')
    .reduce((sum, t) => sum + t.amount, 0)

  // Function to update transaction status
  const updateTransactionStatus = (transactionId: string, newStatus: string) => {
    updateStatusMutation.mutate({ transactionId, status: newStatus })
  }

  // Function to delete a transaction
  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm(t('transaction.confirmDelete'))) {
      deleteTransactionMutation.mutate(transactionId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <ArrowRightLeft className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('transaction.transactionList')}</h1>
          </div>
          <p className="text-base text-gray-500 font-medium">{t('transaction.transactionManagement')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-transparent opacity-50 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">{t('transaction.totalTransactions')}</p>
              <p className="text-3xl font-black text-gray-900">{transactions.length}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl shadow-inner text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-transparent opacity-50 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">{t('transaction.amount')} (Completed)</p>
              <p className="text-3xl font-black text-emerald-600">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl shadow-inner text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100 to-transparent opacity-50 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">{t('transaction.pendingPayment')}</p>
              <p className="text-3xl font-black text-amber-500">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl shadow-inner text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-gray-50 p-2 rounded-xl">
            <Filter className="w-5 h-5 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('common.filter')} & Search</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('common.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700"
            >
              <option value="">{t('common.all')} {t('common.status')}</option>
              <option value="PENDING">{t('transaction.pending')}</option>
              <option value="COMPLETED">{t('transaction.completed')}</option>
              <option value="FAILED">{t('transaction.failed')}</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('transaction.paymentMethod')}</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700"
            >
              <option value="">{t('common.all')} {t('transaction.paymentMethod')}</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {formatPaymentMethod(method)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('transaction.paymentType')}</label>
            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700"
            >
              <option value="">{t('common.all')} {t('transaction.paymentType')}</option>
              <option value="ADVANCE">{t('transaction.advance')}</option>
              <option value="PARTIAL">{t('transaction.partial')}</option>
              <option value="FINAL">{t('transaction.final')}</option>
              <option value="REFUND">{t('transaction.refund')}</option>
              <option value="OTHER">{t('transaction.other')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('common.search')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700"
              />
            </div>
          </div>
        </div>
        
        {(statusFilter || paymentMethodFilter || paymentTypeFilter || searchTerm) && (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setStatusFilter('')
                setPaymentMethodFilter('')
                setPaymentTypeFilter('')
                setSearchTerm('')
              }}
              className="text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors"
            >
              {t('common.reset')} Filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <CreditCard className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-500 font-medium">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contract Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount & Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  {user?.role === 'ADMIN' && <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Contract Details */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-500 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                            {transaction.contract?.product?.name}
                          </h3>
                          <p className="text-sm font-medium text-gray-500 mt-1">
                            with <span className="text-gray-800 font-semibold">{transaction.contract?.farmer?.name || transaction.contract?.buyer?.name}</span>
                          </p>
                          <div className="flex flex-col gap-1.5 mt-3">
                            <Link 
                              to={`/contracts/${transaction.contractId}`}
                              className="text-xs px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-mono hover:bg-purple-100 transition-colors inline-flex items-center gap-1.5 border border-purple-100 w-fit"
                            >
                              <span>Ord: {transaction.contractId.substring(0, 8)}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-mono border border-gray-200 w-fit">
                              Txn: {transaction.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Date */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xl font-black text-gray-900 tracking-tight">
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-400 font-medium mt-1">
                          {format(new Date(transaction.transactionDate), 'hh:mm a')}
                        </div>
                      </div>
                    </td>

                    {/* Payment Info */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Method</span>
                          {transaction.paymentMethod ? (
                            <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                              {formatPaymentMethod(transaction.paymentMethod)}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-gray-400">{t('common.na')}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Type</span>
                          {transaction.paymentType ? (
                            <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${getPaymentTypeColor(transaction.paymentType)}`}>
                              {getTranslatedPaymentType(transaction.paymentType)}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-gray-400">{t('common.na')}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 align-top">
                      <div className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider border ${getStatusStyle(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </div>
                      
                      {/* Admin Quick Status Update */}
                      {user?.role === 'ADMIN' && (
                        <div className="mt-4">
                          <select
                            value={transaction.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              updateTransactionStatus(transaction.id, newStatus);
                            }}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="PENDING">Set Pending</option>
                            <option value="COMPLETED">Set Completed</option>
                            <option value="FAILED">Set Failed</option>
                            <option value="CANCELLED">Set Cancelled</option>
                          </select>
                          {updateStatusMutation.isPending && updateStatusMutation.variables?.transactionId === transaction.id && (
                            <div className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions (Admin only) */}
                    {user?.role === 'ADMIN' && (
                      <td className="px-6 py-5 align-top text-right">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 hover:shadow-sm transition-all focus:ring-2 focus:ring-rose-500 active:scale-95 inline-flex"
                          title={t('transaction.delete')}
                          disabled={deleteTransactionMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions

