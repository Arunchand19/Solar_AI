import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FolderKanban, Settings,
  Sun, LogOut, Menu, X, ChevronRight, Home
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['sales', 'admin'] },
  { to: '/projects', icon: FolderKanban, label: 'Projects', roles: ['sales', 'admin'] },
  { to: '/admin', icon: Settings, label: 'Admin', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-600 to-emerald-700">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-6 py-6 border-b border-green-500/30">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
          <Sun className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-black text-white text-sm">SolarSmart</p>
          <p className="text-green-200 text-xs font-semibold">Nagpur</p>
        </div>
      </motion.div>

      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.filter(n => n.roles.includes(user?.role)).map(({ to, icon: Icon, label }, i) => {
          const active = location.pathname === to;
          return (
            <motion.div key={to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}>
              <Link to={to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  active
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur'
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="px-3 py-6 border-t border-green-500/30">
        <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-white/10 rounded-xl backdrop-blur">
          <div className="w-9 h-9 bg-white/30 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{user?.name}</p>
            <p className="text-green-200 text-xs capitalize font-semibold">{user?.role}</p>
          </div>
        </div>
        <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 w-full px-4 py-3 text-green-100 hover:text-white hover:bg-white/10 rounded-xl text-sm font-bold transition-all backdrop-blur">
          <LogOut className="w-4 h-4" /> Sign out
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex items-center gap-3 px-4 py-4 bg-white border-b border-green-100 shadow-sm">
          <motion.button onClick={() => setOpen(true)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-green-50 transition-colors">
            <Menu className="w-6 h-6 text-green-600" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-green-600" />
            <span className="font-black text-green-600">SolarSmart</span>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
