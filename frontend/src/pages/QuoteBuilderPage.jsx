import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Zap, TrendingDown, Download, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui';

export default function QuoteBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [systemKw, setSystemKw] = useState(3);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [quote, setQuote] = useState(null);

  useEffect(() => { fetchLead(); }, [id]);
  useEffect(() => { if (systemKw >= 1) fetchPreview(); }, [systemKw]);

  const fetchLead = async () => {
    const { data } = await api.get(`/leads/${id}`);
    setLead(data);
    if (data.recommendedKw) setSystemKw(data.recommendedKw);
  };

  const fetchPreview = async () => {
    setLoadingPreview(true);
    try {
      const { data } = await api.post('/quotes/preview', { systemSizeKw: systemKw });
      setPreview(data);
    } catch { }
    finally { setLoadingPreview(false); }
  };

  const createQuote = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/quotes', { leadId: id, systemSizeKw: systemKw });
      setQuote(data);
      toast.success('Quote created and PDF generated!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create quote');
    } finally { setCreating(false); }
  };

  if (!lead) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const kwOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/leads/${id}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quote Builder</h1>
          <p className="text-sm text-gray-500">{lead.name} · {lead.leadId}</p>
        </div>
      </div>

      {quote ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Quote Created!</h2>
            <p className="text-gray-500 text-sm mb-2">Quote #{quote.quoteNumber}</p>
            <p className="text-3xl font-extrabold text-brand-green mb-1">₹{quote.netCost?.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-500 mb-6">Net cost after ₹{quote.subsidyAmount?.toLocaleString('en-IN')} subsidy</p>
            <div className="flex gap-3">
              <a href={`http://localhost:5000/api/quotes/${quote.id}/pdf`} target="_blank" rel="noreferrer"
                className="btn-primary flex-1 justify-center">
                <Download className="w-4 h-4" /> Download PDF
              </a>
              <Link to="/dashboard" className="btn-secondary flex-1 justify-center">Back to Leads</Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* System Size Selector */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Select System Size</h3>

            {lead.recommendedKw && (
              <div className="mb-4 p-3 bg-solar-50 border border-solar-200 rounded-xl">
                <p className="text-sm text-brand-green font-medium">AI Recommendation: {lead.recommendedKw} kW</p>
                <p className="text-xs text-gray-500 mt-0.5">Based on {lead.avgUnits || lead.aiUnits} units/month consumption</p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-6">
              {kwOptions.map(kw => (
                <button key={kw} onClick={() => setSystemKw(kw)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    systemKw === kw
                      ? 'border-brand-green bg-solar-50 text-brand-green'
                      : 'border-gray-200 text-gray-600 hover:border-solar-300'
                  }`}>
                  {kw} kW
                </button>
              ))}
            </div>

            <div>
              <label className="label">Custom size (kW)</label>
              <input type="number" className="input" value={systemKw} min={1} max={100} step={0.5}
                onChange={e => setSystemKw(parseFloat(e.target.value) || 1)} />
            </div>

            {/* System specs */}
            {preview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Panels</span>
                  <span className="font-medium">{preview.panelCount} × {preview.panelWatt}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Inverter</span>
                  <span className="font-medium">{preview.inverterKw} kW</span>
                </div>
              </div>
            )}
          </div>

          {/* Quote Preview */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Quote Preview</h3>

            {loadingPreview ? (
              <div className="flex items-center justify-center h-48"><Spinner /></div>
            ) : preview ? (
              <motion.div key={systemKw} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Hero numbers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-solar-50 rounded-xl p-4 text-center">
                    <Sun className="w-5 h-5 text-brand-green mx-auto mb-1" />
                    <p className="text-2xl font-bold text-brand-green">{systemKw} kW</p>
                    <p className="text-xs text-gray-500">System Size</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <TrendingDown className="w-5 h-5 text-brand-orange mx-auto mb-1" />
                    <p className="text-2xl font-bold text-brand-orange">₹{(preview.netCost / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">Net Cost</p>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">System Cost</span>
                    <span className="font-medium">₹{preview.baseCost?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 text-green-700">
                    <span>Govt. Subsidy</span>
                    <span className="font-semibold">-₹{preview.subsidyAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-base">
                    <span>Net Cost</span>
                    <span className="text-brand-orange">₹{preview.netCost?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <Zap className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="font-semibold text-blue-700">{preview.yearlyGeneration?.toLocaleString('en-IN')}</p>
                    <p className="text-gray-500">units/year</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <TrendingDown className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <p className="font-semibold text-green-700">₹{(preview.yearlyBillSaving / 1000).toFixed(1)}K</p>
                    <p className="text-gray-500">savings/yr</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="font-semibold text-purple-700">{preview.paybackYears} yrs</p>
                    <p className="text-gray-500">payback</p>
                  </div>
                </div>

                <button onClick={createQuote} disabled={creating} className="btn-primary w-full justify-center">
                  {creating ? <><Spinner size="sm" /> Generating PDF...</> : 'Create Quote & Generate PDF'}
                </button>
              </motion.div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
