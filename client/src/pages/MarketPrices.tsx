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
  const [days, setDays] = useState(30)
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
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

  const { data: priceHistoryData } = useQuery({
    queryKey: ['marketPrices', 'history', selectedProduct, days, selectedArea],
    queryFn: async () => {
      if (!selectedProduct) return []
      const params: any = { days }
      if (selectedArea) params.location = selectedArea
      const res = await axios.get(
        `/api/market-prices/product/${selectedProduct}`,
        { params }
      )
      return res.data.prices
    },
    enabled: !!selectedProduct,
  })

  const latestPrices = latestPricesData || []
  const priceHistory = priceHistoryData || []

  // Calculate price change
  const getPriceChange = (prices: any[]) => {
    if (prices.length < 2) return { change: 0, percentage: 0 }
    const latest = prices[prices.length - 1].price
    const previous = prices[prices.length - 2].price
    const change = latest - previous
    const percentage = previous !== 0 ? (change / previous) * 100 : 0
    return { change, percentage }
  }

  const chartData = priceHistory.map((price: any) => ({
    date: format(new Date(price.date), 'MMM dd'),
    price: price.price,
  }))

  const priceChange = priceHistory.length > 0 ? getPriceChange(priceHistory) : null

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

  // Calculate statistics
  const calculateStats = (prices: any[]) => {
    if (prices.length === 0) return null
    const priceValues = prices.map((p) => p.price)
    const min = Math.min(...priceValues)
    const max = Math.max(...priceValues)
    const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
    const latest = prices[prices.length - 1].price
    const oldest = prices[0].price
    const totalChange = latest - oldest
    const totalChangePercent = oldest !== 0 ? (totalChange / oldest) * 100 : 0

    return { min, max, avg, latest, oldest, totalChange, totalChangePercent }
  }

  const stats = priceHistory.length > 0 ? calculateStats(priceHistory) : null

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

      {/* Price History Chart */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('market.priceHistory')}</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="input md:w-64"
            >
              <option value="">{t('market.selectProduct')}...</option>
              {productsData?.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="input md:w-48"
            >
              <option value={7}>{t('market.lastUpdated')} 7 {t('common.days')}</option>
              <option value={30}>{t('market.lastUpdated')} 30 {t('common.days')}</option>
              <option value={90}>{t('market.lastUpdated')} 90 {t('common.days')}</option>
              <option value={180}>{t('market.lastUpdated')} 180 {t('common.days')}</option>
            </select>
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
          </div>
          {selectedArea && (
            <p className="text-sm text-gray-600 mt-2">
              📍 {t('market.location')}: <strong>{selectedArea}</strong>
            </p>
          )}
        </div>

        {selectedProduct && priceHistory.length > 0 ? (
          <div>
            {/* Statistics Cards */}
            {stats && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Price Statistics</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>Real-time data</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('market.currentPrice')}</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.latest.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('market.averagePrice')}</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.avg.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('market.highestPrice')}</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.max.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{t('market.lowestPrice')}</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.min.toFixed(2)}</p>
                </div>
              </div>
            </div>
            )}

            {/* Price Change Info */}
            {priceChange && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {priceChange.change > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : priceChange.change < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <Minus className="w-5 h-5 text-gray-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {t('market.priceChange')}: {priceChange.change > 0 ? '+' : ''}
                      ₹{priceChange.change.toFixed(2)} ({priceChange.percentage > 0 ? '+' : ''}
                      {priceChange.percentage.toFixed(2)}%)
                    </span>
                  </div>
                  {stats && (
                    <div className="text-sm text-gray-600">
                      Period Change: {stats.totalChange > 0 ? '+' : ''}₹
                      {stats.totalChange.toFixed(2)} ({stats.totalChangePercent > 0 ? '+' : ''}
                      {stats.totalChangePercent.toFixed(2)}%)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chart Type Selector */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('market.priceChart')}:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'line'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('common.line')}
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'area'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('common.area')}
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm ${
                    chartType === 'bar'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t('common.bar')}
                </button>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`₹${value}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Price (₹)"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`₹${value}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    name="Price (₹)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => [`₹${value}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="price" fill="#22c55e" name="Price (₹)" />
                </BarChart>
              )}
            </ResponsiveContainer>

            {/* Price History Table */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{t('market.priceHistory')}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span>Connected to real-time updates</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-semibold text-gray-900">{t('common.date')}</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900">{t('market.currentPrice')}</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900">{t('contract.unit')}</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900">{t('contract.location')}</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900">{t('market.priceChange')}</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((price: any, index: number) => {
                      const prevPrice = index > 0 ? priceHistory[index - 1].price : null
                      const change = prevPrice ? price.price - prevPrice : null
                      return (
                        <tr key={price.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4">
                            {format(new Date(price.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="py-2 px-4 font-medium">₹{price.price}</td>
                          <td className="py-2 px-4 text-gray-600">{price.unit}</td>
                          <td className="py-2 px-4 text-gray-600">{price.location || '-'}</td>
                          <td className="py-2 px-4">
                            {change !== null ? (
                              <span
                                className={
                                  change > 0
                                    ? 'text-green-600'
                                    : change < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }
                              >
                                {change > 0 ? '+' : ''}₹{change.toFixed(2)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {index === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Real-time
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">Historical</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : selectedProduct ? (
          <div className="text-center py-12 text-gray-500">
            {t('market.priceHistory')} {t('common.available')} {t('common.for')} {t('market.productName')}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {t('market.selectProduct')} {t('common.to')} {t('market.priceHistory')}
          </div>
        )}
      </div>

      {/* Add/Edit Price Modal */}
      {(showAddPriceModal || showEditPriceModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {showEditPriceModal ? t('common.edit') : t('common.add')} {t('market.marketPriceTracking')}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault()
                if (!newPriceData.productId || !newPriceData.price || !newPriceData.unit) {
                  return
                }
                if (showEditPriceModal) {
                  updatePriceMutation.mutate(newPriceData)
                } else {
                  addPriceMutation.mutate(newPriceData)
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('market.productName')} *
                    </label>
                    <select
                      value={newPriceData.productId}
                      onChange={(e) =>
                        setNewPriceData({ ...newPriceData, productId: e.target.value })
                      }
                      className="input"
                      required
                      disabled={showEditPriceModal} // Prevent changing product when editing
                    >
                      <option value="">{t('market.selectProduct')}</option>
                      {productsData?.map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('market.currentPrice')} (₹) *
                    </label>
                    <input
                      type="number"
                      value={newPriceData.price}
                      onChange={(e) =>
                        setNewPriceData({ ...newPriceData, price: e.target.value })
                      }
                      className="input"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contract.unit')} *
                    </label>
                    <input
                      type="text"
                      value={newPriceData.unit}
                      onChange={(e) =>
                        setNewPriceData({ ...newPriceData, unit: e.target.value })
                      }
                      className="input"
                      required
                      placeholder={`${t('contract.unit')}, ${t('common.etc')}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('market.location')}
                    </label>
                    <select
                      value={newPriceData.location}
                      onChange={(e) =>
                        setNewPriceData({ ...newPriceData, location: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">{t('market.location')}...</option>
                      <optgroup label="Bangalore Areas">
                        {bangaloreAreas.map((area) => (
                          <option key={area} value={`Bangalore - ${area}`}>
                            {t('market.location')} - {area}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('market.location')} Bangalore
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={addPriceMutation.isPending || updatePriceMutation.isPending}
                    className="btn btn-primary"
                  >
                    {addPriceMutation.isPending || updatePriceMutation.isPending
                      ? t('common.saving')
                      : showEditPriceModal
                      ? t('common.update')
                      : t('common.add')} {t('market.currentPrice')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPriceModal(false)
                      setShowEditPriceModal(false)
                      setEditingPrice(null)
                      setNewPriceData({ productId: '', price: '', unit: '', location: '' })
                    }}
                    className="btn btn-secondary"
                  >
                    {t('common.cancel')}
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

export default MarketPrices

