import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { CheckCircle, XCircle, Clock, AlertCircle, Send, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ContractRequests = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending')

  // Fetch contract requests
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ['contractRequests'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/contract-requests', {
          params: { status: filter === 'all' ? undefined : filter.toUpperCase() }
        })
        return res.data.requests || []
      } catch (error: any) {
        console.error('Error fetching contract requests:', error)
        throw error
      }
    },
    enabled: !!user?.id && user?.role === 'FARMER',
  })

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await axios.patch(`/api/contract-requests/${requestId}/accept`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractRequests'] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to accept request')
    },
  })

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const res = await axios.patch(`/api/contract-requests/${requestId}/reject`, { reason })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractRequests'] })
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to reject request')
    },
  })

  const handleAccept = (requestId: string) => {
    if (window.confirm('Are you sure you want to accept this request? This will create a contract.')) {
      acceptRequestMutation.mutate(requestId)
    }
  }

  const handleReject = (requestId: string) => {
    const reason = prompt('Enter reason for rejection (optional):')
    rejectRequestMutation.mutate({ requestId, reason: reason || undefined })
  }

  // Only farmers can view incoming requests
  if (user?.role !== 'FARMER') {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">{t('contract.onlyFarmersCanViewRequests')}</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'REJECTED':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('contract.contractRequests')}</h1>
          <p className="text-gray-600 mt-1">{t('contract.manageIncomingRequests')}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900">
                {requestsData?.length || 0}
              </p>
            </div>
            <Send className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {requestsData?.filter((r: any) => r.status === 'PENDING').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Accepted</p>
              <p className="text-2xl font-bold text-green-900">
                {requestsData?.filter((r: any) => r.status === 'ACCEPTED').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900">
                {requestsData?.filter((r: any) => r.status === 'REJECTED').length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === status
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card text-center py-12">
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!requestsData || requestsData.length === 0) && (
        <div className="card text-center py-12">
          <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">{t('contract.noContractRequests')}</p>
          <p className="text-sm text-gray-500 mt-2">
            {t('contract.requestsWillAppearHere')}
          </p>
        </div>
      )}

      {/* Requests List */}
      {!isLoading && requestsData && requestsData.length > 0 && (
        <div className="space-y-4">
          {requestsData.map((request: any) => (
            <div
              key={request.id}
              className={`card border-l-4 ${getStatusColor(request.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusIcon(request.status)}
                    <span className="font-semibold">{request.status}</span>
                    {request.contract && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Contract Created
                      </span>
                    )}
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Buyer Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Buyer</p>
                      <p className="font-medium text-gray-900">{request.buyer?.name}</p>
                      {request.buyer?.phone && (
                        <p className="text-sm text-gray-600">{request.buyer.phone}</p>
                      )}
                      {request.buyer?.city && (
                        <p className="text-sm text-gray-600">{request.buyer.city}</p>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Product</p>
                      <p className="font-medium text-gray-900">{request.product?.name}</p>
                      <p className="text-sm text-gray-600">
                        {request.quantity} {request.unit}
                      </p>
                    </div>

                    {/* Price Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Proposed Price</p>
                      <p className="font-bold text-gray-900">
                        ₹{request.proposedPrice}/{request.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: ₹{(request.quantity * request.proposedPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Dates and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(request.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(request.deliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                    {request.location && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="font-medium text-gray-900">{request.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  {request.terms && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Terms & Conditions</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {request.terms}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-gray-500">
                    <p>Requested on: {new Date(request.createdAt).toLocaleString()}</p>
                    {request.updatedAt && (
                      <p>Last updated: {new Date(request.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'PENDING' && (
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleAccept(request.id)}
                      disabled={acceptRequestMutation.isPending}
                      className="btn btn-success flex items-center gap-2 whitespace-nowrap"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {acceptRequestMutation.isPending ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={rejectRequestMutation.isPending}
                      className="btn btn-danger flex items-center gap-2 whitespace-nowrap"
                    >
                      <XCircle className="w-4 h-4" />
                      {rejectRequestMutation.isPending ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {/* View Contract Button (if accepted) */}
                {request.status === 'ACCEPTED' && request.contract && (
                  <div className="ml-4">
                    <button
                      onClick={() => navigate(`/contracts/${request.contract.id}`)}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Contract
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContractRequests
