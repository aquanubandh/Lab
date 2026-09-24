import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage.tsx'
import AppPage from './pages/AppPage.tsx'
import PLCounterPage from './pages/PLCounterPage.tsx'
import { trackPageView } from './utils/analytics'

function App() {
  const location = useLocation()
  
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return false
  })

  // Theme toggle
  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  // SPA Page View Tracking
  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location.pathname, location.search])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Navigate to="/lab" replace />} />
        <Route path="/lab" element={<LandingPage dark={dark} setDark={setDark} />} />
        <Route path="/disease-detector" element={<AppPage dark={dark} setDark={setDark} />} />
        <Route path="/pl-counter" element={<PLCounterPage dark={dark} setDark={setDark} />} />
      </Routes>
    </div>
  )
}

export default App
