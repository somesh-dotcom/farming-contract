import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { PlusCircle, ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Area Price Comparison Component
const AreaPriceComparison = ({ productId }: { productId: string }) => {
  const { t } = useTranslation();
  
  const { data: areaPrices } = useQuery({
    queryKey: ['marketPrices', 'byArea', productId],
    queryFn: async () => {
      // Bangalore areas
      const areas = [
        'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
        'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
        'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
        'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
      ];
      
      // Add full location names
      const locations = areas.map(area => `Bangalore - ${area}`);
      
      const prices = await Promise.all(
        locations.map(async (location) => {
          try {
            const res = await axios.get('/api/market-prices', {
              params: { productId, location: location, latest: 'true' }
            });
            return { location, prices: res.data.prices };
          } catch {
            return { location, prices: [] };
          }
        })
      );
      
      return prices
        .filter((p) => p.prices.length > 0)
        .map((p) => ({
          area: p.location.replace('Bangalore - ', ''),
          price: p.prices[0]?.price || 0,
          date: p.prices[0]?.date || new Date(),
        }))
        .sort((a, b) => b.price - a.price);
    },
    enabled: !!productId,
  });

  if (!areaPrices || areaPrices.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">{t('market.noAreaData')}</p>
      </div>
    );
  }

  const maxPrice = Math.max(...areaPrices.map((p: any) => p.price));
  const minPrice = Math.min(...areaPrices.map((p: any) => p.price));

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">{t('market.areaPriceComparison')}</h3>
      <div className="max-h-60 overflow-y-auto pr-2">
        {areaPrices.map((areaPrice: any) => {
          const percentage = maxPrice > minPrice 
            ? ((areaPrice.price - minPrice) / (maxPrice - minPrice)) * 100 
            : 100;
          
          return (
            <div key={areaPrice.area} className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{areaPrice.area}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">₹{areaPrice.price.toFixed(2)}</span>
                  {areaPrice.price === maxPrice && (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                  {areaPrice.price === minPrice && (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  {areaPrice.price !== maxPrice && areaPrice.price !== minPrice && (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {t('market.priceBasedOnLatestData')}
      </p>
    </div>
  );
};

const CreateContract = () => {
  const { user, token } = useAuth()
  
  // Debug authentication state
  useEffect(() => {
    console.log('Auth Debug - User:', user);
    console.log('Auth Debug - Token exists:', !!token);
    console.log('Auth Debug - Token length:', token ? token.length : 0);
    console.log('Auth Debug - Axios auth header:', axios.defaults.headers.common['Authorization']);
  }, [user, token]);
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    farmerId: '',
    buyerId: '',
    productId: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    startDate: '',
    deliveryDate: '',
    terms: '',
    location: '',
  })

  const [error, setError] = useState('')

  // Fetch products, farmers and buyers
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products')
      return res.data.products
    },
  })

  const { data: buyersData, isLoading: buyersLoading, error: buyersError } = useQuery({
    queryKey: ['buyers', user?.id],
    queryFn: async () => {
      try {
        console.log('Fetching buyers...');
        console.log('Current user:', user);
        console.log('Current token:', token);
        console.log('Current auth header:', axios.defaults.headers.common['Authorization']);
        
        // Ensure token is set in axios defaults
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Token set in axios defaults');
        }
        
        const res = await axios.get('/api/users/by-role/BUYER')
        console.log('Buyers response:', res.data);
        return res.data.users || []
      } catch (error: any) {
        console.error('Error fetching buyers:', error)
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        throw error
      }
    },
    enabled: !!user?.id && !!token, // Only fetch when user is logged in and has token
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  })

  const { data: farmersData, isLoading: farmersLoading, error: farmersError } = useQuery({
    queryKey: ['farmers', user?.id],
    queryFn: async () => {
      try {
        console.log('Fetching farmers...');
        console.log('Current user:', user);
        console.log('Current token:', token);
        console.log('Current auth header:', axios.defaults.headers.common['Authorization']);
        
        // Ensure token is set in axios defaults
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Token set in axios defaults for farmers');
        }
        
        const res = await axios.get('/api/users/by-role/FARMER')
        console.log('Farmers response:', res.data);
        return res.data.users || []
      } catch (error: any) {
        console.error('Error fetching farmers:', error)
        console.error('Error response:', error.response?.data);
        throw error
      }
    },
    enabled: !!user?.id && !!token && user?.role === 'ADMIN',
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  })

  const createContractMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/contracts', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      navigate('/contracts')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create contract')
    },
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // For admins, farmerId is required. For farmers, use their own ID
    const farmerId = user?.role === 'ADMIN' 
      ? formData.farmerId 
      : user?.id;

    if (!farmerId || !formData.buyerId || !formData.productId || !formData.quantity || !formData.pricePerUnit || !formData.startDate || !formData.deliveryDate) {
      setError(t('contract.fillAllRequiredFields'))
      return
    }

    const selectedProduct = productsData?.find((p: any) => p.id === formData.productId)
    const unit = formData.unit || selectedProduct?.unit || 'kg'

    createContractMutation.mutate({
      ...formData,
      farmerId,
      quantity: parseFloat(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      unit,
    })
  }

  const selectedProduct = productsData?.find((p: any) => p.id === formData.productId)

  // Only allow farmers to create contracts, or admins who can select farmers
  if (user?.role !== 'FARMER' && user?.role !== 'ADMIN') {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">{t('contract.onlyFarmersCreateContracts')}</p>
      </div>
    )
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('contract.createContract')}</h1>
          <p className="text-gray-600 mt-1">{t('contract.enterQuantity')}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {buyersData && buyersData.length === 0 && !buyersLoading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
          <p className="font-medium mb-1">{t('contract.noBuyersAvailable')}</p>
          <p className="text-sm">
            {t('contract.registerBuyersFirst')}
          </p>
        </div>
      )}

      {user?.role === 'ADMIN' && farmersData && farmersData.length === 0 && !farmersLoading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
          <p className="font-medium mb-1">{t('contract.noFarmersAvailable')}</p>
          <p className="text-sm">
            {t('contract.registerFarmersFirst')}
          </p>
        </div>
      )}

      {buyersError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium mb-1">Failed to load buyers</p>
          <p className="text-sm">
            {buyersError instanceof Error ? buyersError.message : 'Please refresh the page and try again.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Farmer Selection (Admin only) */}
              {user?.role === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contract.selectFarmer')} *
                  </label>
                  <select
                    name="farmerId"
                    value={formData.farmerId || ''}
                    onChange={handleChange}
                    className={`input ${farmersLoading ? 'opacity-50' : ''}`}
                    required
                    disabled={farmersLoading}
                  >
                    <option value="">
                      {farmersLoading 
                        ? t('common.loading')
                        : farmersError 
                        ? t('contract.errorLoadingFarmers')
                        : farmersData && farmersData.length === 0
                        ? t('contract.noFarmersAvailable')
                        : t('contract.chooseFarmer')}
                    </option>
                    {farmersData && farmersData.length > 0 && farmersData.map((farmer: any) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} {farmer.city && `(${farmer.city})`}
                      </option>
                    ))}
                  </select>
                  {farmersLoading && (
                    <p className="text-xs text-blue-600 mt-1">
                      {t('common.loading')} farmers...
                    </p>
                  )}
                  {farmersError && (
                    <p className="text-xs text-red-600 mt-1">
                      {t('contract.failedToLoadFarmers')}: {farmersError.message || 'Unknown error'}
                    </p>
                  )}
                  {(!farmersData || farmersData.length === 0) && !farmersLoading && !farmersError && (
                    <p className="text-xs text-yellow-600 mt-1">
                      {t('contract.noFarmersRegistered')}
                    </p>
                  )}
                  {farmersData && farmersData.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Found {farmersData.length} farmer{farmersData.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>
              )}
              
              {/* Buyer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contract.selectBuyer')} *
                </label>
                <select
                  name="buyerId"
                  value={formData.buyerId}
                  onChange={handleChange}
                  className={`input ${buyersLoading ? 'opacity-50' : ''}`}
                  required
                  disabled={buyersLoading}
                >
                  <option value="">
                    {buyersLoading 
                      ? t('common.loading')
                      : buyersError 
                      ? t('contract.errorLoadingBuyers')
                      : !buyersData || buyersData.length === 0
                      ? t('contract.noBuyersAvailable')
                      : t('contract.chooseBuyer')}
                  </option>
                  {buyersData && buyersData.length > 0 && buyersData.map((buyer: any) => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.name} {buyer.city && `(${buyer.city})`}
                    </option>
                  ))}
                </select>
                {buyersLoading && (
                  <p className="text-xs text-blue-600 mt-1">
                    {t('common.loading')} buyers...
                  </p>
                )}
                {buyersError && (
                  <p className="text-xs text-red-600 mt-1">
                    {t('contract.failedToLoadBuyers')}: {buyersError.message || 'Unknown error'}
                  </p>
                )}
                {(!buyersData || buyersData.length === 0) && !buyersLoading && !buyersError && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {t('contract.noBuyersRegistered')}
                  </p>
                )}
                {buyersData && buyersData.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Found {buyersData.length} buyer{buyersData.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contract.selectProduct')} *
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">{t('contract.chooseProduct')}</option>
                  {productsData?.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.category})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contract.quantity')} *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="input"
                  step="0.01"
                  min="0"
                  required
                  placeholder={t('contract.enterQuantity')}
                />
              </div>
            </div>
          </div>
          
          {/* Right Column - Area Price Comparison */}
          <div className="lg:col-span-1">
            {formData.productId && (
              <div className="card sticky top-4 bg-blue-50 border-blue-200">
                <AreaPriceComparison productId={formData.productId} />
              </div>
            )}
          </div>
        </div>

        {/* Remaining form fields below the grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contract.unit')} *
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit || selectedProduct?.unit || 'kg'}
              onChange={handleChange}
              className="input"
              required
              placeholder={t('contract.enterUnit')}
            />
            {selectedProduct && (
              <p className="text-xs text-gray-500 mt-1">
                {t('contract.defaultUnit')}: {selectedProduct.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contract.pricePerUnit')} (₹) *
            </label>
            <input
              type="number"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              className="input"
              step="0.01"
              min="0"
              required
              placeholder={t('contract.enterPricePerUnit')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contract.totalValue')} (₹)
            </label>
            <input
              type="text"
              value={
                formData.quantity && formData.pricePerUnit
                  ? (parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)).toLocaleString()
                  : '0'
              }
              className="input bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contract.startDate')} *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contract.deliveryDate')} *
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('contract.location')} *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">{t('contract.selectLocation')}</option>
            <optgroup label="Bangalore Main Areas">
              <option value="Bangalore - Central Bangalore">Central Bangalore</option>
              <option value="Bangalore - East Bangalore">East Bangalore</option>
              <option value="Bangalore - West Bangalore">West Bangalore</option>
              <option value="Bangalore - North Bangalore">North Bangalore</option>
              <option value="Bangalore - South Bangalore">South Bangalore</option>
            </optgroup>
            <optgroup label="Popular Commercial Areas">
              <option value="Bangalore - Indiranagar">Indiranagar</option>
              <option value="Bangalore - Koramangala">Koramangala</option>
              <option value="Bangalore - Whitefield">Whitefield</option>
              <option value="Bangalore - HSR Layout">HSR Layout</option>
              <option value="Bangalore - BTM Layout">BTM Layout</option>
              <option value="Bangalore - Jayanagar">Jayanagar</option>
              <option value="Bangalore - Electronic City">Electronic City</option>
              <option value="Bangalore - Marathahalli">Marathahalli</option>
              <option value="Bangalore - Bannerghatta">Bannerghatta</option>
              <option value="Bangalore - Hebbal">Hebbal</option>
              <option value="Bangalore - Yelahanka">Yelahanka</option>
            </optgroup>
            <optgroup label="Other Bangalore Areas">
              <option value="Bangalore - Malleshwaram">Malleshwaram</option>
              <option value="Bangalore - Frazer Town">Frazer Town</option>
              <option value="Bangalore - RT Nagar">RT Nagar</option>
              <option value="Bangalore - Peenya">Peenya</option>
              <option value="Bangalore - Banashankari">Banashankari</option>
              <option value="Bangalore - Basavanagudi">Basavanagudi</option>
              <option value="Bangalore - Wilson Garden">Wilson Garden</option>
              <option value="Bangalore - Ulsoor">Ulsoor</option>
              <option value="Bangalore - KR Puram">KR Puram</option>
            </optgroup>
          </select>
          
          <p className="text-xs text-gray-500 mt-1">
            {t('contract.selectBangaloreArea')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('contract.terms')}
          </label>
          <textarea
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            className="input"
            rows={4}
            placeholder="Enter any additional terms..."
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={createContractMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            {createContractMutation.isPending ? t('common.loading') : t('contract.createContract')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/contracts')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateContract

