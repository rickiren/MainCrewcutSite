// Comprehensive n8n Node Library with Real Schemas
// This provides the AI with knowledge of actual n8n nodes and their parameters

export interface N8nNodeParameter {
  name: string;
  type: string;
  default?: any;
  description: string;
  required?: boolean;
  options?: Array<{ name: string; value: string }>;
}

export interface N8nNodeDefinition {
  type: string;
  displayName: string;
  name: string;
  icon?: string;
  group: string[];
  version: number;
  description: string;
  defaults: {
    name: string;
  };
  inputs: string[];
  outputs: string[];
  credentials?: Array<{
    name: string;
    required: boolean;
  }>;
  properties: N8nNodeParameter[];
  commonUses: string[];
  exampleParameters?: any;
}

export const n8nNodeLibrary: Record<string, N8nNodeDefinition> = {
  // ============ TRIGGERS ============
  'n8n-nodes-base.cron': {
    type: 'n8n-nodes-base.cron',
    displayName: 'Schedule Trigger',
    name: 'Schedule Trigger',
    group: ['trigger', 'schedule'],
    version: 1,
    description: 'Triggers workflow on a schedule using cron expressions',
    defaults: { name: 'Schedule Trigger' },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        name: 'triggerTimes',
        type: 'object',
        default: {},
        description: 'When to trigger the workflow',
        required: true
      },
      {
        name: 'mode',
        type: 'options',
        default: 'everyWeek',
        description: 'Trigger mode',
        options: [
          { name: 'Every Minute', value: 'everyMinute' },
          { name: 'Every Hour', value: 'everyHour' },
          { name: 'Every Day', value: 'everyDay' },
          { name: 'Every Week', value: 'everyWeek' },
          { name: 'Every Month', value: 'everyMonth' },
          { name: 'Custom', value: 'custom' }
        ]
      }
    ],
    commonUses: ['scheduled reports', 'daily backups', 'weekly summaries', 'recurring tasks'],
    exampleParameters: {
      mode: 'everyWeek',
      triggerTimes: {
        item: [
          {
            hour: 9,
            minute: 0,
            dayOfWeek: 1
          }
        ]
      }
    }
  },

  'n8n-nodes-base.webhook': {
    type: 'n8n-nodes-base.webhook',
    displayName: 'Webhook',
    name: 'Webhook',
    group: ['trigger'],
    version: 1,
    description: 'Starts workflow when a webhook is called',
    defaults: { name: 'Webhook' },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        name: 'httpMethod',
        type: 'options',
        default: 'POST',
        description: 'HTTP method to listen for',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' }
        ]
      },
      {
        name: 'path',
        type: 'string',
        default: '',
        description: 'Webhook path'
      },
      {
        name: 'responseMode',
        type: 'options',
        default: 'onReceived',
        options: [
          { name: 'On Received', value: 'onReceived' },
          { name: 'Last Node', value: 'lastNode' }
        ]
      }
    ],
    commonUses: ['external API integrations', 'form submissions', 'third-party notifications', 'real-time events']
  },

  // ============ COMMUNICATION ============
  'n8n-nodes-base.slack': {
    type: 'n8n-nodes-base.slack',
    displayName: 'Slack',
    name: 'Slack',
    group: ['communication'],
    version: 1,
    description: 'Send messages and interact with Slack',
    defaults: { name: 'Slack' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'slackApi',
        required: true
      }
    ],
    properties: [
      {
        name: 'resource',
        type: 'options',
        default: 'message',
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Channel', value: 'channel' },
          { name: 'User', value: 'user' },
          { name: 'File', value: 'file' }
        ]
      },
      {
        name: 'operation',
        type: 'options',
        default: 'post',
        options: [
          { name: 'Post', value: 'post' },
          { name: 'Get', value: 'get' },
          { name: 'Update', value: 'update' }
        ]
      },
      {
        name: 'channel',
        type: 'string',
        default: '',
        description: 'Channel to send message to'
      },
      {
        name: 'text',
        type: 'string',
        default: '',
        description: 'Message text'
      }
    ],
    commonUses: ['team notifications', 'alerts', 'collaboration', 'status updates'],
    exampleParameters: {
      resource: 'message',
      operation: 'post',
      channel: '#general',
      text: '={{ $json.message }}'
    }
  },

  'n8n-nodes-base.gmail': {
    type: 'n8n-nodes-base.gmail',
    displayName: 'Gmail',
    name: 'Gmail',
    group: ['communication'],
    version: 1,
    description: 'Send and receive emails via Gmail',
    defaults: { name: 'Gmail' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'gmailOAuth2',
        required: true
      }
    ],
    properties: [
      {
        name: 'resource',
        type: 'options',
        default: 'message',
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Draft', value: 'draft' },
          { name: 'Label', value: 'label' }
        ]
      },
      {
        name: 'operation',
        type: 'options',
        default: 'send',
        options: [
          { name: 'Send', value: 'send' },
          { name: 'Get', value: 'get' },
          { name: 'Get All', value: 'getAll' }
        ]
      },
      {
        name: 'to',
        type: 'string',
        default: '',
        description: 'Email recipient'
      },
      {
        name: 'subject',
        type: 'string',
        default: '',
        description: 'Email subject'
      },
      {
        name: 'message',
        type: 'string',
        default: '',
        description: 'Email body'
      }
    ],
    commonUses: ['email notifications', 'reports', 'automated responses', 'customer communication'],
    exampleParameters: {
      resource: 'message',
      operation: 'send',
      to: '={{ $json.recipientEmail }}',
      subject: 'Weekly Report',
      message: '={{ $json.reportContent }}'
    }
  },

  'n8n-nodes-base.discord': {
    type: 'n8n-nodes-base.discord',
    displayName: 'Discord',
    name: 'Discord',
    group: ['communication'],
    version: 1,
    description: 'Send messages to Discord',
    defaults: { name: 'Discord' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'discordWebhookApi',
        required: true
      }
    ],
    properties: [
      {
        name: 'text',
        type: 'string',
        default: '',
        description: 'Message to send'
      },
      {
        name: 'username',
        type: 'string',
        default: '',
        description: 'Bot username'
      }
    ],
    commonUses: ['community notifications', 'gaming alerts', 'team updates'],
    exampleParameters: {
      text: '={{ $json.notification }}',
      username: 'Automation Bot'
    }
  },

  // ============ AI / NLP ============
  'n8n-nodes-base.openAi': {
    type: 'n8n-nodes-base.openAi',
    displayName: 'OpenAI',
    name: 'OpenAI',
    group: ['transform', 'ai'],
    version: 1,
    description: 'Use OpenAI GPT models for text generation and analysis',
    defaults: { name: 'OpenAI' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'openAiApi',
        required: true
      }
    ],
    properties: [
      {
        name: 'resource',
        type: 'options',
        default: 'text',
        options: [
          { name: 'Text', value: 'text' },
          { name: 'Image', value: 'image' },
          { name: 'Audio', value: 'audio' }
        ]
      },
      {
        name: 'operation',
        type: 'options',
        default: 'complete',
        options: [
          { name: 'Complete', value: 'complete' },
          { name: 'Message', value: 'message' }
        ]
      },
      {
        name: 'model',
        type: 'options',
        default: 'gpt-4',
        options: [
          { name: 'GPT-4', value: 'gpt-4' },
          { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
        ]
      },
      {
        name: 'prompt',
        type: 'string',
        default: '',
        description: 'The prompt for text generation'
      }
    ],
    commonUses: ['text summarization', 'content generation', 'data analysis', 'classification'],
    exampleParameters: {
      resource: 'text',
      operation: 'message',
      model: 'gpt-4',
      prompt: '={{ $json.inputText }}'
    }
  },

  // ============ DATA STORAGE ============
  'n8n-nodes-base.googleSheets': {
    type: 'n8n-nodes-base.googleSheets',
    displayName: 'Google Sheets',
    name: 'Google Sheets',
    group: ['input', 'output'],
    version: 3,
    description: 'Read and write data to Google Sheets',
    defaults: { name: 'Google Sheets' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'googleSheetsOAuth2Api',
        required: true
      }
    ],
    properties: [
      {
        name: 'operation',
        type: 'options',
        default: 'append',
        options: [
          { name: 'Append', value: 'append' },
          { name: 'Read', value: 'read' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' }
        ]
      },
      {
        name: 'sheetId',
        type: 'string',
        default: '',
        description: 'The ID of the spreadsheet'
      },
      {
        name: 'range',
        type: 'string',
        default: 'A:Z',
        description: 'The range to read/write'
      }
    ],
    commonUses: ['data logging', 'reporting', 'data sync', 'tracking'],
    exampleParameters: {
      operation: 'append',
      sheetId: '{{ $json.spreadsheetId }}',
      range: 'Sheet1!A:Z'
    }
  },

  'n8n-nodes-base.airtable': {
    type: 'n8n-nodes-base.airtable',
    displayName: 'Airtable',
    name: 'Airtable',
    group: ['input', 'output'],
    version: 1,
    description: 'Read and write data to Airtable',
    defaults: { name: 'Airtable' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'airtableApi',
        required: true
      }
    ],
    properties: [
      {
        name: 'operation',
        type: 'options',
        default: 'create',
        options: [
          { name: 'Create', value: 'create' },
          { name: 'List', value: 'list' },
          { name: 'Read', value: 'read' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' }
        ]
      },
      {
        name: 'base',
        type: 'string',
        default: '',
        description: 'Base ID'
      },
      {
        name: 'table',
        type: 'string',
        default: '',
        description: 'Table name'
      }
    ],
    commonUses: ['CRM management', 'project tracking', 'database operations'],
    exampleParameters: {
      operation: 'create',
      base: 'appXXXXXXXX',
      table: 'Contacts'
    }
  },

  'n8n-nodes-base.postgres': {
    type: 'n8n-nodes-base.postgres',
    displayName: 'Postgres',
    name: 'Postgres',
    group: ['input', 'output'],
    version: 1,
    description: 'Execute PostgreSQL queries',
    defaults: { name: 'Postgres' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'postgres',
        required: true
      }
    ],
    properties: [
      {
        name: 'operation',
        type: 'options',
        default: 'executeQuery',
        options: [
          { name: 'Execute Query', value: 'executeQuery' },
          { name: 'Insert', value: 'insert' },
          { name: 'Update', value: 'update' }
        ]
      },
      {
        name: 'query',
        type: 'string',
        default: '',
        description: 'SQL query to execute'
      }
    ],
    commonUses: ['database queries', 'data storage', 'data retrieval'],
    exampleParameters: {
      operation: 'executeQuery',
      query: 'SELECT * FROM users WHERE active = true'
    }
  },

  // ============ HTTP / API ============
  'n8n-nodes-base.httpRequest': {
    type: 'n8n-nodes-base.httpRequest',
    displayName: 'HTTP Request',
    name: 'HTTP Request',
    group: ['output'],
    version: 3,
    description: 'Make HTTP requests to any API',
    defaults: { name: 'HTTP Request' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'method',
        type: 'options',
        default: 'GET',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' }
        ]
      },
      {
        name: 'url',
        type: 'string',
        default: '',
        description: 'The URL to make the request to',
        required: true
      },
      {
        name: 'authentication',
        type: 'options',
        default: 'none',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Basic Auth', value: 'basicAuth' },
          { name: 'Header Auth', value: 'headerAuth' }
        ]
      }
    ],
    commonUses: ['API calls', 'webhook triggers', 'external integrations'],
    exampleParameters: {
      method: 'POST',
      url: 'https://api.example.com/data',
      authentication: 'headerAuth'
    }
  },

  // ============ LOGIC / CONTROL ============
  'n8n-nodes-base.if': {
    type: 'n8n-nodes-base.if',
    displayName: 'IF',
    name: 'IF',
    group: ['transform'],
    version: 1,
    description: 'Split workflow based on conditions',
    defaults: { name: 'IF' },
    inputs: ['main'],
    outputs: ['main', 'main'],
    properties: [
      {
        name: 'conditions',
        type: 'object',
        default: {},
        description: 'Conditions to check'
      },
      {
        name: 'combineOperation',
        type: 'options',
        default: 'all',
        options: [
          { name: 'ALL', value: 'all' },
          { name: 'ANY', value: 'any' }
        ]
      }
    ],
    commonUses: ['conditional routing', 'data filtering', 'decision trees'],
    exampleParameters: {
      conditions: {
        number: [
          {
            value1: '={{ $json.amount }}',
            operation: 'larger',
            value2: 1000
          }
        ]
      }
    }
  },

  'n8n-nodes-base.switch': {
    type: 'n8n-nodes-base.switch',
    displayName: 'Switch',
    name: 'Switch',
    group: ['transform'],
    version: 1,
    description: 'Route items to different branches',
    defaults: { name: 'Switch' },
    inputs: ['main'],
    outputs: ['main', 'main', 'main', 'main'],
    properties: [
      {
        name: 'mode',
        type: 'options',
        default: 'rules',
        options: [
          { name: 'Rules', value: 'rules' },
          { name: 'Expression', value: 'expression' }
        ]
      },
      {
        name: 'rules',
        type: 'object',
        default: {},
        description: 'Switch rules'
      }
    ],
    commonUses: ['multi-path routing', 'categorization', 'workflow branching']
  },

  'n8n-nodes-base.merge': {
    type: 'n8n-nodes-base.merge',
    displayName: 'Merge',
    name: 'Merge',
    group: ['transform'],
    version: 2,
    description: 'Merge data from multiple sources',
    defaults: { name: 'Merge' },
    inputs: ['main', 'main'],
    outputs: ['main'],
    properties: [
      {
        name: 'mode',
        type: 'options',
        default: 'combine',
        options: [
          { name: 'Combine', value: 'combine' },
          { name: 'Append', value: 'append' },
          { name: 'Keep Matches', value: 'keepMatches' }
        ]
      }
    ],
    commonUses: ['data combination', 'parallel processing', 'data enrichment']
  },

  'n8n-nodes-base.splitInBatches': {
    type: 'n8n-nodes-base.splitInBatches',
    displayName: 'Split In Batches',
    name: 'Split In Batches',
    group: ['transform'],
    version: 1,
    description: 'Process items in batches',
    defaults: { name: 'Split In Batches' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'batchSize',
        type: 'number',
        default: 10,
        description: 'Number of items per batch'
      },
      {
        name: 'options',
        type: 'object',
        default: {}
      }
    ],
    commonUses: ['batch processing', 'rate limiting', 'API pagination']
  },

  'n8n-nodes-base.loop': {
    type: 'n8n-nodes-base.loop',
    displayName: 'Loop Over Items',
    name: 'Loop Over Items',
    group: ['transform'],
    version: 1,
    description: 'Execute operations for each item',
    defaults: { name: 'Loop Over Items' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [],
    commonUses: ['iterating over arrays', 'bulk operations', 'data processing']
  },

  // ============ DATA MANIPULATION ============
  'n8n-nodes-base.set': {
    type: 'n8n-nodes-base.set',
    displayName: 'Set',
    name: 'Set',
    group: ['transform'],
    version: 1,
    description: 'Set or modify data values',
    defaults: { name: 'Set' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'values',
        type: 'object',
        default: {},
        description: 'Values to set'
      },
      {
        name: 'options',
        type: 'object',
        default: {}
      }
    ],
    commonUses: ['data transformation', 'field mapping', 'data formatting'],
    exampleParameters: {
      values: {
        string: [
          {
            name: 'fullName',
            value: '={{ $json.firstName }} {{ $json.lastName }}'
          }
        ]
      }
    }
  },

  'n8n-nodes-base.code': {
    type: 'n8n-nodes-base.code',
    displayName: 'Code',
    name: 'Code',
    group: ['transform'],
    version: 1,
    description: 'Execute custom JavaScript code',
    defaults: { name: 'Code' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'mode',
        type: 'options',
        default: 'runOnceForAllItems',
        options: [
          { name: 'Run Once for All Items', value: 'runOnceForAllItems' },
          { name: 'Run Once for Each Item', value: 'runOnceForEachItem' }
        ]
      },
      {
        name: 'jsCode',
        type: 'string',
        default: '',
        description: 'JavaScript code to execute'
      }
    ],
    commonUses: ['custom logic', 'complex transformations', 'data validation'],
    exampleParameters: {
      mode: 'runOnceForAllItems',
      jsCode: 'return items.map(item => ({ ...item.json, processed: true }));'
    }
  },

  'n8n-nodes-base.filter': {
    type: 'n8n-nodes-base.filter',
    displayName: 'Filter',
    name: 'Filter',
    group: ['transform'],
    version: 1,
    description: 'Filter items based on conditions',
    defaults: { name: 'Filter' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'conditions',
        type: 'object',
        default: {},
        description: 'Filter conditions'
      }
    ],
    commonUses: ['data filtering', 'validation', 'conditional processing'],
    exampleParameters: {
      conditions: {
        string: [
          {
            value1: '={{ $json.status }}',
            operation: 'equals',
            value2: 'active'
          }
        ]
      }
    }
  },

  // ============ UTILITIES ============
  'n8n-nodes-base.errorTrigger': {
    type: 'n8n-nodes-base.errorTrigger',
    displayName: 'Error Trigger',
    name: 'Error Trigger',
    group: ['trigger'],
    version: 1,
    description: 'Triggers when an error occurs in another workflow',
    defaults: { name: 'Error Trigger' },
    inputs: [],
    outputs: ['main'],
    properties: [],
    commonUses: ['error handling', 'failure notifications', 'logging']
  },

  'n8n-nodes-base.wait': {
    type: 'n8n-nodes-base.wait',
    displayName: 'Wait',
    name: 'Wait',
    group: ['transform'],
    version: 1,
    description: 'Pause workflow execution',
    defaults: { name: 'Wait' },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'resume',
        type: 'options',
        default: 'timeInterval',
        options: [
          { name: 'After Time Interval', value: 'timeInterval' },
          { name: 'At Specified Time', value: 'specificTime' },
          { name: 'On Webhook Call', value: 'webhook' }
        ]
      },
      {
        name: 'amount',
        type: 'number',
        default: 1,
        description: 'Time to wait'
      },
      {
        name: 'unit',
        type: 'options',
        default: 'minutes',
        options: [
          { name: 'Seconds', value: 'seconds' },
          { name: 'Minutes', value: 'minutes' },
          { name: 'Hours', value: 'hours' }
        ]
      }
    ],
    commonUses: ['rate limiting', 'delays', 'scheduling']
  },

  // ============ CRM / BUSINESS ============
  'n8n-nodes-base.salesforce': {
    type: 'n8n-nodes-base.salesforce',
    displayName: 'Salesforce',
    name: 'Salesforce',
    group: ['transform'],
    version: 1,
    description: 'Interact with Salesforce CRM',
    defaults: { name: 'Salesforce' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'salesforceOAuth2Api',
        required: true
      }
    ],
    properties: [
      {
        name: 'resource',
        type: 'options',
        default: 'lead',
        options: [
          { name: 'Lead', value: 'lead' },
          { name: 'Contact', value: 'contact' },
          { name: 'Opportunity', value: 'opportunity' },
          { name: 'Account', value: 'account' }
        ]
      },
      {
        name: 'operation',
        type: 'options',
        default: 'create',
        options: [
          { name: 'Create', value: 'create' },
          { name: 'Get', value: 'get' },
          { name: 'Update', value: 'update' }
        ]
      }
    ],
    commonUses: ['CRM automation', 'lead management', 'sales tracking']
  },

  'n8n-nodes-base.hubspot': {
    type: 'n8n-nodes-base.hubspot',
    displayName: 'HubSpot',
    name: 'HubSpot',
    group: ['transform'],
    version: 1,
    description: 'Interact with HubSpot CRM',
    defaults: { name: 'HubSpot' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'hubspotApi',
        required: true
      }
    ],
    properties: [
      {
        name: 'resource',
        type: 'options',
        default: 'contact',
        options: [
          { name: 'Contact', value: 'contact' },
          { name: 'Company', value: 'company' },
          { name: 'Deal', value: 'deal' }
        ]
      }
    ],
    commonUses: ['marketing automation', 'contact management', 'lead tracking']
  },

  'n8n-nodes-base.notion': {
    type: 'n8n-nodes-base.notion',
    displayName: 'Notion',
    name: 'Notion',
    group: ['input', 'output'],
    version: 2,
    description: 'Read and write to Notion databases',
    defaults: { name: 'Notion' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'notionApi',
        required: true
      }
    ],
    properties: [
      {
        name: 'resource',
        type: 'options',
        default: 'page',
        options: [
          { name: 'Page', value: 'page' },
          { name: 'Database', value: 'database' },
          { name: 'Block', value: 'block' }
        ]
      },
      {
        name: 'operation',
        type: 'options',
        default: 'create',
        options: [
          { name: 'Create', value: 'create' },
          { name: 'Get', value: 'get' },
          { name: 'Update', value: 'update' }
        ]
      }
    ],
    commonUses: ['knowledge management', 'project tracking', 'documentation']
  }
};

// Helper function to get nodes by category
export const getNodesByCategory = (category: string): N8nNodeDefinition[] => {
  return Object.values(n8nNodeLibrary).filter(node =>
    node.group.includes(category)
  );
};

// Helper function to find best node for a use case
export const findNodesForUseCase = (useCase: string): N8nNodeDefinition[] => {
  const lowerUseCase = useCase.toLowerCase();
  return Object.values(n8nNodeLibrary).filter(node =>
    node.commonUses.some(use => use.toLowerCase().includes(lowerUseCase)) ||
    node.description.toLowerCase().includes(lowerUseCase)
  );
};

// Get all available node types
export const getAllNodeTypes = (): string[] => {
  return Object.keys(n8nNodeLibrary);
};
