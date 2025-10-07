import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from './components/ThemeToggle'
import LogoutButton from './components/LogoutButton'
import { Heart, MessageCircle, Music, Code, Wallet, Image as ImageIcon, LayoutGrid } from 'lucide-react'
import Home from './pages/Home'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import MusicPage from './pages/MusicPage'
import CodingPage from './pages/CodingPage'
import ExpensesPage from './pages/ExpensesPage'
import MemoriesPage from './pages/MemoriesPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

function AppShell() {
  const location = useLocation()
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="hidden md:block p-4 border-r border-white/10">
        <div className="flex items-center justify-between mb-6 gap-2">
          <Link to="/" className="text-xl font-bold gradient-text">Linkzy</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        <nav className="space-y-2">
          <SidebarLink to="/dashboard" label="Dashboard" icon={<LayoutGrid size={16} />} />
          <SidebarLink to="/chat" label="Chat" icon={<MessageCircle size={16} />} />
          <SidebarLink to="/music" label="Music" icon={<Music size={16} />} />
          <SidebarLink to="/coding" label="Coding" icon={<Code size={16} />} />
          <SidebarLink to="/expenses" label="Expenses" icon={<Wallet size={16} />} />
          <SidebarLink to="/memories" label="Memories" icon={<ImageIcon size={16} />} />
        </nav>
      </aside>

      <main className="p-4 md:p-8">
        <div className="md:hidden mb-4 flex items-center justify-between gap-2">
          <Link to="/" className="text-lg font-semibold gradient-text">Linkzy</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
      </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<div className="opacity-60">Loading…</div>}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/music" element={<MusicPage />} />
                  <Route path="/coding" element={<CodingPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/memories" element={<MemoriesPage />} />
                </Route>
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
  )
}

function SidebarLink({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
        active ? 'bg-white/10 text-white' : 'hover:bg-white/5 opacity-90'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
