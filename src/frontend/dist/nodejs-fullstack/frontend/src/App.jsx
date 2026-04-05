import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';

// Lazy load all pages for best performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Ledgers = lazy(() => import('./pages/Ledgers'));
const Vouchers = lazy(() => import('./pages/Vouchers'));
const Reports = lazy(() => import('./pages/Reports'));
const Stock = lazy(() => import('./pages/Stock'));
const Payroll = lazy(() => import('./pages/Payroll'));
const GST = lazy(() => import('./pages/GST'));
const Banking = lazy(() => import('./pages/Banking'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } });

function PrivateRoute({ children }) {
  const token = localStorage.getItem('hk_token');
  return token ? children : <Navigate to="/login" />;
}

const Loader = () => <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Poppins,Inter,sans-serif',fontSize:14,color:'#6366f1'}}>Loading HisabKitab Pro...</div>;

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/ledgers" element={<PrivateRoute><Ledgers /></PrivateRoute>} />
            <Route path="/vouchers" element={<PrivateRoute><Vouchers /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/stock" element={<PrivateRoute><Stock /></PrivateRoute>} />
            <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
            <Route path="/gst" element={<PrivateRoute><GST /></PrivateRoute>} />
            <Route path="/banking" element={<PrivateRoute><Banking /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
