import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderKanban, AlertCircle, CheckCircle2, Clock, Filter, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { Spinner, EmptyState, StatusBadge } from '../components/ui';

const STATUS_ORDER = [
  'advance_pending', 'advance_paid', 'survey_done', 'design_approved',
  'installation', 'net_metering', 'subsidy_applied', 'subsidy_credited', 'completed'
];

const STATUS_LABELS = {
  advance_pending: 'Advance Pending',
  advance_paid: 'Advance Paid',
  survey_done: 'Survey Done',
  design_approved: 'Design Approved',
  installation: 'Installation',
  net_metering: 'Net Metering',
  subsidy_applied: 'Subsidy Applied',
  subsidy_credited: 'Subsidy Credited',
  completed: 'Completed'
};

export default function ProjectTrackerPage() {
  const [projects, setProjects] = useState([]);
  const [stuck, setStuck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchProjects(); }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projRes, stuckRes] = await Promise.all([
        api.get(`/projects${filter ? `?status=${filter}` : ''}`),
        api.get('/projects/dashboard/stuck')
      ]);
      setProjects(projRes.data);
      setStuck(stuckRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => !filter || p.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Track installations from advance to completion</p>
        </div>
      </div>

      {/* Stuck Projects Alert */}
      {stuck.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">{stuck.length} projects stuck for 7+ days</p>
            <p className="text-sm text-red-700 mt-1">
              {stuck.map(p => `${p.lead.name} (${p.lead.phone})`).join(', ')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <div className="card mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="input py-2 text-sm" value={filter} onChange={e => { setFilter(e.target.value); }}>
            <option value="">All Projects</option>
            {STATUS_ORDER.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects" description="Create a project from a converted lead" />
      ) : (
        <div className="grid gap-4">
          {filtered.map((project, i) => {
            const currentIdx = STATUS_ORDER.indexOf(project.status);
            const progress = Math.round(((currentIdx + 1) / STATUS_ORDER.length) * 100);

            return (
              <motion.div key={project.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{project.lead.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{project.projectId}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                {/* Timeline */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {STATUS_ORDER.map((s, idx) => (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          idx < currentIdx ? 'bg-brand-green text-white' :
                          idx === currentIdx ? 'bg-brand-green text-white ring-2 ring-solar-200' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {idx < currentIdx ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                        </div>
                        {idx < STATUS_ORDER.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${idx < currentIdx ? 'bg-brand-green' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-brand-green h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">System Size</p>
                    <p className="font-semibold text-gray-800">{project.lead.recommendedKw} kW</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Latest Quote</p>
                    <p className="font-semibold text-brand-green">
                      {project.lead.quotes?.[0]?.netCost ? `₹${(project.lead.quotes[0].netCost / 1000).toFixed(0)}K` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Phone</p>
                    <p className="font-semibold text-gray-800">{project.lead.phone}</p>
                  </div>
                </div>

                <Link to={`/projects/${project.id}`}
                  className="flex items-center gap-1 text-xs text-brand-green font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ChevronRight className="w-3 h-3" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
