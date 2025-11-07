import { claudeAPI } from './claudeApi';
import { n8nNodeLibrary, N8nNodeDefinition } from './n8nNodeLibrary';

export interface WorkflowStep {
  step: number;
  type: 'Trigger' | 'Process' | 'Action' | 'Logic' | 'Transform' | 'Error Handler';
  description: string;
  service: string;
  nodeType: string;
  rationale?: string;
}

export interface N8nWorkflow {
  name: string;
  nodes: any[];
  connections: any;
  active: boolean;
  settings: any;
  tags: string[];
}

export interface WorkflowGenerationProgress {
  stage: string;
  message: string;
  progress: number;
}

// Multi-Agent Workflow Generator
export class WorkflowGenerator {
  private onProgress?: (progress: WorkflowGenerationProgress) => void;

  constructor(onProgress?: (progress: WorkflowGenerationProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(stage: string, message: string, progress: number) {
    if (this.onProgress) {
      this.onProgress({ stage, message, progress });
    }
  }

  async generateWorkflow(taskDescription: string): Promise<{
    steps: WorkflowStep[];
    workflow: N8nWorkflow;
  }> {
    // Stage 1: Process Decomposition
    this.updateProgress('decomposition', 'Breaking down your task into micro-steps...', 10);
    const decomposition = await this.decomposeProcess(taskDescription);

    // Stage 2: Technical Mapping
    this.updateProgress('mapping', 'Mapping steps to n8n nodes and services...', 30);
    const technicalMapping = await this.mapToTechnicalNodes(decomposition);

    // Stage 3: Flow Architecture
    this.updateProgress('architecture', 'Building workflow architecture with error handling...', 60);
    const architecture = await this.buildFlowArchitecture(technicalMapping, taskDescription);

    // Stage 4: Optimization
    this.updateProgress('optimization', 'Optimizing workflow for performance...', 80);
    const optimized = await this.optimizeWorkflow(architecture);

    // Stage 5: Generate n8n Workflow
    this.updateProgress('generation', 'Generating n8n workflow file...', 90);
    const workflow = this.generateN8nWorkflow(optimized, taskDescription);

    this.updateProgress('complete', 'Workflow generation complete!', 100);

    return {
      steps: optimized,
      workflow
    };
  }

  // Agent 1: Process Decomposition
  private async decomposeProcess(taskDescription: string): Promise<any> {
    const systemPrompt = `You are a process decomposition expert. Your job is to break down automation tasks into detailed micro-steps.

For each automation task:
1. Identify the trigger (what starts the automation)
2. List ALL data sources needed
3. Break down processing into 5-15 micro-steps
4. Identify all outputs/destinations
5. Note any conditions, loops, or branching logic
6. Consider error cases

Return a JSON object with this structure:
{
  "trigger": {
    "type": "schedule|webhook|event",
    "description": "what triggers this",
    "frequency": "how often"
  },
  "dataSources": [
    {"name": "source name", "type": "type", "purpose": "why needed"}
  ],
  "processingSteps": [
    {"step": 1, "action": "description", "dependencies": []}
  ],
  "outputs": [
    {"name": "output name", "type": "type", "format": "format"}
  ],
  "specialLogic": {
    "conditions": ["IF/THEN statements"],
    "loops": ["iteration needs"],
    "errorHandling": ["error cases to handle"]
  }
}`;

    const response = await claudeAPI.chat(
      `Task to decompose: ${taskDescription}\n\nProvide a detailed breakdown in JSON format.`,
      [],
      systemPrompt
    );

    return this.parseJSONResponse(response);
  }

  // Agent 2: Technical Mapping
  private async mapToTechnicalNodes(decomposition: any): Promise<any> {
    // Get all available node types for context
    const nodeContext = Object.values(n8nNodeLibrary).map(node => ({
      type: node.type,
      name: node.displayName,
      description: node.description,
      uses: node.commonUses
    }));

    const systemPrompt = `You are an n8n automation expert. Map process steps to specific n8n nodes.

Available n8n nodes:
${JSON.stringify(nodeContext, null, 2)}

For each step in the process:
1. Select the BEST n8n node type
2. Specify exact parameters needed
3. Identify required credentials
4. Note data transformations needed
5. Add validation/error handling steps

Return JSON:
{
  "mappedSteps": [
    {
      "step": 1,
      "originalAction": "from decomposition",
      "nodeType": "n8n-nodes-base.xxx",
      "nodeName": "descriptive name",
      "parameters": {},
      "credentials": ["credential types needed"],
      "dataTransformation": "any transformation needed"
    }
  ],
  "additionalNodes": [
    {
      "purpose": "error handling|validation|transformation",
      "nodeType": "n8n-nodes-base.xxx",
      "insertAfter": "step number"
    }
  ]
}`;

    const response = await claudeAPI.chat(
      `Process decomposition:\n${JSON.stringify(decomposition, null, 2)}\n\nMap to n8n nodes.`,
      [],
      systemPrompt
    );

    return this.parseJSONResponse(response);
  }

  // Agent 3: Flow Architecture
  private async buildFlowArchitecture(technicalMapping: any, originalTask: string): Promise<WorkflowStep[]> {
    const systemPrompt = `You are a workflow architecture expert. Design robust, production-ready workflows.

Add these architectural patterns:
1. Error handling branches for each critical node
2. Data validation before external API calls
3. Retry logic with exponential backoff
4. Conditional branching based on data
5. Parallel processing where possible
6. Monitoring and logging nodes
7. Human approval steps if needed

Return a COMPLETE list of workflow steps including:
- Original processing nodes
- Error handlers
- Validators
- Retry logic
- Conditional branches
- Merge points
- Logging/monitoring

JSON format:
{
  "steps": [
    {
      "step": 1,
      "type": "Trigger|Process|Action|Logic|Transform|Error Handler",
      "description": "what this does",
      "service": "service/tool name",
      "nodeType": "n8n-nodes-base.xxx",
      "rationale": "why this is needed",
      "errorHandling": "how errors are handled",
      "parallelizable": true|false
    }
  ]
}`;

    const response = await claudeAPI.chat(
      `Original task: ${originalTask}\n\nTechnical mapping:\n${JSON.stringify(technicalMapping, null, 2)}\n\nDesign complete workflow architecture.`,
      [],
      systemPrompt
    );

    const result = this.parseJSONResponse(response);
    return result.steps || [];
  }

  // Agent 4: Optimization
  private async optimizeWorkflow(steps: WorkflowStep[]): Promise<WorkflowStep[]> {
    const systemPrompt = `You are a workflow optimization expert. Optimize for:
1. Performance (parallel execution where possible)
2. Cost (minimize API calls, batch operations)
3. Reliability (proper error handling)
4. Maintainability (clear structure)

Analyze the workflow and:
- Identify steps that can run in parallel
- Batch similar operations
- Remove redundant steps
- Add caching where beneficial
- Optimize data transformations

Return the optimized workflow in the same JSON format.`;

    const response = await claudeAPI.chat(
      `Workflow to optimize:\n${JSON.stringify(steps, null, 2)}\n\nProvide optimized version.`,
      [],
      systemPrompt
    );

    const result = this.parseJSONResponse(response);
    return result.steps || steps;
  }

  // Generate final n8n workflow JSON
  private generateN8nWorkflow(steps: WorkflowStep[], taskDescription: string): N8nWorkflow {
    const nodes: any[] = [];
    const connections: any = {};
    let xPos = 250;
    let yPos = 300;
    const ySpacing = 200;
    const xSpacing = 400;

    // Track parallel branches
    const parallelGroups: { [key: number]: WorkflowStep[] } = {};
    let currentGroup = 0;

    steps.forEach((step, index) => {
      const nodeId = `node-${index}`;
      const nodeDef = n8nNodeLibrary[step.nodeType];

      // Determine position (handle parallel branches)
      if (step.parallelizable && index > 0) {
        if (!parallelGroups[currentGroup]) {
          parallelGroups[currentGroup] = [];
        }
        parallelGroups[currentGroup].push(step);
        yPos = 300 + parallelGroups[currentGroup].length * ySpacing;
      } else {
        xPos += xSpacing;
        yPos = 300;
        currentGroup++;
      }

      // Create node with proper configuration
      const node: any = {
        parameters: this.generateNodeParameters(step, nodeDef),
        name: step.service || step.description.substring(0, 30),
        type: step.nodeType,
        typeVersion: nodeDef?.version || 1,
        position: [xPos, yPos],
        id: nodeId
      };

      // Add credentials if needed
      if (nodeDef?.credentials && nodeDef.credentials.length > 0) {
        node.credentials = {};
        nodeDef.credentials.forEach(cred => {
          node.credentials[cred.name] = {
            id: '{{CREDENTIAL_ID}}',
            name: `${step.service} credentials`
          };
        });
      }

      nodes.push(node);

      // Create connections
      if (index > 0) {
        const previousNode = nodes[index - 1];
        const previousNodeName = previousNode.name;

        // Handle different output types
        if (step.type === 'Error Handler') {
          // Connect to error output if available
          if (!connections[previousNodeName]) {
            connections[previousNodeName] = {};
          }
          connections[previousNodeName].error = [[{ node: node.name, type: 'main', index: 0 }]];
        } else {
          // Regular connection
          if (!connections[previousNodeName]) {
            connections[previousNodeName] = {};
          }
          if (!connections[previousNodeName].main) {
            connections[previousNodeName].main = [[]];
          }
          connections[previousNodeName].main[0].push({ node: node.name, type: 'main', index: 0 });
        }
      }
    });

    return {
      name: `Automation: ${taskDescription.substring(0, 50)}`,
      nodes,
      connections,
      active: false,
      settings: {
        executionOrder: 'v1',
        saveExecutionProgress: true,
        saveManualExecutions: true
      },
      tags: ['vibe-coder-console', 'automated', 'ai-generated']
    };
  }

  // Generate node parameters based on node definition and step info
  private generateNodeParameters(step: WorkflowStep, nodeDef?: N8nNodeDefinition): any {
    if (!nodeDef) {
      return {};
    }

    // Start with example parameters if available
    const params: any = nodeDef.exampleParameters || {};

    // Customize based on step description
    if (step.description.toLowerCase().includes('email')) {
      if (nodeDef.type === 'n8n-nodes-base.gmail') {
        params.resource = 'message';
        params.operation = 'send';
        params.subject = '={{ $json.subject || "Automated Report" }}';
        params.message = '={{ $json.content }}';
      }
    }

    if (step.description.toLowerCase().includes('slack')) {
      if (nodeDef.type === 'n8n-nodes-base.slack') {
        params.resource = 'message';
        params.operation = 'post';
        params.text = '={{ $json.message }}';
      }
    }

    if (step.description.toLowerCase().includes('summarize') || step.description.toLowerCase().includes('analyze')) {
      if (nodeDef.type === 'n8n-nodes-base.openAi') {
        params.resource = 'text';
        params.operation = 'message';
        params.model = 'gpt-4';
        params.prompt = '={{ $json.inputText }}';
      }
    }

    if (step.description.toLowerCase().includes('filter')) {
      if (nodeDef.type === 'n8n-nodes-base.filter') {
        params.conditions = {
          string: [{
            value1: '={{ $json.status }}',
            operation: 'equals',
            value2: 'active'
          }]
        };
      }
    }

    if (step.description.toLowerCase().includes('if') || step.description.toLowerCase().includes('condition')) {
      if (nodeDef.type === 'n8n-nodes-base.if') {
        params.conditions = {
          boolean: [{
            value1: '={{ $json.condition }}',
            value2: true
          }]
        };
      }
    }

    return params;
  }

  // Parse JSON from AI response (handles markdown code blocks)
  private parseJSONResponse(response: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      // Try direct parse
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      // Return fallback structure
      return {
        steps: [
          {
            step: 1,
            type: 'Trigger',
            description: 'Start automation',
            service: 'Schedule',
            nodeType: 'n8n-nodes-base.cron'
          }
        ]
      };
    }
  }
}
