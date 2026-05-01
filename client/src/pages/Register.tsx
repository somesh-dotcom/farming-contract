import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Sprout } from 'lucide-react'

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
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{
          backgroundImage: 'url(https://www.theindiaforum.in/sites/default/files/styles/cover_story/public/field/image/2022/06/21/ramkumar-radhakrishnan-wikimedia-1622193304-1622193304.jpeg.webp)'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[900px] rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20">
        {/* Register Form (Centered) */}
        <div className="w-full p-8 md:p-12 flex flex-col justify-center bg-white/5 relative max-h-[90vh] overflow-y-auto scrollbar-hide">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">Contract Farming</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-lg">{t('auth.registerTitle')}</h1>
            <p className="text-white/80 font-medium">{t('auth.registerSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-white rounded-2xl text-sm font-medium flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-white/40"
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.role')} *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                  required
                >
                  <option value="FARMER" className="bg-gray-900">{t('auth.farmer')}</option>
                  <option value="BUYER" className="bg-gray-900">{t('auth.buyer')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-white/40"
                  required
                  placeholder={t('auth.enterEmail')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-white/40"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-white/40"
                  required
                  placeholder={t('auth.enterPassword')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-white/40"
                  required
                  placeholder={t('auth.enterConfirmPassword')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  {t('auth.city')}
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                >
                  <option value="" className="bg-gray-900">{t('auth.selectCity')}</option>
                  <option value="Bangalore" className="bg-gray-900">Bangalore</option>
                  <option value="Mysore" className="bg-gray-900">Mysore</option>
                  <option value="Mangalore" className="bg-gray-900">Mangalore</option>
                  <optgroup label="Other Cities" className="bg-gray-900">
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                  Area (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Koramangala"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder-white/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group mt-6"
            >
              <span>{loading ? t('auth.creatingAccount') : t('auth.signUp')}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-8">
            <p className="text-white/80 font-medium">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

