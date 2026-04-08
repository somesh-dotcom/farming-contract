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
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://media.licdn.com/dms/image/v2/D4D12AQE3m6wc7HWL7Q/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1688803468436?e=1777507200&v=beta&t=bAQV2osQz--MM77bDg71KWTsdURHnA4ZPLVvD5qxE9A"
          alt="Agricultural farming landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Login Form - Centered Over Image */}
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{t('auth.loginTitle')}</h1>
            <p className="text-white/90 mt-2 drop-shadow">{t('auth.loginSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
                placeholder={t('auth.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                required
                placeholder={t('auth.enterPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/90">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-white font-semibold hover:underline drop-shadow">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

