# MarketAI - Your AI Investment Co-Pilot 🚀

A modern, AI-powered investment research platform that helps you track markets, learn investing, and make informed decisions.

## ✨ Features

- **AI Chat Panel**: Ask questions about any market event, get instant explanations
- **Smart Digest**: Morning briefing with AI-annotated news
- **Learning Lab**: AI-powered quizzes and scenario analysis
- **Trade Journal**: Log predictions, get AI feedback on your thesis
- **Research Tools**: Company dossiers, watchlists, timeline tracking
- **Calendar View**: Track earnings, economic data, regulatory events
- **Dark/Light Theme** + **Density Toggle** (Comfort/Compact)
- **Cost Controls**: Built-in $10/month AI spending cap

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite (blazing fast dev server)
- Tailwind CSS 3 (utility-first styling)
- Framer Motion (smooth animations)
- Lucide React (beautiful icons)
- Claude API (AI integration)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# 1. Extract the zip file to your desktop

# 2. Navigate to the project folder
cd marketai

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will open at `http://localhost:3000`

## 🔑 API Setup (Required for AI Features)

1. Get a Claude API key from [Anthropic Console](https://console.anthropic.com/)
2. Open the app and go to **Settings** page
3. Enter your API key and set your monthly budget ($10 recommended)
4. Start chatting with AI!

## 📁 Project Structure

```
marketai/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Main app component
│   ├── components/           # Reusable UI components
│   │   ├── AIChatPanel.tsx   # AI chat interface
│   │   ├── TopBar.tsx        # Navigation bar
│   │   ├── Sidebar.tsx       # Main navigation
│   │   └── ...
│   ├── pages/                # Main app pages
│   │   ├── FrontPage.tsx     # Morning digest
│   │   ├── ResearchWatchlist.tsx
│   │   ├── CalendarView.tsx
│   │   ├── LearningLab.tsx   # Quiz & scenarios
│   │   ├── TradeJournal.tsx  # Prediction tracking
│   │   └── SettingsView.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useThemeDensity.ts
│   │   └── useAIChat.ts
│   ├── data/
│   │   └── mock.ts           # Mock data for development
│   ├── types/
│   │   └── index.ts          # TypeScript definitions
│   └── styles/
│       └── globals.css       # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 💡 Usage Guide

### Morning Routine (5:00 AM - 6:30 AM)
1. **Check Digest**: AI-summarized overnight news
2. **Review Required Events**: CPI, Fed remarks, earnings
3. **Scan Surprise Radar**: AI-detected market movers
4. **Check Watchlist**: Updates on your tracked companies

### Learning Mode
1. Go to **Learning Lab**
2. Take daily quizzes on market events
3. Review "What if..." scenarios
4. Track your investing knowledge growth

### Trade Journal
1. Log your trade ideas with reasoning
2. AI reviews your thesis
3. Track outcomes over time
4. Learn from patterns

### AI Chat Tips
- Ask: "Why did NVDA drop after earnings?"
- Ask: "Explain CPI in simple terms"
- Ask: "What should I watch for in the Fed statement?"
- Ask: "Compare ACHR vs JOBY for UAM exposure"

## 🔒 Privacy & Data

- **Local First**: All data stored in browser (localStorage + IndexedDB)
- **Cloud Ready**: Architecture supports encrypted cloud backup (Phase 2)
- **No Tracking**: We don't collect any usage data
- **API Keys**: Stored locally, never sent to our servers

## 📊 Cost Management

The app tracks AI API usage and enforces your budget:
- Default: $10/month cap
- Real-time usage display in Settings
- Automatic pause when limit reached
- Resets monthly

Typical usage: ~300-500 AI questions/month = $5-8

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚧 Phase 2 Roadmap

- [ ] Real-time news scraping (Trump Truth Social, Reddit, etc.)
- [ ] RSS feed ingestion
- [ ] Brokerage API integration (live portfolio)
- [ ] Google Calendar sync for earnings dates
- [ ] Browser extension for quick captures
- [ ] Mobile app (React Native)
- [ ] Advanced ML pattern detection
- [ ] Social sentiment analysis

## 📝 Contributing

This is a personal project, but feel free to fork and customize!

## 🐛 Known Issues

- Mock data only (Phase 1)
- AI chat requires API key
- No real-time data feeds yet
- Trade journal doesn't sync to cloud yet

## 📄 License

MIT License - Use freely!

## 🆘 Support

Having issues? Check:
1. Node.js version (need 18+)
2. API key is entered in Settings
3. Browser console for errors
4. Dependencies installed: `npm install`

## 🎯 Next Steps After Setup

1. ✅ Install and run the app
2. ✅ Add your Claude API key in Settings
3. ✅ Add companies to watchlist (ACHR, NVDA, etc.)
4. ✅ Try the AI chat: "Explain what moves markets"
5. ✅ Log a practice trade in Trade Journal
6. ✅ Take a quiz in Learning Lab

Happy investing! 📈
