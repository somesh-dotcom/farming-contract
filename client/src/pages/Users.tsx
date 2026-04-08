import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { UserPlus, Search, Edit, Trash2, User, Key } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Users = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER' as 'FARMER' | 'BUYER',
    phone: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
  })

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', searchTerm, selectedRole],
    queryFn: async () => {
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (selectedRole) params.role = selectedRole
      const res = await axios.get('/api/users', { params })
      return res.data.users
    },
    enabled: user?.role === 'ADMIN',
  })

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/auth/register', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['buyers'] })
      setShowCreateModal(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'BUYER',
        phone: '',
        city: '',
        state: '',
        address: '',
        pincode: '',
      })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put(`/api/users/${editingUser.id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['buyers'] })
      setShowEditModal(false)
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'BUYER',
        phone: '',
        city: '',
        state: '',
        address: '',
        pincode: '',
      })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await axios.delete(`/api/users/${userId}`)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['buyers'] })
      
      // Show success message
      alert(`✅ ${data.message}`);
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      alert(`❌ Error: ${errorMessage}`);
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const res = await axios.put(`/api/users/${userId}/password`, { password })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowPasswordModal(false)
      setEditingUser(null)
    },
  })

  // handleCreateUser is used in the form submission

  if (user?.role !== 'ADMIN') {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Only admins can access this page</p>
      </div>
    )
  }

  const users = usersData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage farmers and buyers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="input md:w-48"
          >
            <option value="">All Roles</option>
            <option value="FARMER">Farmers</option>
            <option value="BUYER">Buyers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-12">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{u.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'FARMER'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.phone || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {u.city && u.state ? `${u.city}, ${u.state}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  {/* Admin Actions */}
                  {user?.role === 'ADMIN' && u.role !== 'ADMIN' && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setFormData({
                              name: u.name,
                              email: u.email,
                              password: '',
                              role: u.role,
                              phone: u.phone || '',
                              city: u.city || '',
                              state: u.state || '',
                              address: u.address || '',
                              pincode: u.pincode || '',
                            })
                            setShowEditModal(true)
                          }}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setShowPasswordModal(true)
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Change password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const confirmMessage = `⚠️ PERMANENT DELETE WARNING\n\nAre you sure you want to permanently delete user: ${u.name} (${u.email})?\n\nThis will delete:\n- User account\n- All contracts\n- All transactions\n- All ratings\n- All notifications\n- All contract requests\n\nThis action CANNOT be undone!`;
                            
                            if (window.confirm(confirmMessage)) {
                              const secondConfirm = window.confirm(`FINAL CONFIRMATION\n\nYou are about to PERMANENTLY delete ${u.name} and ALL their data.\n\nClick OK to proceed with deletion.`);
                              if (secondConfirm) {
                                deleteUserMutation.mutate(u.id);
                              }
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Permanently delete user and all data"
                          disabled={deleteUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setEditingUser(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Changing password for: <strong>{editingUser?.name}</strong> ({editingUser?.email})
                </p>
              </div>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const password = formData.get('password') as string
                  const confirmPassword = formData.get('confirmPassword') as string
                  
                  if (password !== confirmPassword) {
                    alert('Passwords do not match')
                    return
                  }
                  
                  if (password.length < 6) {
                    alert('Password must be at least 6 characters long')
                    return
                  }
                  
                  changePasswordMutation.mutate({ userId: editingUser.id, password })
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="input"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input"
                    required
                    minLength={6}
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="btn btn-primary"
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setEditingUser(null)
                    }}
                    className="btn btn-secondary"
                    disabled={changePasswordMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showEditModal ? 'Edit User' : 'Create New User'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setEditingUser(null)
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      role: 'BUYER',
                      phone: '',
                      city: '',
                      state: '',
                      address: '',
                      pincode: '',
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  if (showEditModal) {
                    updateUserMutation.mutate(formData)
                  } else {
                    createUserMutation.mutate(formData)
                  }
                }} 
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as 'FARMER' | 'BUYER' })
                      }
                      className="input"
                      required
                    >
                      <option value="FARMER">Farmer</option>
                      <option value="BUYER">Buyer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      required
                      disabled={showEditModal} // Prevent changing email when editing
                    />
                  </div>

                  {!showEditModal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input"
                    >
                      <option value="">Select a city</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mysore">Mysore</option>
                      <option value="Mangalore">Mangalore</option>
                      <optgroup label="Other Cities">
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area/Locality</label>
                    <input
                      type="text"
                      placeholder="e.g., Koramangala, Indiranagar, etc."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending
                      ? (showEditModal ? 'Updating...' : 'Creating...')
                      : (showEditModal ? 'Update User' : 'Create User')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      setEditingUser(null)
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        role: 'BUYER',
                        phone: '',
                        city: '',
                        state: '',
                        address: '',
                        pincode: '',
                      })
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users

