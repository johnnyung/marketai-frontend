// Core types for MarketAI

export type PageId = 'digest' | 'research' | 'calendar' | 'learning' | 'journal' | 'game' | 'futures' | 'intelligence' | 'insights' | 'settings';

export type Theme = 'light' | 'dark';
export type Density = 'comfort' | 'compact';

export interface AppSettings {
  theme: Theme;
  density: Density;
  claudeApiKey: string;
  monthlyBudget: number;
  currentSpend: number;
  lastResetDate: string;
}

// Market Data Types
export interface RequiredEvent {
  id: string;
  time: string;
  title: string;
  meta: string;
  category: 'macro' | 'earnings' | 'policy' | 'regulatory' | 'legal';
  hasAlert: boolean;
}

export interface SurpriseStory {
  id: string;
  headline: string;
  confidence: number;
  why: string;
  source: string;
  timestamp: string;
  approved?: boolean;
}

export interface WatchlistEntity {
  id: string;
  entity: string;
  ticker?: string;
  focus: string;
  itemCount: number;
}

// Company Dossier Types
export interface CompanySnapshot {
  entity: string;
  ticker?: string;
  focusTags: string[];
  nextRequired: string;
  upcomingMilestone: string;
}

export interface TimelineItem {
  id: string;
  when: string;
  what: string;
  why: string;
  sources: string[];
}

export interface UpcomingDate {
  id: string;
  date: string;
  title: string;
  note: string;
}

export interface CompanyDossier {
  snapshot: CompanySnapshot;
  timeline: TimelineItem[];
  upcomingDates: UpcomingDate[];
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIContextItem {
  type: 'event' | 'company' | 'concept';
  data: any;
  timestamp: string;
}

// Learning Lab Types
export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export interface ScenarioAnalysis {
  id: string;
  scenario: string;
  setup: string;
  outcomes: {
    label: string;
    probability: number;
    impact: string;
  }[];
}

// Trade Journal Types
export interface TradeEntry {
  id: string;
  date: string;
  ticker: string;
  action: 'buy' | 'sell' | 'watch';
  price?: number;
  reasoning: string;
  aiReview?: string;
  outcome?: 'pending' | 'win' | 'loss' | 'neutral';
  actualPrice?: number;
  notes?: string;
}

// Source Manager Types
export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'website' | 'social';
  enabled: boolean;
  lastChecked?: string;
  reliability?: number;
}

// Context & History Types
export interface UserContext {
  focusedEntities: string[];
  clickedEvents: string[];
  learningProgress: {
    quizzesTaken: number;
    correctAnswers: number;
    topicsLearned: string[];
  };
  recentSearches: string[];
}

// Badge Component Props
export interface BadgeProps {
  tone?: 'default' | 'info' | 'warn' | 'success' | 'danger';
  children: React.ReactNode;
  className?: string;
}

// AI Suggestion Types
export interface AIProactiveSuggestion {
  id: string;
  type: 'question' | 'action' | 'learn' | 'alert';
  content: string;
  priority: 'low' | 'medium' | 'high';
  relatedTo?: string;
}
