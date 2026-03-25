import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Contracts from './pages/Contracts'
import ContractDetail from './pages/ContractDetail'
import CreateContract from './pages/CreateContract'
import SendRequest from './pages/SendRequest'
import ContractRequests from './pages/ContractRequests'
import MarketPrices from './pages/MarketPrices'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import Users from './pages/Users'
import Layout from './components/Layout'
import './utils/i18n'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="contracts/new" element={<CreateContract />} />
            <Route path="contracts/send-request" element={<SendRequest />} />
            <Route path="contracts/requests" element={<ContractRequests />} />
            <Route path="contracts/:id" element={<ContractDetail />} />
            <Route path="market-prices" element={<MarketPrices />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App