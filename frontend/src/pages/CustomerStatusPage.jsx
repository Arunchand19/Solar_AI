import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, CheckCircle2, Clock, AlertCircle, Home } from 'lucide-react';
import api from '../lib/api';
import { Spinner } from '../components/ui';

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

export default function CustomerStatusPage() {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get(`/projects/status/${token}`);
      setProject(data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 to-white flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Project not found</h1>
        <p className="text-gray-500 mb-6">The project link may have expired or is invalid.</p>
        <Link to="/" className="btn-primary inline-flex">Back to Home</Link>
      </div>
    </div>
  );

  const currentIdx = project.statusOrder.indexOf(project.status);
  const isCompleted = project.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-brand-green">SolarSmart</p>
            <p className="text-xs text-gray-500">Project Status Tracker</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Solar Project</h1>
          <p className="text-gray-500 mb-4">{project.customerName}</p>
          <div className="inline-flex items-center gap-2 bg-solar-100 text-brand-green px-4 py-2 rounded-full font-semibold">
            <Sun className="w-4 h-4" />
            {project.systemKw} kW System
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900">Installation Progress</h2>
              <span className="text-2xl font-bold text-brand-green">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-brand-green h-3 rounded-full" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <p className="text-2xl font-bold text-brand-green">{STATUS_LABELS[project.status]}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h3 className="font-semibold text-gray-900 mb-6">Project Timeline</h3>

          <div className="space-y-4">
            {project.statusOrder.map((status, idx) => {
              const isActive = idx === currentIdx;
              const isDone = idx < currentIdx;
              const label = project.statusLabels[status];
              const history = project.history?.find(h => h.toStatus === status);

              return (
                <motion.div key={status} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-4 pb-4 ${idx < project.statusOrder.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isDone ? 'bg-brand-green text-white' :
                      isActive ? 'bg-brand-green text-white ring-4 ring-solar-100' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Clock className="w-5 h-5" /> : idx + 1}
                    </div>
                    {idx < project.statusOrder.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${isDone ? 'bg-brand-green' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-semibold ${isDone ? 'text-brand-green' : isActive ? 'text-brand-green' : 'text-gray-400'}`}>
                      {label}
                    </p>
                    {history && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">{history.note}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(history.changedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Completion Message */}
        {isCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">Installation Complete!</h3>
            <p className="text-green-700 mb-4">Your solar system is now generating clean energy. Enjoy your savings!</p>
            <p className="text-sm text-green-600">Subsidy credited: ₹78,000</p>
          </motion.div>
        )}

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <Home className="w-8 h-8 text-brand-green mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Questions?</h3>
          <p className="text-gray-600 text-sm mb-4">Our team is here to help</p>
          <a href="tel:+91XXXXXXXXXX" className="btn-primary inline-flex">Call Us</a>
        </motion.div>
      </div>
    </div>
  );
}
