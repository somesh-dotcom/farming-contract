import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { ArrowLeft, CreditCard, Package, Calendar, MapPin, User, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PaymentGateway from '../components/PaymentGateway'

const PaymentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const res = await axios.get(`/api/contracts/${id}`)
      return res.data.contract
    },
    enabled: !!id,
  })

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const res = await axios.get(`/api/payments/contract/${id}`)
      return res.data.transactions
    },
    enabled: !!id,
  })

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['contract', id] })
    queryClient.invalidateQueries({ queryKey: ['transactions', id] })
    queryClient.invalidateQueries({ queryKey: ['contracts'] })
    setShowPaymentGateway(false)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading contract details...</p>
      </div>
    )
  }

  if (!contractData) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Not Found</h2>
        <p className="text-gray-600 mb-6">The contract you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/contracts')} className="btn btn-primary">
          Back to Contracts
        </button>
      </div>
    )
  }

  const contract = contractData
  const transactions = transactionsData || []
  const totalPaid = transactions
    .filter((t: any) => t.status === 'COMPLETED')
    .reduce((sum: number, t: any) => sum + t.amount, 0)
  const remainingAmount = contract.totalValue - totalPaid
  const isFullyPaid = remainingAmount <= 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/contracts/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
            <p className="text-gray-600 mt-1">Complete your payment for this contract</p>
          </div>
        </div>
      </div>

      {/* Contract Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Contract Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Product</p>
              <p className="font-medium text-gray-900">{contract.product?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="font-medium text-gray-900">
                {contract.quantity} {contract.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price per Unit</p>
              <p className="font-medium text-gray-900">₹{contract.pricePerUnit?.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Contract Value</p>
              <p className="text-2xl font-bold text-primary-600">
                ₹{contract.totalValue?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(contract.startDate), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivery Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(contract.deliveryDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>
        {contract.location && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {contract.location}
            </p>
          </div>
        )}
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Farmer
          </h3>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{contract.farmer?.name}</p>
            <p className="text-sm text-gray-600">{contract.farmer?.email}</p>
            {contract.farmer?.phone && (
              <p className="text-sm text-gray-600">{contract.farmer.phone}</p>
            )}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Buyer
          </h3>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{contract.buyer?.name}</p>
            <p className="text-sm text-gray-600">{contract.buyer?.email}</p>
            {contract.buyer?.phone && (
              <p className="text-sm text-gray-600">{contract.buyer.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payment Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-blue-700">
              ₹{contract.totalValue?.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Amount Paid</p>
            <p className="text-2xl font-bold text-green-700">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isFullyPaid ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border`}>
            <p className={`text-sm mb-1 ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
              {isFullyPaid ? 'Fully Paid' : 'Remaining Amount'}
            </p>
            <p className={`text-2xl font-bold ${isFullyPaid ? 'text-green-700' : 'text-orange-700'}`}>
              ₹{Math.max(0, remainingAmount).toLocaleString()}
            </p>
          </div>
        </div>

        {isFullyPaid ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Payment Complete!</h3>
            <p className="text-green-700">This contract has been fully paid.</p>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowPaymentGateway(true)}
              className="btn btn-primary text-lg px-8 py-3 flex items-center gap-3 mx-auto"
              disabled={contract.status !== 'ACTIVE'}
            >
              <CreditCard className="w-6 h-6" />
              Pay Now - ₹{remainingAmount.toLocaleString()}
            </button>
            {contract.status !== 'ACTIVE' && (
              <p className="text-sm text-gray-600 mt-3 flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4" />
                Payment can only be made for active contracts
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payment History */}
      {transactions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="space-y-3">
            {transactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-600' 
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.paymentMethod || 'Payment'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <PaymentGateway
          contractId={contract.id}
          amount={remainingAmount}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentGateway(false)}
        />
      )}
    </div>
  )
}

export default PaymentPage
