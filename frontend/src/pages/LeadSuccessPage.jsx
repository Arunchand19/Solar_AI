import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sun, TrendingUp, AlertTriangle, Phone, ArrowRight } from 'lucide-react';

export default function LeadSuccessPage() {
  const { state } = useLocation();
  const lead = state?.lead;
  const aiData = state?.aiData;
  const aiError = state?.aiError;

  if (!lead) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">No lead data found.</p>
        <Link to="/apply" className="btn-primary mt-4 inline-flex">Apply Again</Link>
      </div>
    </div>
  );

  const scoreConfig = {
    High: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: TrendingUp, iconColor: 'text-green-600', msg: 'Great news! You\'re an excellent solar candidate. Our team will call you within 24 hours to schedule a free site survey.' },
    Medium: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: TrendingUp, iconColor: 'text-yellow-600', msg: 'You\'re a good solar candidate. Our advisor will call you for a quick 10-minute consultation.' },
    Low: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', msg: lead.ownerOrTenant === 'tenant' ? 'As a tenant, solar installation may not be possible. We\'ll keep your details and reach out if options become available.' : 'Your current consumption is low. Solar may not give the best returns right now, but we\'ll keep you updated as tariffs change.' },
  };

  const sc = scoreConfig[lead.score] || scoreConfig.Medium;
  const ScoreIcon = sc.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h1>
          <p className="text-gray-500">Lead ID: <span className="font-mono font-semibold text-brand-green">{lead.leadId}</span></p>
        </motion.div>

        {/* Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`rounded-2xl border-2 p-6 mb-6 ${sc.bg}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <ScoreIcon className={`w-6 h-6 ${sc.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-600">Lead Score</span>
                <span className={`text-lg font-bold ${sc.color}`}>{lead.score}</span>
              </div>
              <p className={`text-sm ${sc.color}`}>{sc.msg}</p>
            </div>
          </div>
        </motion.div>

        {/* System Recommendation */}
        {lead.recommendedKw && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-solar-100 rounded-xl flex items-center justify-center">
                <Sun className="w-5 h-5 text-brand-green" />
              </div>
              <h3 className="font-semibold text-gray-900">Recommended System</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-solar-50 rounded-xl">
                <p className="text-2xl font-bold text-brand-green">{lead.recommendedKw} kW</p>
                <p className="text-xs text-gray-500 mt-1">System Size</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <p className="text-2xl font-bold text-brand-orange">{Math.round(lead.recommendedKw * 1400).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 mt-1">Units/year</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-700">₹{(lead.recommendedKw * 1400 * 7.5 / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500 mt-1">Savings/year</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Bill Reading Result */}
        {aiData && !aiError && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Bill Analysis
              {aiData.isMock && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Demo</span>}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Consumer No.', aiData.consumerNumber],
                ['Tariff', aiData.tariff],
                ['Sanctioned Load', aiData.sanctionedLoad ? `${aiData.sanctionedLoad} kW` : '-'],
                ['Avg Units/month', aiData.avgUnits ? `${aiData.avgUnits} kWh` : '-'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-gray-400 text-xs">{k}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{v || '-'}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div className="bg-brand-green h-1.5 rounded-full transition-all" style={{ width: `${(aiData.confidence || 0.8) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-500">{Math.round((aiData.confidence || 0.8) * 100)}% confidence</span>
            </div>
          </motion.div>
        )}

        {aiError === 'poor_image' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Bill photo unclear</p>
              <p className="text-xs text-yellow-700 mt-1">Our team will manually review your bill during the consultation call.</p>
            </div>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Our solar advisor reviews your application', time: 'Within 2 hours' },
              { step: '2', text: lead.score === 'High' ? 'Free site survey scheduled' : 'Quick phone consultation', time: 'Within 24 hours' },
              { step: '3', text: 'Detailed quote with subsidy & payback sent', time: 'Same day' },
            ].map(({ step, text, time }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-solar-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-green flex-shrink-0 mt-0.5">{step}</div>
                <div>
                  <p className="text-sm text-gray-700">{text}</p>
                  <p className="text-xs text-gray-400">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="btn-secondary flex-1 justify-center">Back to Home</Link>
          <a href="tel:+91XXXXXXXXXX" className="btn-primary flex-1 justify-center">
            <Phone className="w-4 h-4" /> Call Us Now
          </a>
        </motion.div>
      </div>
    </div>
  );
}
