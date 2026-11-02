import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, FolderPlus, Edit2, Save, X } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ScoreBadge, StatusBadge, Spinner } from '../components/ui';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiEdit, setAiEdit] = useState(false);
  const [aiForm, setAiForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [statusEdit, setStatusEdit] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { fetchLead(); }, [id]);

  const fetchLead = async () => {
    try {
      const { data } = await api.get(`/leads/${id}`);
      setLead(data);
      setAiForm({
        consumerNumber: data.consumerNumber || '',
        tariff: data.tariff || '',
        sanctionedLoad: data.sanctionedLoad || '',
        aiUnits: data.aiUnits || data.avgUnits || '',
      });
      setNewStatus(data.status);
    } catch { toast.error('Lead not found'); navigate('/dashboard'); }
    finally { setLoading(false); }
  };

  const confirmAI = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/leads/${id}/confirm-ai`, aiForm);
      setLead(data);
      setAiEdit(false);
      toast.success('Bill data confirmed');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const updateStatus = async () => {
    try {
      const { data } = await api.patch(`/leads/${id}/status`, { status: newStatus });
      setLead(l => ({ ...l, status: data.status }));
      setStatusEdit(false);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const createProject = async () => {
    try {
      await api.post('/projects', { leadId: id });
      toast.success('Project created!');
      navigate('/projects');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  const billUrl = lead.billPhotoPath
    ? `http://localhost:5000/${lead.billPhotoPath.replace(/\\/g, '/').replace(/^.*uploads/, 'uploads')}`
    : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{lead.leadId}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ScoreBadge score={lead.score} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Lead Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Phone', lead.phone], ['Email', lead.email || '-'],
                ['Pincode', lead.pincode], ['Owner/Tenant', lead.ownerOrTenant],
                ['Roof Type', lead.roofType], ['Roof Area', `${lead.roofArea} sq ft`],
                ['Monthly Bill', `₹${lead.monthlyBill?.toLocaleString('en-IN')}`],
                ['Avg Units', lead.avgUnits ? `${lead.avgUnits} kWh/month` : '-'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-gray-400 text-xs">{k}</p>
                  <p className="font-medium text-gray-800 capitalize mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Bill Reading */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">AI Bill Analysis</h3>
              <div className="flex items-center gap-2">
                {lead.aiConfirmed && <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle className="w-3 h-3" /> Confirmed</span>}
                {!aiEdit ? (
                  <button onClick={() => setAiEdit(true)} className="flex items-center gap-1 text-xs text-brand-green font-medium hover:underline">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <button onClick={() => setAiEdit(false)} className="flex items-center gap-1 text-xs text-gray-500 hover:underline">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>

            {lead.aiConfidence && lead.aiConfidence < 0.75 && !lead.aiConfirmed && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Low confidence ({Math.round(lead.aiConfidence * 100)}%). Please verify the extracted values against the bill image.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'consumerNumber', label: 'Consumer Number' },
                { key: 'tariff', label: 'Tariff Category' },
                { key: 'sanctionedLoad', label: 'Sanctioned Load (kW)' },
                { key: 'aiUnits', label: 'Avg Units/month (kWh)' },
              ].map(({ key, label }) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  {aiEdit ? (
                    <input className="input py-1.5 text-sm" value={aiForm[key]} onChange={e => setAiForm(f => ({ ...f, [key]: e.target.value }))} />
                  ) : (
                    <p className="font-medium text-gray-800 text-sm">{lead[key] || '-'}</p>
                  )}
                </div>
              ))}
            </div>

            {aiEdit && (
              <button onClick={confirmAI} disabled={saving} className="btn-primary mt-4 text-sm">
                {saving ? <Spinner size="sm" /> : <><Save className="w-4 h-4" /> Confirm & Save</>}
              </button>
            )}

            {billUrl && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Bill Image</p>
                <img src={billUrl} alt="Electricity bill" className="rounded-xl border border-gray-200 max-h-48 object-contain w-full bg-gray-50" />
              </div>
            )}
          </div>

          {/* Score Reason */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Score Analysis</h3>
            <div className="flex items-start gap-3">
              <ScoreBadge score={lead.score} />
              <p className="text-sm text-gray-600">{lead.scoreReason}</p>
            </div>
            {lead.recommendedKw && (
              <div className="mt-3 p-3 bg-solar-50 rounded-xl">
                <p className="text-sm text-brand-green font-semibold">Recommended: {lead.recommendedKw} kW system</p>
                <p className="text-xs text-gray-500 mt-1">~{Math.round(lead.recommendedKw * 1400).toLocaleString('en-IN')} units/year generation</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-4">
          {/* Status Update */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <select className="input mb-3" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {['new', 'contacted', 'surveyed', 'quoted', 'converted', 'lost'].map(s => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button onClick={updateStatus} className="btn-primary w-full justify-center text-sm">
              Update Status
            </button>
          </div>

          {/* Actions */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-900 mb-1">Actions</h3>
            {lead.score !== 'Low' && (
              <Link to={`/leads/${id}/quote`} className="btn-primary w-full justify-center text-sm">
                <FileText className="w-4 h-4" /> Build Quote
              </Link>
            )}
            {lead.status === 'converted' || lead.quotes?.length > 0 ? (
              <button onClick={createProject} className="btn-secondary w-full justify-center text-sm">
                <FolderPlus className="w-4 h-4" /> Create Project
              </button>
            ) : null}
          </div>

          {/* Quotes */}
          {lead.quotes?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Quotes</h3>
              {lead.quotes.map(q => (
                <div key={q.id} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-mono text-gray-500">{q.quoteNumber}</p>
                  <p className="font-semibold text-brand-green">₹{q.netCost?.toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={q.status} />
                    <a href={`http://localhost:5000/api/quotes/${q.id}/pdf`} target="_blank" rel="noreferrer"
                      className="text-xs text-brand-green font-medium hover:underline">Download PDF</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
