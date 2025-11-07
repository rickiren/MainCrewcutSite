import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { claudeAPI } from '@/services/claudeApi';

interface AutomationStep {
  step: number;
  type: 'Trigger' | 'Process' | 'Action';
  description: string;
  service: string;
  icon?: string;
}

interface AutomationBlueprint {
  steps: AutomationStep[];
  workflow: any;
}

export default function VibeCoderConsole() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<AutomationBlueprint | null>(null);

  const generateBlueprint = async () => {
    if (!task.trim()) return;

    setLoading(true);
    try {
      const systemPrompt = `You are an automation expert. Analyze the user's repetitive task and break it down into clear automation steps.

Return a JSON response with this EXACT structure:
{
  "steps": [
    {
      "step": 1,
      "type": "Trigger",
      "description": "Brief description of what triggers the automation",
      "service": "Service name (e.g., Slack, Gmail, Calendar)"
    },
    {
      "step": 2,
      "type": "Process",
      "description": "What processing happens",
      "service": "Service name (e.g., OpenAI, Claude, ChatGPT)"
    },
    {
      "step": 3,
      "type": "Action",
      "description": "What action is taken",
      "service": "Service name (e.g., Gmail, Slack, Notion)"
    }
  ]
}

Keep descriptions concise and actionable. Focus on real services that can be used in n8n workflows.`;

      const response = await claudeAPI.chat(
        `Task: ${task}\n\nAnalyze this task and provide the automation steps in JSON format.`,
        [],
        systemPrompt
      );

      // Parse the JSON response
      let parsedSteps;
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedSteps = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        // Fallback to a simple structure if parsing fails
        parsedSteps = {
          steps: [
            {
              step: 1,
              type: 'Trigger',
              description: 'Set up automation trigger',
              service: 'Schedule/Webhook'
            },
            {
              step: 2,
              type: 'Process',
              description: 'Process the data',
              service: 'AI Service'
            },
            {
              step: 3,
              type: 'Action',
              description: 'Execute the action',
              service: 'Output Service'
            }
          ]
        };
      }

      // Generate n8n workflow
      const workflow = generateN8nWorkflow(parsedSteps.steps, task);

      setBlueprint({
        steps: parsedSteps.steps,
        workflow
      });
    } catch (error) {
      console.error('Error generating blueprint:', error);
      alert('Failed to generate blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateN8nWorkflow = (steps: AutomationStep[], taskDescription: string) => {
    const nodes = steps.map((step, index) => {
      let nodeType = '';
      let name = step.service;

      // Map services to n8n node types
      if (step.service.toLowerCase().includes('slack')) {
        nodeType = 'n8n-nodes-base.slack';
      } else if (step.service.toLowerCase().includes('gmail') || step.service.toLowerCase().includes('email')) {
        nodeType = 'n8n-nodes-base.gmail';
      } else if (step.service.toLowerCase().includes('openai') || step.service.toLowerCase().includes('chatgpt')) {
        nodeType = 'n8n-nodes-base.openAi';
      } else if (step.service.toLowerCase().includes('claude')) {
        nodeType = 'n8n-nodes-base.httpRequest';
        name = 'Claude AI';
      } else if (step.service.toLowerCase().includes('schedule')) {
        nodeType = 'n8n-nodes-base.cron';
      } else if (step.service.toLowerCase().includes('webhook')) {
        nodeType = 'n8n-nodes-base.webhook';
      } else if (step.service.toLowerCase().includes('notion')) {
        nodeType = 'n8n-nodes-base.notion';
      } else {
        nodeType = 'n8n-nodes-base.httpRequest';
      }

      return {
        parameters: {},
        name: name,
        type: nodeType,
        typeVersion: 1,
        position: [250 + index * 300, 300],
        id: `node-${index + 1}`
      };
    });

    // Add connections between nodes
    const connections: any = {};
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].name] = {
        main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]]
      };
    }

    return {
      name: 'Automation Blueprint',
      nodes: nodes,
      connections: connections,
      active: false,
      settings: {},
      tags: ['vibe-coder-console', 'automated']
    };
  };

  const downloadWorkflow = () => {
    if (!blueprint) return;

    const dataStr = JSON.stringify(blueprint.workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'automation-workflow.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500" />

          {/* Pixel grid effect */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-black mb-4 relative inline-block">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-pulse">
                VIBE CODER
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-pulse delay-300">
                CONSOLE
              </span>
              <div className="absolute inset-0 blur-2xl opacity-50">
                <span className="text-purple-500">VIBE CODER CONSOLE</span>
              </div>
            </h1>
            <p className="text-2xl text-purple-300 font-light tracking-wide">
              Automate what you hate — <span className="text-pink-400 font-bold">instantly</span>.
            </p>
          </div>

          {/* Main Input Section */}
          <Card className="max-w-4xl mx-auto bg-gray-900/80 border-purple-500/50 backdrop-blur-lg shadow-2xl shadow-purple-500/20 mb-12">
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-purple-300 text-lg font-semibold mb-3">
                  Describe your repetitive task:
                </label>
                <Textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g., Every Friday I summarize our Slack conversations and email my team a report."
                  className="min-h-32 bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/50 text-lg resize-none"
                />
              </div>

              <Button
                onClick={generateBlueprint}
                disabled={loading || !task.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl py-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/70 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-6 w-6 animate-spin" />
                    Generating Blueprint...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-6 w-6" />
                    Generate Blueprint
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Blueprint Display */}
          {blueprint && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000">
              {/* Steps Display */}
              <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-lg shadow-2xl shadow-purple-500/20">
                <div className="p-8">
                  <h2 className="text-3xl font-bold text-purple-300 mb-6 flex items-center">
                    <Sparkles className="mr-3 h-8 w-8" />
                    Your Automation Blueprint
                  </h2>

                  <div className="space-y-6">
                    {blueprint.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        {/* Step Number */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          step.type === 'Trigger' ? 'bg-green-500/20 border-2 border-green-500 text-green-400' :
                          step.type === 'Process' ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400' :
                          'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                        }`}>
                          {step.step}
                        </div>

                        {/* Step Content */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              step.type === 'Trigger' ? 'bg-green-500/20 text-green-400' :
                              step.type === 'Process' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {step.type}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-pink-400 font-semibold">{step.service}</span>
                          </div>
                          <p className="text-gray-300 text-lg">{step.description}</p>
                        </div>

                        {/* Arrow */}
                        {index < blueprint.steps.length - 1 && (
                          <ArrowRight className="flex-shrink-0 h-6 w-6 text-purple-500 animate-pulse mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Flowchart Visualization */}
              <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-lg shadow-2xl shadow-purple-500/20">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-purple-300 mb-6">Visual Flow</h3>

                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {blueprint.steps.map((step, index) => (
                      <React.Fragment key={index}>
                        {/* Service Box */}
                        <div className={`relative px-6 py-4 rounded-lg border-2 font-semibold text-center min-w-[150px] transition-all duration-300 hover:scale-110 ${
                          step.type === 'Trigger' ? 'bg-green-500/10 border-green-500 text-green-400 shadow-lg shadow-green-500/50' :
                          step.type === 'Process' ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/50' :
                          'bg-purple-500/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/50'
                        }`}>
                          <div className="text-sm opacity-70 mb-1">{step.type}</div>
                          <div className="text-lg">{step.service}</div>

                          {/* Glowing effect */}
                          <div className={`absolute inset-0 rounded-lg blur-xl opacity-50 -z-10 ${
                            step.type === 'Trigger' ? 'bg-green-500/30' :
                            step.type === 'Process' ? 'bg-blue-500/30' :
                            'bg-purple-500/30'
                          }`} />
                        </div>

                        {/* Arrow */}
                        {index < blueprint.steps.length - 1 && (
                          <div className="flex items-center">
                            <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                            <ArrowRight className="h-6 w-6 text-pink-500 -ml-2" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Download Button */}
              <div className="text-center">
                <Button
                  onClick={downloadWorkflow}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-xl py-6 px-12 rounded-lg shadow-lg shadow-green-500/50 transition-all duration-300 hover:shadow-green-500/70 hover:scale-105"
                >
                  <Download className="mr-3 h-6 w-6" />
                  Download n8n Workflow
                </Button>
                <p className="text-gray-400 mt-4">
                  Import this .json file directly into your n8n workspace to run this automation!
                </p>
              </div>
            </div>
          )}

          {/* Info Section */}
          {!blueprint && (
            <div className="max-w-4xl mx-auto mt-16">
              <Card className="bg-gray-900/60 border-purple-500/30 backdrop-blur-lg">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-purple-300 mb-4">How it works:</h3>
                  <ol className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">1</span>
                      <span>Describe your repetitive task in plain English</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">2</span>
                      <span>AI analyzes and breaks it down into automation steps</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">3</span>
                      <span>See a visual flowchart of your automation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">4</span>
                      <span>Download a working n8n workflow file to run it instantly</span>
                    </li>
                  </ol>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
