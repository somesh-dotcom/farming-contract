import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FARMER' as 'FARMER' | 'BUYER',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMatch'))
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordLength'))
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://chaloindiaworld.com/wp-content/uploads/2022/10/Rain-Places-Cover.jpg)'
        }}
      />
      {/* Overlay to enhance readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Glass Effect Form Container */}
      <div className="max-w-2xl w-full rounded-xl shadow-2xl p-8 relative z-10 backdrop-blur-md bg-white/10 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t('auth.registerTitle')}</h1>
          <p className="text-white/90 mt-2 drop-shadow">{t('auth.registerSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.name')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.role')} *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
              >
                <option value="FARMER" className="text-gray-900">{t('auth.farmer')}</option>
                <option value="BUYER" className="text-gray-900">{t('auth.buyer')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.email')} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
                placeholder={t('auth.enterEmail')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.password')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
                placeholder={t('auth.enterPassword')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.confirmPassword')} *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
                placeholder={t('auth.enterConfirmPassword')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.city')}
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              >
                <option value="" className="text-gray-900">{t('auth.selectCity')}</option>
                <option value="Bangalore" className="text-gray-900">Bangalore</option>
                <option value="Mysore" className="text-gray-900">Mysore</option>
                <option value="Mangalore" className="text-gray-900">Mangalore</option>
                <optgroup label="Other Cities">
                  <option value="Chennai" className="text-gray-900">Chennai</option>
                  <option value="Hyderabad" className="text-gray-900">Hyderabad</option>
                  <option value="Pune" className="text-gray-900">Pune</option>
                  <option value="Delhi" className="text-gray-900">Delhi</option>
                  <option value="Mumbai" className="text-gray-900">Mumbai</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Area (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Koramangala, Indiranagar, etc."
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {t('auth.address')}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? t('auth.creatingAccount') : t('auth.signUp')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/90">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-white font-semibold hover:underline drop-shadow">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

