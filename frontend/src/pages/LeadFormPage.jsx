import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Sun, Upload, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, X, Image } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STEPS = ['Your Details', 'Roof & Bill', 'Upload Bill', 'Review'];

const initialForm = {
  name: '', email: '', phone: '', pincode: '',
  ownerOrTenant: '', roofType: '', roofArea: '', monthlyBill: '', avgUnits: ''
};

export default function LeadFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
  };

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setBillFile(accepted[0]);
      setBillPreview(URL.createObjectURL(accepted[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024, maxFiles: 1
  });

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number';
      if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter valid 6-digit pincode';
    }
    if (step === 1) {
      if (!form.ownerOrTenant) e.ownerOrTenant = 'Please select';
      if (!form.roofType) e.roofType = 'Please select';
      if (!form.roofArea || parseFloat(form.roofArea) < 50) e.roofArea = 'Minimum 50 sq ft';
      if (!form.monthlyBill || parseFloat(form.monthlyBill) < 0) e.monthlyBill = 'Enter your monthly bill';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (billFile) fd.append('billPhoto', billFile);

      const { data } = await api.post('/leads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/apply/success', { state: { lead: data.lead, aiData: data.aiData, aiError: data.aiError } });
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Submission failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-solar-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-brand-green">SolarSmart</span>
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">Free Solar Assessment</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < step ? 'bg-brand-green text-white' : i === step ? 'bg-brand-green text-white ring-4 ring-solar-100' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-20 transition-all duration-500 ${i < step ? 'bg-brand-green' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-700">Step {step + 1}: {STEPS[step]}</p>
        </div>

        <div className="card overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.25 }}>

              {/* Step 0: Personal Details */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
                    <p className="text-sm text-gray-500">We'll use this to send your quote</p>
                  </div>
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="Prashant Wankhede" value={form.name} onChange={set('name')} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Mobile Number *</label>
                    <input className="input" placeholder="9876543210" value={form.phone} onChange={set('phone')} maxLength={10} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label">Email (optional)</label>
                    <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input className="input" placeholder="440001" value={form.pincode} onChange={set('pincode')} maxLength={6} />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              )}

              {/* Step 1: Roof & Bill */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Roof & electricity details</h2>
                    <p className="text-sm text-gray-500">Helps us size the right system for you</p>
                  </div>

                  <div>
                    <label className="label">Are you the owner or tenant? *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['owner', 'tenant'].map(v => (
                        <button key={v} type="button" onClick={() => { setForm(f => ({ ...f, ownerOrTenant: v })); setErrors(e => ({ ...e, ownerOrTenant: '' })); }}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                            form.ownerOrTenant === v ? 'border-brand-green bg-solar-50 text-brand-green' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          {v === 'owner' ? '🏠 Owner' : '🔑 Tenant'}
                        </button>
                      ))}
                    </div>
                    {errors.ownerOrTenant && <p className="text-red-500 text-xs mt-1">{errors.ownerOrTenant}</p>}
                    {form.ownerOrTenant === 'tenant' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">Tenants typically cannot install solar. We'll still record your interest and reach out if your situation changes.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Roof Type *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ v: 'flat', l: '🏢 Flat' }, { v: 'sloped', l: '🏠 Sloped' }, { v: 'mixed', l: '🏗️ Mixed' }].map(({ v, l }) => (
                        <button key={v} type="button" onClick={() => { setForm(f => ({ ...f, roofType: v })); setErrors(e => ({ ...e, roofType: '' })); }}
                          className={`py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                            form.roofType === v ? 'border-brand-green bg-solar-50 text-brand-green' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    {errors.roofType && <p className="text-red-500 text-xs mt-1">{errors.roofType}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Roof Area (sq ft) *</label>
                      <input type="number" className="input" placeholder="300" value={form.roofArea} onChange={set('roofArea')} min={50} />
                      {errors.roofArea && <p className="text-red-500 text-xs mt-1">{errors.roofArea}</p>}
                    </div>
                    <div>
                      <label className="label">Monthly Bill (₹) *</label>
                      <input type="number" className="input" placeholder="3200" value={form.monthlyBill} onChange={set('monthlyBill')} min={0} />
                      {errors.monthlyBill && <p className="text-red-500 text-xs mt-1">{errors.monthlyBill}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Avg Monthly Units (optional)</label>
                    <input type="number" className="input" placeholder="340 kWh" value={form.avgUnits} onChange={set('avgUnits')} />
                    <p className="text-xs text-gray-400 mt-1">Found on your electricity bill</p>
                  </div>
                </div>
              )}

              {/* Step 2: Bill Upload */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Upload your electricity bill</h2>
                    <p className="text-sm text-gray-500">Our AI will read it automatically. JPG or PNG, max 5MB.</p>
                  </div>

                  {!billPreview ? (
                    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive ? 'border-brand-green bg-solar-50' : 'border-gray-200 hover:border-solar-400 hover:bg-solar-50'
                    }`}>
                      <input {...getInputProps()} />
                      <div className="w-14 h-14 bg-solar-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-7 h-7 text-brand-green" />
                      </div>
                      <p className="font-medium text-gray-700 mb-1">
                        {isDragActive ? 'Drop your bill here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP up to 5MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                      <img src={billPreview} alt="Bill preview" className="w-full max-h-64 object-contain bg-gray-50" />
                      <button onClick={() => { setBillFile(null); setBillPreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50">
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="p-3 bg-green-50 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">{billFile.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                    <Image className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">Tip: Take a clear, well-lit photo of the full bill. Ensure the consumer number and units are visible.</p>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Bill upload is optional but helps us give a more accurate quote. Your data is protected under DPDP Act 2023.
                  </p>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Review & submit</h2>
                    <p className="text-sm text-gray-500">Check your details before we analyse your application</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {[
                      ['Name', form.name],
                      ['Phone', form.phone],
                      ['Pincode', form.pincode],
                      ['Owner/Tenant', form.ownerOrTenant],
                      ['Roof Type', form.roofType],
                      ['Roof Area', form.roofArea ? `${form.roofArea} sq ft` : '-'],
                      ['Monthly Bill', form.monthlyBill ? `₹${form.monthlyBill}` : '-'],
                      ['Bill Photo', billFile ? billFile.name : 'Not uploaded'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-900 capitalize">{v || '-'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-solar-50 border border-solar-200 rounded-xl">
                    <p className="text-xs text-solar-800">
                      By submitting, you agree to be contacted by our solar advisors. Your data is handled per DPDP Act 2023.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={back} className="btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analysing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Submit Application <CheckCircle className="w-4 h-4" /></span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
