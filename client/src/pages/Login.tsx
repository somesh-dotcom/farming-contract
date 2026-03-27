import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { LogIn } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt2BCBA4pGOULO6vvQ9mb3qiM-kPIM4LwDwBvMYD3t0NBTtp_MewTs3UXF&s=10"
          alt="Agricultural farming landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Welcome to Agricultural Trading Platform</h1>
          <p className="text-xl text-center max-w-lg">Connect directly with farmers, ensure fair prices, and build trusted partnerships for quality agricultural products.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t('auth.loginTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('auth.loginSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                placeholder={t('auth.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                placeholder={t('auth.enterPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

