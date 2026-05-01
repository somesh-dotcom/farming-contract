import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Sprout } from 'lucide-react'

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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{
          backgroundImage: 'url(https://www.theindiaforum.in/sites/default/files/styles/cover_story/public/field/image/2022/06/21/ramkumar-radhakrishnan-wikimedia-1622193304-1622193304.jpeg.webp)'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[500px] rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20">
        {/* Login Form (Centered Glass Look) */}
        <div className="w-full p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/5 relative">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">Contract Farming</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-lg">{t('auth.loginTitle')}</h1>
            <p className="text-white/80 font-medium">{t('auth.loginSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-white rounded-2xl text-sm font-medium flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-white/90 uppercase tracking-wider mb-2 drop-shadow">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium placeholder-white/40 backdrop-blur-md"
                required
                placeholder={t('auth.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white/90 uppercase tracking-wider mb-2 flex justify-between drop-shadow">
                <span>{t('auth.password')}</span>
                <a href="#" className="text-emerald-400 hover:text-emerald-300 normal-case tracking-normal transition-colors">Forgot password?</a>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium placeholder-white/40 backdrop-blur-md"
                required
                placeholder={t('auth.enterPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group mt-4 border border-emerald-400/30"
            >
              <span>{loading ? t('auth.signingIn') : t('auth.signIn')}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-white/80 font-medium">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

