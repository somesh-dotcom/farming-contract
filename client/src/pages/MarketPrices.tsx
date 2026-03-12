import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Clock
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'

// Area Price Comparison Component
const AreaPriceComparison = ({ productId }: { productId: string }) => {
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
            })
            return { location, prices: res.data.prices }
          } catch {
            return { location, prices: [] }
          }
        })
      )
      return prices
        .filter((p) => p.prices.length > 0)
        .map((p) => ({
          area: p.location.replace('Bangalore - ', ''),
          price: p.prices[0]?.price || 0,
          date: p.prices[0]?.date || new Date(),
        }))
        .sort((a, b) => b.price - a.price)
    },
    enabled: !!productId,
  })

  if (!areaPrices || areaPrices.length === 0) {
    return <p className="text-gray-500 text-center py-4">No area-wise data available</p>
  }

  const maxPrice = Math.max(...areaPrices.map((p: any) => p.price))
  const minPrice = Math.min(...areaPrices.map((p: any) => p.price))

  return (
    <div className="space-y-3">
      {areaPrices.map((areaPrice: any) => {
        const percentage = ((areaPrice.price - minPrice) / (maxPrice - minPrice)) * 100
        return (
          <div key={areaPrice.area} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{areaPrice.area}</span>
              <span className="font-bold text-gray-900">₹{areaPrice.price.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const MarketPrices = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [showAddPriceModal, setShowAddPriceModal] = useState(false)
  const [showEditPriceModal, setShowEditPriceModal] = useState(false)
  const [editingPrice, setEditingPrice] = useState<any>(null)
  const [newPriceData, setNewPriceData] = useState({
    productId: '',
    price: '',
    unit: '',
    location: '',
  })
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { t } = useTranslation()

  // Auto-refresh prices every 24 hours (daily updates)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] });
      setLastUpdate(new Date());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Bangalore areas
  const bangaloreAreas = [
    'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
    'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
    'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
    'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
  ]

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('/api/products')
      return res.data.products
    },
  })

  const { data: latestPricesData } = useQuery({
    queryKey: ['marketPrices', 'latest', selectedArea],
    queryFn: async () => {
      const params: any = { latest: 'true' }
      if (selectedArea) params.location = selectedArea
      const res = await axios.get('/api/market-prices', { params })
      return res.data.prices
    },
  })

  const latestPrices = latestPricesData || []

  const addPriceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/market-prices', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] })
      setShowAddPriceModal(false)
      setNewPriceData({ productId: '', price: '', unit: '', location: '' })
    },
  })

  const updatePriceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put(`/api/market-prices/${editingPrice.id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] })
      setShowEditPriceModal(false)
      setEditingPrice(null)
    },
  })

  const deletePriceMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await axios.delete(`/api/market-prices/${priceId}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] })
    },
  })

  const canAddPrice = user?.role === 'ADMIN' || user?.role === 'BUYER'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('market.marketPriceTracking')}</h1>
        <p className="text-gray-600 mt-1">{t('market.priceTrends')}</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Daily price updates</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Area Filter */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('market.location')} ({t('common.optional')})
        </label>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="input md:w-64"
        >
          <option value="">{t('common.all')} {t('market.location')}</option>
          {bangaloreAreas.map((area) => (
            <option key={area} value={`Bangalore - ${area}`}>
              {t('market.location')} - {area}
            </option>
          ))}
        </select>
        {selectedArea && (
          <button
            onClick={() => setSelectedArea('')}
            className="mt-2 text-sm text-primary-600 hover:underline"
          >
            {t('common.reset')} {t('common.filter')}
          </button>
        )}
      </div>
        {canAddPrice && (
          <button
            onClick={() => setShowAddPriceModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('market.currentPrice')}
          </button>
        )}
      </div>

      {/* Latest Prices Grid */}
      {selectedArea && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            📍 {t('market.currentPrices')}: <strong>{selectedArea}</strong>
          </p>
        </div>
      )}
      {latestPrices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            {selectedArea
              ? `${t('market.location')}: ${selectedArea}. ${t('market.priceHistory')}`
              : t('market.currentPrices')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPrices.map((price: any) => (
            <div key={price.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {price.product?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{price.product?.category}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">₹{price.price}</span>
                <span className="text-gray-600">/{price.unit}</span>
                <div className="flex items-center gap-1 ml-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-blue-600 font-medium">DAILY</span>
                </div>
              </div>
              {price.location && (
                <p className="text-sm text-gray-500 mt-2">📍 {price.location}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Updated: {format(new Date(price.date), 'MMM dd, yyyy')}
              </p>
              
              {/* Admin Actions */}
              {user?.role === 'ADMIN' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingPrice(price)
                      setNewPriceData({
                        productId: price.productId,
                        price: price.price.toString(),
                        unit: price.unit,
                        location: price.location || ''
                      })
                      setShowEditPriceModal(true)
                    }}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this price?')) {
                        deletePriceMutation.mutate(price.id)
                      }
                    }}
                    className="flex-1 btn btn-danger flex items-center justify-center gap-1"
                    disabled={deletePriceMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Area-wise Price Comparison */}
      {selectedProduct && !selectedArea && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('market.priceTrends')}</h2>
          <AreaPriceComparison productId={selectedProduct} />
        </div>
      )}
    </div>
  )
}

export default MarketPrices

