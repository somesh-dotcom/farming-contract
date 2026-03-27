import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { CheckCircle, XCircle, Clock, Send, FileText, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const BuyerRequests = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  // Fetch contract requests sent by this buyer
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ['buyerContractRequests'],
    queryFn: async () => {
      try {
        console.log('[BuyerRequests] Fetching requests for buyer:', user?.id);
        const res = await axios.get('/api/contract-requests', {
          params: { status: filter === 'all' ? undefined : filter.toUpperCase() }
        })
        console.log('[BuyerRequests] Received requests:', res.data.requests?.length || 0);
        return res.data.requests || []
      } catch (error: any) {
        console.error('Error fetching buyer contract requests:', error)
        throw error
      }
    },
    enabled: !!user?.id && user?.role === 'BUYER',
  })

  // Only buyers can view their sent requests
  if (user?.role !== 'BUYER') {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Only buyers can view their contract requests</p>
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/contracts')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Contract Requests</h1>
          <p className="text-gray-600 mt-1">Track requests sent to farmers</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary flex items-center gap-2 ml-auto"
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
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!requestsData || requestsData.length === 0) && (
        <div className="card text-center py-12">
          <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No contract requests found</p>
          <p className="text-sm text-gray-500 mt-2">
            Requests you send to farmers will appear here
          </p>
          <button
            onClick={() => navigate('/contracts/send-request')}
            className="btn btn-primary mt-4"
          >
            Send New Request
          </button>
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
                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                        Reason Provided
                      </span>
                    )}
                    {request.contract && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Contract Created
                      </span>
                    )}
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Farmer Info */}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Farmer</p>
                      <p className="font-medium text-gray-900">{request.farmer?.name}</p>
                      {request.farmer?.phone && (
                        <p className="text-sm text-gray-600">{request.farmer.phone}</p>
                      )}
                      {request.farmer?.city && (
                        <p className="text-sm text-gray-600">{request.farmer.city}</p>
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

                  {/* Rejection Reason (if rejected) */}
                  {request.status === 'REJECTED' && request.rejectionReason && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800 mb-1">
                            Reason for Rejection:
                          </p>
                          <p className="text-red-700">{request.rejectionReason}</p>
                        </div>
                      </div>
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

export default BuyerRequests
