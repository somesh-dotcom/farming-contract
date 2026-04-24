import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { 
  TrendingUp, 
  RefreshCw,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

// Area Price Comparison Component removed - not used in simplified version

const MarketPrices = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedArea, setSelectedArea] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const { t } = useTranslation()

  // Auto-refresh prices every 24 hours (daily updates)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] });
      setLastUpdate(new Date());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Trigger daily date update
  const handleDailyUpdate = async () => {
    try {
      setIsUpdating(true);
      await axios.post('/api/market-prices/update-dates');
      setLastUpdate(new Date());
      // Refresh the prices
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] });
      alert('✅ Daily date update completed! Prices remain the same, dates updated to today.');
    } catch (error) {
      console.error('Error updating dates:', error);
      alert('❌ Failed to update dates. Make sure you are logged in as admin.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Bangalore areas
  const bangaloreAreas = [
    'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
    'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
    'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
    'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
  ]

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

  // Filter to only show Bangalore areas (including general "Bangalore")
  const bangaloreAreaPrefixes = bangaloreAreas.map(area => `Bangalore - ${area}`)
  bangaloreAreaPrefixes.push('Bangalore') // Include general Bangalore location
  
  const filteredPrices = selectedArea 
    ? latestPrices
    : latestPrices.filter((price: any) => 
        price.location && bangaloreAreaPrefixes.includes(price.location)
      )

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
        {/* Only show update button for admins */}
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleDailyUpdate}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update to Today'}
          </button>
        )}
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

      {/* Latest Prices Grid */}
      {selectedArea && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            📍 {t('market.currentPrices')}: <strong>{selectedArea}</strong>
          </p>
        </div>
      )}
      {filteredPrices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">
            {selectedArea
              ? `${t('market.location')}: ${selectedArea}. ${t('market.priceHistory')}`
              : t('market.currentPrices')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price: any) => (
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
            </div>
          ))}
        </div>
      )}

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
    </div>
  )
}

export default MarketPrices

