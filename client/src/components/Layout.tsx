import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative selection:bg-primary-200 selection:text-primary-900">
      {/* Global Background Blobs for Glassmorphism Effect */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/40 blur-[100px] pointer-events-none animate-float"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-100/40 blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - responsive */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform transition-all duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
        h-full w-72 lg:p-4
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
        <div className="p-4 pb-0 lg:px-8 lg:pt-4">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        
        <main 
          key={location.pathname} // Forces re-render for animation on route change
          className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in"
        >
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
