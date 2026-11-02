import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui';

export default function AdminPage() {
  const [tab, setTab] = useState('subsidy');
  const [subsidyRules, setSubsidyRules] = useState([]);
  const [prices, setPrices] = useState([]);
  const [genConfig, setGenConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newRule, setNewRule] = useState({ name: '', category: 'residential', slabs: [], maxSubsidy: 78000 });
  const [newPrice, setNewPrice] = useState({ itemName: '', category: 'panel', pricePerUnit: 0, unit: 'per kW' });

  useEffect(() => { fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'subsidy') {
        const { data } = await api.get('/admin/subsidy-rules');
        setSubsidyRules(data);
      } else if (tab === 'prices') {
        const { data } = await api.get('/admin/prices');
        setPrices(data);
      } else if (tab === 'generation') {
        const { data } = await api.get('/admin/generation-config');
        setGenConfig(data);
      }
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addSubsidyRule = async () => {
    if (!newRule.name) return toast.error('Name required');
    try {
      await api.post('/admin/subsidy-rules', {
        ...newRule,
        effectiveFrom: new Date().toISOString(),
        slabs: [{ upToKw: 2, ratePerKw: 30000 }, { upToKw: 1, ratePerKw: 18000 }]
      });
      toast.success('Rule added');
      setNewRule({ name: '', category: 'residential', slabs: [], maxSubsidy: 78000 });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to add rule');
    }
  };

  const addPrice = async () => {
    if (!newPrice.itemName || !newPrice.pricePerUnit) return toast.error('All fields required');
    try {
      await api.post('/admin/prices', {
        ...newPrice,
        effectiveFrom: new Date().toISOString(),
        pricePerUnit: parseFloat(newPrice.pricePerUnit)
      });
      toast.success('Price added');
      setNewPrice({ itemName: '', category: 'panel', pricePerUnit: 0, unit: 'per kW' });
      fetchData();
    } catch (e) {
      toast.error('Failed to add price');
    }
  };

  const updateGenConfig = async (unitsPerKwPerYear) => {
    try {
      await api.post('/admin/generation-config', { unitsPerKwPerYear: parseFloat(unitsPerKwPerYear) });
      toast.success('Generation config updated');
      fetchData();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-brand-green" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500">Manage prices, subsidies and system configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'subsidy', label: 'Subsidy Rules' },
          { id: 'prices', label: 'Price Config' },
          { id: 'generation', label: 'Generation Rate' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-3 font-medium border-b-2 transition-all ${
              tab === t.id
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Subsidy Rules */}
          {tab === 'subsidy' && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Rule</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input className="input" placeholder="Rule name" value={newRule.name}
                    onChange={e => setNewRule(r => ({ ...r, name: e.target.value }))} />
                  <input type="number" className="input" placeholder="Max subsidy" value={newRule.maxSubsidy}
                    onChange={e => setNewRule(r => ({ ...r, maxSubsidy: parseFloat(e.target.value) }))} />
                </div>
                <button onClick={addSubsidyRule} className="btn-primary text-sm">
                  <Plus className="w-4 h-4" /> Add Rule
                </button>
              </div>

              <div className="space-y-2">
                {subsidyRules.map(rule => (
                  <motion.div key={rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{rule.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Max: ₹{rule.maxSubsidy?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          From {new Date(rule.effectiveFrom).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Prices */}
          {tab === 'prices' && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Price</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input className="input" placeholder="Item name" value={newPrice.itemName}
                    onChange={e => setNewPrice(p => ({ ...p, itemName: e.target.value }))} />
                  <select className="input" value={newPrice.category}
                    onChange={e => setNewPrice(p => ({ ...p, category: e.target.value }))}>
                    <option value="panel">Panel</option>
                    <option value="inverter">Inverter</option>
                    <option value="bos">BOS</option>
                    <option value="installation">Installation</option>
                  </select>
                  <input type="number" className="input" placeholder="Price per unit" value={newPrice.pricePerUnit}
                    onChange={e => setNewPrice(p => ({ ...p, pricePerUnit: e.target.value }))} />
                  <input className="input" placeholder="Unit" value={newPrice.unit}
                    onChange={e => setNewPrice(p => ({ ...p, unit: e.target.value }))} />
                </div>
                <button onClick={addPrice} className="btn-primary text-sm">
                  <Plus className="w-4 h-4" /> Add Price
                </button>
              </div>

              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Item</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Category</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Price</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">{p.itemName}</td>
                        <td className="px-4 py-3 capitalize text-gray-500">{p.category}</td>
                        <td className="px-4 py-3 font-semibold">₹{p.pricePerUnit?.toLocaleString('en-IN')} {p.unit}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Generation Config */}
          {tab === 'generation' && (
            <div className="card max-w-md">
              <h3 className="font-semibold text-gray-900 mb-4">Generation Rate</h3>
              <p className="text-sm text-gray-600 mb-3">Units generated per kW per year</p>
              <div className="flex gap-2">
                <input type="number" className="input flex-1" value={genConfig?.unitsPerKwPerYear || 1400}
                  onChange={e => setGenConfig(c => ({ ...c, unitsPerKwPerYear: parseFloat(e.target.value) }))} />
                <button onClick={() => updateGenConfig(genConfig?.unitsPerKwPerYear)}
                  className="btn-primary">
                  <Save className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Current: {genConfig?.unitsPerKwPerYear || 1400} units/kW/year</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
