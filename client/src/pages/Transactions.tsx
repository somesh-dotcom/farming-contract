import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { CreditCard, DollarSign, Calendar, FileText, Filter, Search, RefreshCw, Trash2, CheckCircle, XCircle, ChevronDown, ExternalLink } from 'lucide-react'
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
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['transactions'], context?.previousTransactions);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'FAILED':
        return 'bg-red-100 text-red-700'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'upi':
        return 'bg-blue-100 text-blue-700'
      case 'bank_transfer':
      case 'neft':
      case 'rtgs':
        return 'bg-purple-100 text-purple-700'
      case 'cash':
        return 'bg-green-100 text-green-700'
      case 'cheque':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'ADVANCE':
        return 'bg-blue-100 text-blue-700'
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-700'
      case 'FINAL':
        return 'bg-green-100 text-green-700'
      case 'REFUND':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
    return <div className="text-center py-12">{t('common.loading')}...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('transaction.transactionList')}</h1>
        <p className="text-gray-600 mt-1">{t('transaction.transactionManagement')}</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">{t('common.filter')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">{t('common.all')} {t('common.status')}</option>
              <option value="PENDING">{t('transaction.pending')}</option>
              <option value="COMPLETED">{t('transaction.completed')}</option>
              <option value="FAILED">{t('transaction.failed')}</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('transaction.paymentMethod')}</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="input"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('transaction.paymentType')}</label>
            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value)}
              className="input"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, farmer, buyer, amount, status, payment method, order ID or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
        </div>
        {(statusFilter || paymentMethodFilter || paymentTypeFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter('')
              setPaymentMethodFilter('')
              setPaymentTypeFilter('')
              setSearchTerm('')
            }}
            className="mt-4 text-sm text-primary-600 hover:underline"
          >
            {t('common.reset')}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('transaction.totalTransactions')}</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('transaction.amount')}</p>
              <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('transaction.pendingPayment')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{pendingAmount.toLocaleString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('transaction.transactionList')}</h3>
          <p className="text-gray-600">{t('transaction.transactionManagement')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {transaction.contract?.product?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t('transaction.contractWith')}
                          {transaction.contract?.farmer?.name ||
                            transaction.contract?.buyer?.name}
                        </p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Link 
                            to={`/contracts/${transaction.contractId}`}
                            className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono hover:bg-purple-200 transition-colors flex items-center gap-1"
                          >
                            <span>Order ID: {transaction.contractId.substring(0, 8)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
                            Trans ID: {transaction.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">{t('transaction.amount')}</p>
                        <p className="font-medium text-gray-900">
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t('common.date')}</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('transaction.paymentMethod')}</p>
                        {transaction.paymentMethod ? (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${getPaymentMethodColor(
                              transaction.paymentMethod
                            )}`}
                          >
                            {formatPaymentMethod(transaction.paymentMethod)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">{t('common.na')}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('transaction.paymentType')}</p>
                        {transaction.paymentType ? (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${getPaymentTypeColor(
                              transaction.paymentType
                            )}`}
                          >
                            {getTranslatedPaymentType(transaction.paymentType)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">{t('common.na')}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">{t('common.status')}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                          {user?.role === 'ADMIN' && (
                            <div className="flex gap-1 items-center">
                              <div className="flex items-center gap-1">
                                <select
                                  value={transaction.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    updateTransactionStatus(transaction.id, newStatus);
                                  }}
                                  className="text-xs px-2 py-1 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <option value="PENDING">{t('transaction.pending')}</option>
                                  <option value="COMPLETED">{t('transaction.completed')}</option>
                                  <option value="FAILED">{t('transaction.failed')}</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                                {updateStatusMutation.isPending && updateStatusMutation.variables?.transactionId === transaction.id && (
                                  <span className="text-xs text-blue-600">Saving...</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors ml-1"
                                title={t('transaction.delete')}
                                disabled={deleteTransactionMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions

