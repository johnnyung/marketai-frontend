import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import Layout from './components/Layout';
import V2Dashboard from './pages/V2Dashboard';
import SystemDiagnostics from './pages/SystemDiagnostics';
import AITipTracker from './pages/AITipTracker';
import IntelligenceDigest from './pages/IntelligenceDigest';
import DeepDive from './pages/DeepDive';
import EventIntelligenceAnalyzer from './pages/EventIntelligenceAnalyzer';
import CorrelationLab from './pages/CorrelationLab';
import SystemStatusWidget from './components/SystemStatusWidget';

// Wrapper for LoginPage with navigation
function LoginPageWrapper() {
  const navigate = useNavigate();
  return <LoginPage onSuccess={() => navigate('/dashboard')} />;
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPageWrapper />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<V2Dashboard />} />
            <Route path="diagnostics" element={<SystemDiagnostics />} />
            <Route path="ai-tip-tracker" element={<AITipTracker />} />
            <Route path="correlation-lab" element={<CorrelationLab />} />
            <Route path="digest" element={<IntelligenceDigest />} />
            <Route path="technical" element={<EventIntelligenceAnalyzer />} />
            <Route path="deep-dive" element={<DeepDive />} />
            <Route path="data-monitor" element={<Navigate to="/dashboard" replace />} />
            <Route path="v2" element={<Navigate to="/dashboard" replace />} />
            <Route path="command-center" element={<Navigate to="/dashboard" replace />} />
            <Route path="intelligence-digest" element={<Navigate to="/digest" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
        
        <SystemStatusWidget />
      </Router>
    </AuthProvider>
  );
}

export default App;
