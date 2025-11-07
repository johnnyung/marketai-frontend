import type {
  RequiredEvent,
  SurpriseStory,
  WatchlistEntity,
  CompanyDossier,
  Quiz,
  ScenarioAnalysis,
  TradeEntry,
  Source,
} from '../types';

// Overnight Brief
export const overnightBrief = [
  "Asian markets mixed after China PMI beats expectations (51.2 vs 50.8); tech stocks lead gains in Shanghai.",
  "Fed officials signal patience on rate cuts; markets now pricing 65% chance of June pause (down from 80%).",
  "NVDA supplier TSMC reports strong demand for 3nm chips; automotive and AI compute segments both up 20%+ QoQ.",
  "Oil prices steady at $78/barrel as OPEC+ maintains production cuts; geopolitical premium remains elevated.",
  "Treasury yields tick higher (10Y at 4.18%) ahead of today's Core CPI print; dollar strengthens vs euro.",
];

// Today's Required Events
export const requiredToday: RequiredEvent[] = [
  {
    id: 'req-1',
    time: '05:30',
    title: 'Core CPI (MoM/YoY)',
    meta: 'Cons 0.3% / 3.7% • Prior 0.4% / 3.9%',
    category: 'macro',
    hasAlert: false,
  },
  {
    id: 'req-2',
    time: '07:00',
    title: 'Fed Chair Powell Remarks',
    meta: 'Economic Outlook Conference • Prepared text + Q&A',
    category: 'policy',
    hasAlert: false,
  },
  {
    id: 'req-3',
    time: '13:30',
    title: 'Archer Aviation (ACHR) Q3 Earnings',
    meta: 'Cons EPS −$0.27 • Focus: FAA certification timeline',
    category: 'earnings',
    hasAlert: false,
  },
  {
    id: 'req-4',
    time: '15:00',
    title: 'NVIDIA (NVDA) AI Summit Keynote',
    meta: 'CEO Jensen Huang • New chip architecture reveal expected',
    category: 'earnings',
    hasAlert: false,
  },
  {
    id: 'req-5',
    time: 'All Day',
    title: 'DoD Contract Awards Window',
    meta: 'eVTOL & autonomous systems • Watch for ACHR, JOBY mentions',
    category: 'regulatory',
    hasAlert: false,
  },
];

// Surprise Radar Stories
export const surpriseStories: SurpriseStory[] = [
  {
    id: 'surprise-1',
    headline: 'Tesla CFO meets White House officials on AI infrastructure policy',
    confidence: 0.87,
    why: 'Potential regulatory tailwinds for megacap AI capex; could impact NVDA, MSFT demand outlook.',
    source: 'Reuters, Bloomberg crosscheck',
    timestamp: '2 hours ago',
  },
  {
    id: 'surprise-2',
    headline: 'Archer supplier LG Energy Solution announces battery module JV',
    confidence: 0.82,
    why: 'De-risks ACHR production ramp timeline; capacity signal for 2025+ deliveries.',
    source: 'Korean press, company filing',
    timestamp: '4 hours ago',
  },
  {
    id: 'surprise-3',
    headline: 'EU accelerates eVTOL certification framework alignment with FAA',
    confidence: 0.76,
    why: 'Expands addressable market for UAM players; reduces dual-certification burden.',
    source: 'EASA press release',
    timestamp: '6 hours ago',
  },
];

// Watchlist Badges
export const watchlistBadges = ['ACHR • 3 items', 'NVDA • 2 items', 'MSFT • 1 item'];

// Watchlist Table
export const watchlistTable: WatchlistEntity[] = [
  {
    id: 'watch-1',
    entity: 'Archer Aviation',
    ticker: 'ACHR',
    focus: 'UAM • FAA certification • battery supply chain',
    itemCount: 3,
  },
  {
    id: 'watch-2',
    entity: 'NVIDIA',
    ticker: 'NVDA',
    focus: 'AI chip demand • export restrictions • data center buildout',
    itemCount: 2,
  },
  {
    id: 'watch-3',
    entity: 'Microsoft',
    ticker: 'MSFT',
    focus: 'Azure AI revenue • OpenAI partnership • enterprise adoption',
    itemCount: 1,
  },
];

// Company Dossier for ACHR
export const archerDossier: CompanyDossier = {
  snapshot: {
    entity: 'Archer Aviation',
    ticker: 'ACHR',
    focusTags: ['Urban Air Mobility', 'eVTOL', 'FAA Part 135', 'Stellantis Partnership'],
    nextRequired: 'Q3 Earnings Call • Today 1:30 PM PT',
    upcomingMilestone: 'FAA Type Certification (Phase 4) • Expected Q4 2024',
  },
  timeline: [
    {
      id: 'tl-1',
      when: 'Today 06:42',
      what: 'LG Energy Solution announces battery module JV with Korean supplier',
      why: 'Capacity signal for ACHR production ramp; validates battery roadmap for 2025 scaling.',
      sources: ['Korean Economic Daily', 'Company Press Release'],
    },
    {
      id: 'tl-2',
      when: 'Yesterday 14:05',
      what: 'FAA publishes updated eVTOL certification guidance (Notice 8900.XXX)',
      why: 'Clarifies path for powered-lift category; de-risks timeline assumptions for ACHR, JOBY.',
      sources: ['FAA.gov', 'Aviation Week'],
    },
    {
      id: 'tl-3',
      when: '2 days ago 09:11',
      what: 'Archer adds former Boeing VP of Manufacturing as Chief Operating Officer',
      why: 'Signals scaling phase; brings production expertise from 737/787 programs.',
      sources: ['Company Filing 8-K', 'LinkedIn'],
    },
  ],
  upcomingDates: [
    {
      id: 'up-1',
      date: 'Today',
      title: 'Q3 Earnings Call',
      note: 'Watch for: FAA timeline, Stellantis order book, cash runway commentary',
    },
    {
      id: 'up-2',
      date: 'Nov 15-18',
      title: 'Dubai Airshow (expected presence)',
      note: 'Potential international order announcements; Middle East UAM interest',
    },
    {
      id: 'up-3',
      date: 'Q4 2024',
      title: 'FAA Type Certification Milestone',
      note: 'Phase 4 completion target; watch for any schedule updates in earnings',
    },
  ],
};

// NVDA Dossier
export const nvidiaDossier: CompanyDossier = {
  snapshot: {
    entity: 'NVIDIA',
    ticker: 'NVDA',
    focusTags: ['AI Chips', 'Data Center', 'Export Controls', 'Blackwell Architecture'],
    nextRequired: 'AI Summit Keynote • Today 3:00 PM PT',
    upcomingMilestone: 'Blackwell GPU Volume Production • Q1 2025',
  },
  timeline: [
    {
      id: 'nvda-tl-1',
      when: 'Today 08:15',
      what: 'TSMC reports 3nm chip demand surging; AI accelerator orders up 35% QoQ',
      why: 'Validates NVDA supply chain strength; production capacity de-risked for Blackwell ramp.',
      sources: ['TSMC Investor Call', 'Nikkei Asia'],
    },
    {
      id: 'nvda-tl-2',
      when: 'Yesterday 16:20',
      what: 'Commerce Dept clarifies AI chip export license requirements for Middle East',
      why: 'Reduces regulatory uncertainty; potential upside to international revenue estimates.',
      sources: ['BIS.gov', 'Reuters'],
    },
  ],
  upcomingDates: [
    {
      id: 'nvda-up-1',
      date: 'Today',
      title: 'AI Summit Keynote - Jensen Huang',
      note: 'Expected: Blackwell details, new partnerships, automotive AI roadmap',
    },
    {
      id: 'nvda-up-2',
      date: 'Nov 20',
      title: 'Q3 FY25 Earnings Report',
      note: 'Street focused on: Data center revenue, Blackwell production status, China impact',
    },
  ],
};

// Calendar Week at a Glance
export const calendarWeekGlance = {
  Monday: 'Light macro day; ISM Services PMI (10:00 AM). TSMC earnings (after close). Fed speakers: Barkin, Bostic.',
  Tuesday: 'CPI (Core 5:30 AM PT) drives vol. Fed Chair Powell (7:00 AM). Tech earnings: ACHR, PLTR. Treasury auctions.',
  Wednesday: 'PPI (5:30 AM PT). FOMC minutes (11:00 AM PT). Retail sales preview. NVDA AI Summit (3:00 PM).',
  Thursday: 'Jobless claims, Philly Fed. More Fed speakers. Semi-conductor supply chain summit (industry event).',
  Friday: 'Housing data (starts, permits). Triple witching expiration. Light earnings calendar. Market closes 1:00 PM PT.',
};

// Learning Lab Quizzes
export const quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    question: 'Why does higher-than-expected Core CPI typically cause tech stocks to decline?',
    options: [
      'Tech companies have more inflation-sensitive costs',
      'Higher inflation → Fed keeps rates high longer → tech valuations compress (duration effect)',
      'CPI directly measures tech product prices',
      'It doesn\'t - tech stocks are inflation hedges',
    ],
    correctAnswer: 1,
    explanation:
      'Growth stocks like tech are valued on distant future cash flows. Higher rates = lower present value of those flows. This "duration effect" hits high-multiple stocks hardest.',
    category: 'Macro',
  },
  {
    id: 'quiz-2',
    question: 'What does it mean when a company "beats on earnings but misses on revenue"?',
    options: [
      'EPS > consensus, Revenue < consensus (often via cost cuts or buybacks)',
      'Revenue > consensus, EPS < consensus',
      'Both metrics beat estimates',
      'Accounting error in the report',
    ],
    correctAnswer: 0,
    explanation:
      'A company can exceed EPS expectations through margin expansion, share buybacks, or one-time gains—even if top-line growth disappoints. Markets often prefer revenue beats (growth signal) over EPS beats from cost-cutting.',
    category: 'Earnings',
  },
  {
    id: 'quiz-3',
    question: 'If ACHR announces "FAA Phase 4 completion," what does that signal?',
    options: [
      'Type Certification received - can begin commercial operations',
      'Just started the certification process',
      'Failed certification requirements',
      'Pilot training phase',
    ],
    correctAnswer: 0,
    explanation:
      'Phase 4 is the final step before the FAA issues Type Certification. Completion means the aircraft design is validated for commercial passenger ops under Part 135 (air carrier rules). Major de-risking event.',
    category: 'Industry-Specific',
  },
];

// Scenario Analysis
export const scenarios: ScenarioAnalysis[] = [
  {
    id: 'scenario-1',
    scenario: 'What if Core CPI comes in at 0.5% MoM (vs 0.3% consensus)?',
    setup: 'Hot inflation print → Fed hawks win the narrative → rate cut expectations pushed out',
    outcomes: [
      {
        label: '10Y Treasury spikes to 4.40%+',
        probability: 0.8,
        impact: 'High - Resets discount rates across all assets',
      },
      {
        label: 'Nasdaq drops 2-3% intraday',
        probability: 0.75,
        impact: 'High - Growth stocks get hit hardest (duration effect)',
      },
      {
        label: 'Dollar strengthens vs. euro/yen',
        probability: 0.85,
        impact: 'Medium - Affects multinational revenue translations',
      },
      {
        label: 'Gold sells off $30-50/oz',
        probability: 0.7,
        impact: 'Medium - Higher real rates reduce non-yielding asset appeal',
      },
    ],
  },
  {
    id: 'scenario-2',
    scenario: 'What if ACHR announces FAA certification delay of 2 quarters?',
    setup: 'Timeline pushes to mid-2025 → revenue ramp delayed → cash burn concerns resurface',
    outcomes: [
      {
        label: 'Stock drops 15-25%',
        probability: 0.9,
        impact: 'High - Valuation tied to commercialization timeline',
      },
      {
        label: 'Analyst downgrades (PT cuts)',
        probability: 0.85,
        impact: 'High - DCF models pushed out, cash runway questions',
      },
      {
        label: 'Peer sympathy selloff (JOBY, LILM)',
        probability: 0.6,
        impact: 'Medium - Market questions entire sector timeline',
      },
      {
        label: 'Insider buying appears (management confidence signal)',
        probability: 0.4,
        impact: 'Low/Medium - Could stabilize selloff if material purchases',
      },
    ],
  },
];

// Trade Journal Entries
export const tradeEntries: TradeEntry[] = [
  {
    id: 'trade-1',
    date: '2024-11-01',
    ticker: 'ACHR',
    action: 'buy',
    price: 4.25,
    reasoning:
      'FAA certification on track (Phase 3 complete). LG battery partnership de-risks supply chain. Stellantis orderbook provides revenue visibility. Entry after 15% pullback from $5.',
    aiReview:
      '✓ Strong thesis: Catalysts identified, risk-aware entry timing. Consider: Cash burn rate through certification (check Q3 call today). Position sizing: High beta play - manage accordingly.',
    outcome: 'pending',
  },
  {
    id: 'trade-2',
    date: '2024-10-28',
    ticker: 'NVDA',
    action: 'watch',
    reasoning: 'Waiting for pullback to $130-135 range. Blackwell ramp is bullish but stock ran 40% in 6 weeks. Want better entry.',
    aiReview:
      '✓ Disciplined patience. Note: AI Summit today could be catalyst. If Blackwell details impress + hyperscaler commentary strong, may not get $135. Consider: Starter position now, add on dips?',
    outcome: 'pending',
  },
];

// Sources
export const sources: Source[] = [
  {
    id: 'src-1',
    name: 'Federal Reserve Press Releases',
    url: 'https://www.federalreserve.gov/newsevents/pressreleases.htm',
    type: 'rss',
    enabled: true,
    lastChecked: '30 min ago',
    reliability: 1.0,
  },
  {
    id: 'src-2',
    name: 'SEC EDGAR Filings',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar',
    type: 'website',
    enabled: true,
    lastChecked: '1 hour ago',
    reliability: 1.0,
  },
  {
    id: 'src-3',
    name: 'Trump Truth Social',
    url: 'https://truthsocial.com/@realDonaldTrump',
    type: 'social',
    enabled: true,
    lastChecked: '15 min ago',
    reliability: 0.7,
  },
  {
    id: 'src-4',
    name: 'r/wallstreetbets',
    url: 'https://www.reddit.com/r/wallstreetbets/',
    type: 'social',
    enabled: true,
    lastChecked: '20 min ago',
    reliability: 0.5,
  },
  {
    id: 'src-5',
    name: 'Bloomberg Terminal Feed',
    url: 'https://bloomberg.com/markets',
    type: 'website',
    enabled: false,
    reliability: 0.95,
  },
];

// Financial Terms Dictionary (for tooltips)
export const financialTerms: Record<string, string> = {
  CPI: 'Consumer Price Index - Measures inflation by tracking price changes in a basket of consumer goods and services',
  'Core CPI': 'CPI excluding volatile food and energy prices; Fed\'s preferred inflation gauge',
  MoM: 'Month-over-Month - Percentage change from previous month',
  YoY: 'Year-over-Year - Percentage change from same period last year',
  Cons: 'Consensus - Average estimate from surveyed analysts',
  EPS: 'Earnings Per Share - Company profit divided by shares outstanding',
  QoQ: 'Quarter-over-Quarter - Sequential quarterly comparison',
  'Fed Funds Rate': 'Overnight lending rate between banks; Fed\'s primary policy tool',
  eVTOL: 'Electric Vertical Takeoff and Landing - Electric aircraft that can hover like helicopter',
  UAM: 'Urban Air Mobility - Emerging aviation sector for city transportation',
  'Part 135': 'FAA regulation governing commercial air taxi operations',
  DCF: 'Discounted Cash Flow - Valuation method based on future cash flow projections',
  'Triple Witching': 'Quarterly expiration of stock options, index options, and futures simultaneously',
  Capex: 'Capital Expenditures - Money spent on physical assets like equipment, buildings',
  PMI: 'Purchasing Managers\' Index - Economic indicator of manufacturing sector health',
};
