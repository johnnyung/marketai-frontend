import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';  // NEW - Using proper Dashboard instead of FrontPage
import Digest from './pages/Digest';
import DeepDivePage from './pages/DeepDivePage';
import { FuturesTrading } from './pages/FuturesTrading';
import { ResearchWatchlist } from './pages/ResearchWatchlist';
import { TradeJournal } from './pages/TradeJournal';
import { CalendarView } from './pages/CalendarView';
import { LearningLab } from './pages/LearningLab';
import { InsightsView } from './pages/InsightsView';
import { SettingsView } from './pages/SettingsView';
import DailyIntelligence from './pages/DailyIntelligence';
import AITipTracker from './pages/AITipTracker';
import IntelligenceThreadsPage from './pages/IntelligenceThreadsPage';

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
            
            {/* INTELLIGENCE HUB */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="daily-intelligence" element={<DailyIntelligence />} />
            <Route path="deep-dive" element={<DeepDivePage />} />
            <Route path="digest" element={<Digest />} />
            <Route path="intelligence-threads" element={<IntelligenceThreadsPage />} />
            
            {/* PERFORMANCE TRACKING */}
            <Route path="ai-tip-tracker" element={<AITipTracker />} />
            
            {/* TRADING & LEARNING */}
            <Route path="futures" element={<FuturesTrading density="comfort" />} />
            <Route path="journal" element={<TradeJournal density="comfort" />} />
            <Route path="learning" element={<LearningLab density="comfort" />} />
            
            {/* RESEARCH TOOLS */}
            <Route path="watchlist" element={<ResearchWatchlist density="comfort" />} />
            <Route path="calendar" element={<CalendarView density="comfort" />} />
            
            {/* LEGACY/UTILITY */}
            <Route path="insights" element={<InsightsView density="comfort" />} />
            <Route path="settings" element={<SettingsView density="comfort" />} />
            
            {/* LEGACY REDIRECTS */}
            <Route path="threads" element={<Navigate to="/intelligence-threads" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
