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
  },
  {
    id: 'kick-overlay-generator',
    title: 'Kick Overlay Generator',
    description: 'Create professional streaming overlays for Kick with AI-powered design assistance, drag-and-drop editor, and instant HTML export for OBS.',
    image: '/kick-overlay-generator.png',
    category: 'Content Creation',
    features: [
      'AI-powered overlay generation',
      'Drag-and-drop editor',
      'Real-time preview',
      'Customizable themes',
      'Export to HTML/OBS',
      'Pre-built templates'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    demoUrl: '/apps/kick-overlay-generator',
    demoMetrics: [
      { title: 'Templates', value: '50+' },
      { title: 'Export Time', value: '<5s' },
      { title: 'Themes', value: '12' },
      { title: 'Elements', value: '30+' }
    ],
    demoHighlights: [
      'AI-generated overlay designs from text descriptions',
      'Drag-and-drop element positioning',
      'Live preview with customization panel',
      'One-click export to OBS-ready HTML'
    ]
  },
  {
    id: 'vibe-coder-console',
    title: 'Vibe Coder Console',
    description: 'Automate what you hate — instantly. Transform repetitive tasks into working n8n automation workflows with AI-powered blueprint generation.',
    image: '/vibe-coder-console.png',
    category: 'Productivity',
    features: [
      'AI-powered automation analysis',
      'Visual workflow blueprints',
      'n8n workflow generation',
      'Real-time step breakdown',
      'One-click export',
      'Glowing vibe aesthetic'
    ],
    technologies: ['React', 'TypeScript', 'Claude API', 'n8n'],
    demoUrl: '/apps/vibe-coder-console',
    demoMetrics: [
      { title: 'Gen Time', value: '<30s' },
      { title: 'Workflows', value: '100+' },
      { title: 'Services', value: '50+' },
      { title: 'Success', value: '94%' }
    ],
    demoHighlights: [
      'Natural language task description',
      'AI breaks down automation into clear steps',
      'Visual flowchart with glowing connections',
      'Download working n8n workflow JSON'
    ]
  }
];

export const getAppById = (id: string): App | undefined => {
  return apps.find(app => app.id === id);
};

export const getAppsByCategory = (category: string): App[] => {
  return apps.filter(app => app.category === category);
};
