import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Zap, Shield, TrendingDown, ArrowRight, CheckCircle, Star, Leaf, Lightbulb, BarChart3 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl gradient-text">SolarSmart</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors px-4 py-2">Sign in</Link>
            <Link to="/apply" className="btn-primary text-sm py-2 px-4">Get Free Quote</Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-md">
              <Star className="w-4 h-4 fill-green-600 text-green-600" />
              Trusted by 500+ Solar Installers
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              <span className="gradient-text">Go Solar.</span><br />
              <span className="text-gray-900">Save More.</span><br />
              <span className="gradient-text">Start Today.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Get an instant AI-powered quote in minutes. Know your system size, subsidy amount and payback period before a single site visit. Join the solar revolution.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/apply" className="btn-primary text-base py-4 px-8 shadow-xl hover:shadow-2xl">
                Check My Eligibility <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-4 px-8">
                Sales Login
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
              {['✓ Free site survey', '✓ Same-day quotes', '✓ Subsidy handled'].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {t}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
            {[
              { value: '120+', label: 'Installations/month', icon: Zap },
              { value: '₹78K', label: 'Max subsidy', icon: TrendingDown },
              { value: '1.8 yrs', label: 'Avg payback', icon: BarChart3 },
              { value: '25 yrs', label: 'Panel warranty', icon: Shield },
            ].map(({ value, label, icon: Icon }, i) => (
              <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-all text-center group">
                <Icon className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-black gradient-text">{value}</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">How it works</h2>
            <p className="text-green-100 text-lg">From inquiry to installation in 4 simple steps</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Sun, title: 'Fill the form', desc: 'Share your electricity bill and roof details. Takes 2 minutes.' },
              { step: '02', icon: Lightbulb, title: 'AI analysis', desc: 'Our AI reads your bill and recommends the right system size.' },
              { step: '03', icon: TrendingDown, title: 'Get your quote', desc: 'Instant PDF with cost, subsidy and payback calculation.' },
              { step: '04', icon: Shield, title: 'Track progress', desc: 'Follow your project from advance to subsidy credited.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative group">
                <span className="absolute top-4 right-4 text-5xl font-black text-green-100 group-hover:text-green-200 transition-colors">{step}</span>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black gradient-text mb-4">Why Choose SolarSmart?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Experience the fastest, smartest way to go solar</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Instant Quotes', desc: 'Get your personalized quote in minutes, not days' },
              { icon: TrendingDown, title: 'Maximum Savings', desc: 'Subsidy calculated automatically, no paperwork' },
              { icon: BarChart3, title: 'Track Everything', desc: 'Real-time project tracking from start to finish' },
              { icon: Leaf, title: 'Eco-Friendly', desc: 'Save the planet while saving money on electricity' },
              { icon: Shield, title: 'Guaranteed Quality', desc: '25-year warranty on all solar panels' },
              { icon: CheckCircle, title: 'Expert Support', desc: '24/7 customer support from solar experts' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card group hover:border-green-300 hover:shadow-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black gradient-text mb-4">What Our Customers Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Prashant W.', role: 'Homeowner', text: 'Got my quote in 5 minutes! The AI reading was spot on. Saved ₹78,000 with the subsidy.' },
              { name: 'Rahul S.', role: 'Sales Manager', text: 'Reduced our survey time by 50%. Customers love the instant quotes. Game changer!' },
              { name: 'Sunita P.', role: 'Homeowner', text: 'Transparent pricing, no hidden costs. The project tracker kept me updated every step.' },
            ].map(({ name, role, text }, i) => (
              <motion.div key={name} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card border-green-200 hover:shadow-xl">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-green-500 text-green-500" />)}
                </div>
                <p className="text-gray-700 mb-4 italic">"{text}"</p>
                <p className="font-bold text-gray-900">{name}</p>
                <p className="text-sm text-green-600 font-semibold">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to switch to solar?</h2>
            <p className="text-green-100 text-lg mb-8">Get your personalized quote in under 5 minutes. No commitment required.</p>
            <Link to="/apply" className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-8 py-4 rounded-2xl hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl active:scale-95">
              Get My Free Quote <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold">SolarSmart, Nagpur</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 SolarSmart. All rights reserved. | Built for solar installers</p>
        </div>
      </footer>
    </div>
  );
}
