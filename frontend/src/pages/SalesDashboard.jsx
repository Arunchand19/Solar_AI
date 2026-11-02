import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, TrendingUp, FileText, FolderKanban, Search, Filter, ChevronRight, Plus } from 'lucide-react';
import api from '../lib/api';
import { StatCard, ScoreBadge, StatusBadge, EmptyState, Skeleton, PageHeader } from '../components/ui';

export default function SalesDashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [scoreFilter, statusFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (scoreFilter) params.set('score', scoreFilter);
      if (statusFilter) params.set('status', statusFilter);

      const [leadsRes, statsRes] = await Promise.all([
        api.get(`/leads?${params}`),
        api.get('/leads/stats/summary')
      ]);
      setLeads(leadsRes.data.leads);
      setTotal(leadsRes.data.total);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) || l.leadId.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Sales Dashboard"
        subtitle="Manage leads and track conversions"
        action={
          <Link to="/apply" className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> New Lead
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading && !stats ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard label="Total Leads" value={stats?.total || 0} icon={Users} color="blue" />
            <StatCard label="High Score" value={stats?.high || 0} icon={TrendingUp} color="green" sub="Ready for survey" />
            <StatCard label="Medium Score" value={stats?.medium || 0} icon={FileText} color="orange" sub="Needs call" />
            <StatCard label="Converted" value={stats?.converted || 0} icon={FolderKanban} color="purple" />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-9 py-2.5" placeholder="Search by name, phone or lead ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="input py-2.5 w-36" value={scoreFilter} onChange={e => { setScoreFilter(e.target.value); setPage(1); }}>
              <option value="">All Scores</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="input py-2.5 w-36" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="surveyed">Surveyed</option>
              <option value="quoted">Quoted</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No leads found" description="Try adjusting your filters or add a new lead" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Lead</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Contact</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Score</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Bill</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden lg:table-cell">System</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((lead, i) => (
                    <motion.tr key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{lead.leadId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-gray-600">{lead.phone}</p>
                        <p className="text-xs text-gray-400">{lead.pincode}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={lead.score} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-700">₹{lead.monthlyBill?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400 capitalize">{lead.ownerOrTenant}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-sm text-gray-700">{lead.recommendedKw ? `${lead.recommendedKw} kW` : '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/leads/${lead.id}`}
                          className="flex items-center gap-1 text-xs text-brand-green font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 15 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Showing {filtered.length} of {total}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} className="btn-secondary text-xs py-1.5 px-3">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
