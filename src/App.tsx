import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { AIChatPanel } from './components/AIChatPanel';
import { FrontPage } from './pages/FrontPage';
import { ResearchWatchlist } from './pages/ResearchWatchlist';
import { CalendarView } from './pages/CalendarView';
import { LearningLab } from './pages/LearningLab';
import { TradeJournal } from './pages/TradeJournal';
import { GameMode } from './pages/GameMode';
import { FuturesTrading } from './pages/FuturesTrading';
import { DailyIntelligence } from './pages/DailyIntelligence';
import { DataIntelligence } from './pages/DataIntelligence'; // ✅ PHASE 5: Added
import { InsightsView } from './pages/InsightsView';
import { SettingsView } from './pages/SettingsView';
import { LoginPage } from './pages/LoginPage';
import { useThemeDensity } from './hooks/useThemeDensity';
import { useAIChat } from './hooks/useAIChat';
import { useAuth } from './contexts/AuthContext';
import type { PageId } from './types';

const SETTINGS_KEY = 'marketai_settings';

function App() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('digest');
  const [apiKey, setApiKey] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(10);

  const { theme, density, toggleTheme, toggleDensity } = useThemeDensity();

  // Load API settings
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setApiKey(settings.claudeApiKey || '');
        setMonthlyBudget(settings.monthlyBudget || 10);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }

    // Listen for settings updates
    const handleStorage = () => {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setApiKey(settings.claudeApiKey || '');
          setMonthlyBudget(settings.monthlyBudget || 10);
        } catch (e) {
          console.error('Failed to load settings:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    currentSpend,
    getBudgetStatus,
    suggestions,
  } = useAIChat({ apiKey, monthlyBudget });

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => window.location.reload()} />;
  }

  const renderPage = () => {
    const props = { density };
    switch (currentPage) {
      case 'digest':
        return <FrontPage {...props} />;
      case 'research':
        return <ResearchWatchlist {...props} />;
      case 'data-intelligence': // ✅ PHASE 5: Added Data Intelligence page
        return <DataIntelligence />;
      case 'calendar':
        return <CalendarView {...props} />;
      case 'learning':
        return <LearningLab {...props} />;
      case 'journal':
        return <TradeJournal {...props} />;
      case 'game':
        return <GameMode {...props} />;
      case 'futures':
        return <FuturesTrading {...props} />;
      case 'intelligence':
        return <DailyIntelligence {...props} />;
      case 'insights':
        return <InsightsView {...props} />;
      case 'settings':
        return <SettingsView {...props} />;
      default:
        return <FrontPage {...props} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        theme={theme}
        density={density}
        onToggleTheme={toggleTheme}
        onToggleDensity={toggleDensity}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar density={density} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-7xl mx-auto px-8 py-10">
              {renderPage()}
            </div>
          </main>

          {/* AI Chat Panel */}
          <AIChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            suggestions={suggestions}
            budgetStatus={getBudgetStatus()}
            density={density}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
