import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { 
  TrendingUp, 
  RefreshCw,
  Clock,
  MapPin,
  Filter,
  BarChart2,
  Edit2,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

const MarketPrices = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedArea, setSelectedArea] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingPrice, setEditingPrice] = useState<any>(null)
  const [editPriceValue, setEditPriceValue] = useState<string>('')
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)
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
    } catch (error) {
      console.error('Error updating dates:', error);
      alert('❌ Failed to update dates. Make sure you are logged in as admin.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrice || !editPriceValue) return;
    
    try {
      setIsUpdatingPrice(true);
      await axios.put(`/api/market-prices/${editingPrice.id}`, { price: editPriceValue });
      queryClient.invalidateQueries({ queryKey: ['marketPrices'] });
      setEditingPrice(null);
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Bangalore areas
  const bangaloreAreas = [
    'Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'BTM Layout',
    'Jayanagar', 'Malleshwaram', 'Electronic City', 'Marathahalli', 'Bannerghatta',
    'Hebbal', 'Yelahanka', 'Frazer Town', 'RT Nagar', 'Peenya',
    'Banashankari', 'Basavanagudi', 'Wilson Garden', 'Ulsoor', 'KR Puram'
  ]

  const { data: latestPricesData, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{t('market.marketPriceTracking')}</h1>
          </div>
          <p className="text-base text-gray-500 font-medium">{t('market.priceTrends')}</p>
          <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-gray-500 bg-white/80 px-3 py-1.5 rounded-full inline-flex border border-gray-100 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
            <span>Daily updates</span>
            <span className="text-gray-300 mx-1">•</span>
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Only show update button for admins */}
        {user?.role === 'ADMIN' && (
          <div className="relative z-10 w-full sm:w-auto">
            <button
              onClick={handleDailyUpdate}
              disabled={isUpdating}
              className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100 w-full shadow-lg shadow-emerald-500/30"
            >
              <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Updating...' : 'Force Sync Data'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative z-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-sm uppercase tracking-wider">{t('market.location')} Filter</span>
          </div>
          <div className="relative w-full sm:w-72">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
            >
              <option value="">{t('common.all')} {t('market.location')}</option>
              {bangaloreAreas.map((area) => (
                <option key={area} value={`Bangalore - ${area}`}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          {selectedArea && (
            <button
              onClick={() => setSelectedArea('')}
              className="text-sm font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {t('common.reset')}
            </button>
          )}
        </div>

        {selectedArea && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl inline-flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-800 font-medium">
              Showing prices for: <strong className="text-emerald-900">{selectedArea.replace('Bangalore - ', '')}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Latest Prices Grid */}
      {filteredPrices.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <BarChart2 className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">
            {selectedArea ? `No data for ${selectedArea.replace('Bangalore - ', '')}` : 'No market data available'}
          </p>
          <p className="text-gray-500">Check back later for updated prices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrices.map((price: any) => (
            <div 
              key={price.id} 
              className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent opacity-0 group-hover:opacity-50 rounded-bl-full transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {price.product?.name}
                  </h3>
                  <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    {price.product?.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setEditingPrice(price);
                        setEditPriceValue(price.price.toString());
                      }}
                      className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-gray-500 hover:scale-110 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm cursor-pointer"
                      title="Edit Price"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 mb-4 relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">₹{price.price}</span>
                  <span className="text-gray-500 font-medium">/{price.unit}</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Rate</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 relative z-10 space-y-2">
                {price.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{price.location.replace('Bangalore - ', '')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated: {format(new Date(price.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Update Market Price</h2>
              <button 
                onClick={() => setEditingPrice(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePrice} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-800 font-medium">
                  {editingPrice.product?.name} ({editingPrice.location?.replace('Bangalore - ', '') || 'All Locations'})
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Price (₹ per {editingPrice.unit})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editPriceValue}
                  onChange={(e) => setEditPriceValue(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-gray-900"
                  placeholder="Enter new price"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPrice(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPrice}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
                >
                  {isUpdatingPrice ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Update Price'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketPrices

