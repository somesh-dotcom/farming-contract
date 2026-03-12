import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Package, MapPin, FileText, CheckCircle, XCircle, Edit2, Save, X, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ContractStatus } from '../types'
import PaymentForm from '../components/PaymentForm'

const ContractDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const res = await axios.get(`/api/contracts/${id}`)
      return res.data.contract
    },
    enabled: !!id,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: ContractStatus) => {
      const res = await axios.patch(`/api/contracts/${id}/status`, { status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })

  const updateContractMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put(`/api/contracts/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      setIsEditing(false)
    },
  })

  const handleEditClick = () => {
    if (contractData) {
      setEditData({
        quantity: contractData.quantity,
        unit: contractData.unit,
        pricePerUnit: contractData.pricePerUnit,
        startDate: format(new Date(contractData.startDate), 'yyyy-MM-dd'),
        deliveryDate: format(new Date(contractData.deliveryDate), 'yyyy-MM-dd'),
        location: contractData.location || '',
        terms: contractData.terms || '',
      })
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData(null)
  }

  const handleSaveEdit = () => {
    if (editData) {
      updateContractMutation.mutate(editData)
    }
  }

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading contract details...</div>
  }

  if (!contractData) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Contract not found</p>
      </div>
    )
  }

  const contract = contractData
  const canUpdateStatus =
    user?.role === 'ADMIN' ||
    contract.farmerId === user?.id ||
    contract.buyerId === user?.id
  
  const canEdit = user?.role === 'ADMIN' || contract.farmerId === user?.id

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contracts')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Contract Details</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-600">Order ID: <span className="font-mono font-bold text-purple-700">{contract.id.substring(0, 8)}</span></span>
            <span className="text-sm text-gray-600">•</span>
            <p className="text-gray-600">View and manage contract information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && !isEditing && (
            <button
              onClick={handleEditClick}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Contract
            </button>
          )}
          <span
            className={`text-sm px-4 py-2 rounded-full font-medium ${getStatusColor(
              contract.status
            )}`}
          >
            {contract.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Contract Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Contract Information</h2>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateContractMutation.isPending}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {updateContractMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            
            {isEditing && editData ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium text-gray-900">{contract.product?.name}</p>
                    <p className="text-sm text-gray-500">{contract.product?.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={editData.quantity}
                      onChange={(e) => handleEditChange('quantity', parseFloat(e.target.value) || 0)}
                      className="input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={editData.unit}
                      onChange={(e) => handleEditChange('unit', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={editData.pricePerUnit}
                    onChange={(e) => handleEditChange('pricePerUnit', parseFloat(e.target.value) || 0)}
                    className="input"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{((editData.quantity || 0) * (editData.pricePerUnit || 0)).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editData.startDate}
                      onChange={(e) => handleEditChange('startDate', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={editData.deliveryDate}
                      onChange={(e) => handleEditChange('deliveryDate', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Location
                  </label>
                  <select
                    value={[
                      'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi',
                      'Bangalore - Indiranagar', 'Bangalore - Koramangala', 'Bangalore - Whitefield',
                      'Bangalore - HSR Layout', 'Bangalore - BTM Layout', 'Bangalore - Jayanagar',
                      'Bangalore - Electronic City'
                    ].includes(editData.location) ? editData.location : (editData.location ? 'Other' : '')}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        handleEditChange('location', '');
                      } else {
                        handleEditChange('location', e.target.value);
                      }
                    }}
                    className="input"
                  >
                    <option value="">Select location...</option>
                    <optgroup label="Major Cities">
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </optgroup>
                    <optgroup label="Bangalore Areas">
                      <option value="Bangalore - Indiranagar">Bangalore - Indiranagar</option>
                      <option value="Bangalore - Koramangala">Bangalore - Koramangala</option>
                      <option value="Bangalore - Whitefield">Bangalore - Whitefield</option>
                      <option value="Bangalore - HSR Layout">Bangalore - HSR Layout</option>
                      <option value="Bangalore - BTM Layout">Bangalore - BTM Layout</option>
                      <option value="Bangalore - Jayanagar">Bangalore - Jayanagar</option>
                      <option value="Bangalore - Electronic City">Bangalore - Electronic City</option>
                    </optgroup>
                    <option value="Other">Other (specify below)</option>
                  </select>
                  {(![
                    'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi',
                    'Bangalore - Indiranagar', 'Bangalore - Koramangala', 'Bangalore - Whitefield',
                    'Bangalore - HSR Layout', 'Bangalore - BTM Layout', 'Bangalore - Jayanagar',
                    'Bangalore - Electronic City'
                  ].includes(editData.location) && editData.location !== '') && (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => handleEditChange('location', e.target.value)}
                      className="input mt-2"
                      placeholder="Enter custom location"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={editData.terms}
                    onChange={(e) => handleEditChange('terms', e.target.value)}
                    className="input"
                    rows={4}
                    placeholder="Enter terms and conditions"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium text-gray-900">{contract.product?.name}</p>
                    <p className="text-sm text-gray-500">{contract.product?.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium text-gray-900">
                      {contract.quantity} {contract.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price per Unit</p>
                    <p className="font-medium text-gray-900">₹{contract.pricePerUnit}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{contract.totalValue.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(contract.startDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Date</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(contract.deliveryDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {contract.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Location</p>
                      <p className="font-medium text-gray-900">{contract.location}</p>
                    </div>
                  </div>
                )}

                {contract.terms && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Terms & Conditions</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transactions */}
          {contract.transactions && contract.transactions.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>
              <div className="space-y-3">
                {contract.transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono">
                            Trans ID: {transaction.id.substring(0, 8)}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          transaction.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : transaction.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : transaction.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : transaction.status === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {transaction.paymentMethod && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {transaction.paymentMethod.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                      {transaction.paymentType && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {transaction.paymentType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {user?.role !== 'BUYER' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
              </div>
              <PaymentForm
                contractId={contract.id}
                amount={contract.totalValue}
                onSubmit={async (paymentData) => {
                  try {
                    await axios.post('/api/transactions', paymentData);
                    queryClient.invalidateQueries({ queryKey: ['contract', id] });
                    queryClient.invalidateQueries({ queryKey: ['contracts'] });
                  } catch (error) {
                    console.error('Error creating payment:', error);
                  }
                }}
                onCancel={() => {}}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parties */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Parties</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Farmer</p>
                <p className="font-medium text-gray-900">{contract.farmer?.name}</p>
                <p className="text-sm text-gray-600">{contract.farmer?.email}</p>
                {contract.farmer?.phone && (
                  <p className="text-sm text-gray-600">{contract.farmer.phone}</p>
                )}
                {contract.farmer?.city && contract.farmer?.state && (
                  <p className="text-sm text-gray-600">
                    {contract.farmer.city}, {contract.farmer.state}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Buyer</p>
                <p className="font-medium text-gray-900">{contract.buyer?.name}</p>
                <p className="text-sm text-gray-600">{contract.buyer?.email}</p>
                {contract.buyer?.phone && (
                  <p className="text-sm text-gray-600">{contract.buyer.phone}</p>
                )}
                {contract.buyer?.city && contract.buyer?.state && (
                  <p className="text-sm text-gray-600">
                    {contract.buyer.city}, {contract.buyer.state}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Actions */}
          {canUpdateStatus && contract.status !== 'COMPLETED' && contract.status !== 'CANCELLED' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                {contract.status === 'DRAFT' && (
                  <button
                    onClick={() => updateStatusMutation.mutate('PENDING')}
                    disabled={updateStatusMutation.isPending}
                    className="w-full btn btn-secondary"
                  >
                    Send for Approval
                  </button>
                )}
                {contract.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateStatusMutation.mutate('ACTIVE')}
                      disabled={updateStatusMutation.isPending}
                      className="w-full btn btn-primary flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Contract
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate('CANCELLED')}
                      disabled={updateStatusMutation.isPending}
                      className="w-full btn btn-danger flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Contract
                    </button>
                  </>
                )}
                {contract.status === 'ACTIVE' && (
                  <button
                    onClick={() => updateStatusMutation.mutate('COMPLETED')}
                    disabled={updateStatusMutation.isPending}
                    className="w-full btn btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContractDetail

