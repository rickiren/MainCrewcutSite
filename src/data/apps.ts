export interface App {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  isExternal?: boolean; // If true, app is hosted on a different site
  externalUrl?: string; // URL to the external app (for iframe embedding)
  demoMetrics?: {
    title: string;
    value: string;
    change?: string;
  }[];
  demoHighlights?: string[];
}

export const apps: App[] = [
  {
    id: 'writing-editor',
    title: 'AI Logistics Optimizer',
    description: 'Cut delivery costs and delays with real-time fleet tracking and AI-powered route optimization.',
    image: '/ai logistics thumbnail.png',
    category: 'Productivity',
    features: [
      'Live fleet tracking',
      'Route optimization',
      'Real-time metrics',
      'Predictive insights',
      'Cost analytics'
    ],
    technologies: ['React', 'TypeScript', 'OpenAI API', 'Tailwind CSS'],
    demoUrl: '/apps/writing-editor',
    demoMetrics: [
      { title: 'Savings', value: '$2.4M', change: '+12%' },
      { title: 'Fuel Eff.', value: '94.2%' },
      { title: 'On-Time', value: '87.5%' },
      { title: 'Route Opt.', value: '91.8%' }
    ],
    demoHighlights: [
      'Live Fleet Map with real-time vehicle tracking',
      'Route optimization algorithms',
      'Real-time alerts and notifications',
      'Performance analytics dashboard'
    ]
  },
  {
    id: 'ai-logistics-optimizer-2',
    title: 'AI Real Estate Deal Analyzer',
    description: 'Streamline property investment decisions with AI-powered financial modeling, automated deal analysis, and professional reporting for multi-family real estate portfolios.',
    image: '/ai real estate.png',
    category: 'Productivity',
    features: [
      'Automated deal analysis',
      'Professional PDF reports',
      'AI-powered insights',
      'Financial modeling',
      'Portfolio management'
    ],
    technologies: ['React', 'Recharts', 'Claude API', 'TypeScript'],
    demoUrl: '/apps/ai-logistics-optimizer-2',
    demoMetrics: [
      { title: 'Total Units', value: '152' },
      { title: 'Portfolio Value', value: '$25.5M' },
      { title: 'Avg Cap Rate', value: '6.7%' },
      { title: 'Cash Flow', value: '$269K' }
    ],
    demoHighlights: [
      'Multi-property portfolio analysis',
      'AI-generated financial insights',
      'Professional PDF reporting',
      'Real-time market data integration'
    ]
  },
  {
    id: 'ai-trading-coach',
    title: 'AI Trading Coach',
    description: 'Intelligent trading guidance powered by AI. Get personalized market insights, trading strategies, and real-time coaching to improve your trading performance.',
    image: '/ai-trading-coach.png',
    category: 'Finance',
    features: [
      'AI-powered trading insights',
      'Real-time market analysis',
      'Personalized coaching',
      'Strategy recommendations',
      'Performance tracking'
    ],
    technologies: ['React', 'TypeScript', 'AI/ML', 'Firebase'],
    isExternal: true,
    externalUrl: 'https://ai-trading-coach-b87dc.web.app/',
    demoMetrics: [
      { title: 'Users', value: '500+', change: '+15%' },
      { title: 'Accuracy', value: '87%' },
      { title: 'Avg Return', value: '+12.5%' },
      { title: 'Success Rate', value: '82%' }
    ],
    demoHighlights: [
      'AI-powered market analysis',
      'Personalized trading strategies',
      'Real-time coaching and insights',
      'Performance analytics dashboard'
    ]
  }
];

export const getAppById = (id: string): App | undefined => {
  return apps.find(app => app.id === id);
};

export const getAppsByCategory = (category: string): App[] => {
  return apps.filter(app => app.category === category);
};
