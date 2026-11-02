import { motion } from 'framer-motion';

export function Skeleton({ className = '' }) {
  return <div className={`shimmer-bg rounded-xl ${className}`} />;
}

export function ScoreBadge({ score }) {
  if (!score) return null;
  const map = {
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };
  return <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={map[score] || 'badge-medium'}>{score}</motion.span>;
}

export function StatusBadge({ status }) {
  const map = {
    new: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800',
    contacted: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800',
    surveyed: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800',
    quoted: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800',
    converted: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800',
    lost: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800',
  };
  return (
    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </motion.span>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
  const colors = {
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-600',
    orange: 'bg-gradient-to-br from-orange-50 to-red-50 text-orange-600',
    blue: 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600',
    red: 'bg-gradient-to-br from-red-50 to-pink-50 text-red-600',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600',
  };
  return (
    <motion.div whileHover={{ y: -4, shadow: 'lg' }} className="card border-green-200 hover:border-green-300 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${colors[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 font-semibold">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5 font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        <Icon className="w-10 h-10 text-green-600" />
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6 font-medium">{description}</p>
      {action}
    </motion.div>
  );
}

export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${s[size]} border-3 border-green-200 border-t-green-600 rounded-full`} />
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-black gradient-text">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600 mt-2 font-semibold">{subtitle}</p>}
      </div>
      {action && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>{action}</motion.div>}
    </motion.div>
  );
}
