import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LeadFormPage from './pages/LeadFormPage';
import LeadSuccessPage from './pages/LeadSuccessPage';
import SalesDashboard from './pages/SalesDashboard';
import LeadDetailPage from './pages/LeadDetailPage';
import QuoteBuilderPage from './pages/QuoteBuilderPage';
import ProjectTrackerPage from './pages/ProjectTrackerPage';
import CustomerStatusPage from './pages/CustomerStatusPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/apply" element={<LeadFormPage />} />
          <Route path="/apply/success" element={<LeadSuccessPage />} />
          <Route path="/status/:token" element={<CustomerStatusPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['sales', 'admin']}>
              <Layout><SalesDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/leads/:id" element={
            <ProtectedRoute roles={['sales', 'admin']}>
              <Layout><LeadDetailPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/leads/:id/quote" element={
            <ProtectedRoute roles={['sales', 'admin']}>
              <Layout><QuoteBuilderPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute roles={['sales', 'admin']}>
              <Layout><ProjectTrackerPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminPage /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
