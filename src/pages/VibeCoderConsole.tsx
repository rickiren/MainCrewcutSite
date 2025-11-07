import React, { useState, useCallback, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, Sparkles, Zap, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { WorkflowGenerator, WorkflowStep, WorkflowGenerationProgress } from '@/services/workflowGenerator';

interface AutomationBlueprint {
  steps: WorkflowStep[];
  workflow: any;
}

export default function VibeCoderConsole() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<AutomationBlueprint | null>(null);
  const [progress, setProgress] = useState<WorkflowGenerationProgress | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateBlueprint = async () => {
    if (!task.trim()) return;

    setLoading(true);
    setBlueprint(null);
    setProgress(null);

    try {
      const generator = new WorkflowGenerator((progressUpdate) => {
        setProgress(progressUpdate);
      });

      const result = await generator.generateWorkflow(task);

      setBlueprint({
        steps: result.steps,
        workflow: result.workflow
      });
    } catch (error) {
      console.error('Error generating blueprint:', error);
      alert('Failed to generate blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTask(e.target.value);
  }, []);

  const downloadWorkflow = useCallback(() => {
    if (!blueprint) return;

    const dataStr = JSON.stringify(blueprint.workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'automation-workflow.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [blueprint]);

  const getStageInfo = useCallback((stage: string) => {
    const stages: { [key: string]: { icon: string; color: string } } = {
      decomposition: { icon: '🧩', color: 'text-blue-400' },
      mapping: { icon: '🗺️', color: 'text-green-400' },
      architecture: { icon: '🏗️', color: 'text-purple-400' },
      optimization: { icon: '⚡', color: 'text-yellow-400' },
      generation: { icon: '🎯', color: 'text-pink-400' },
      complete: { icon: '✅', color: 'text-green-400' }
    };
    return stages[stage] || { icon: '⏳', color: 'text-gray-400' };
  }, []);

  const getTypeColor = useCallback((type: string) => {
    const colors: { [key: string]: string } = {
      'Trigger': 'bg-green-500/20 border-green-500 text-green-400',
      'Process': 'bg-blue-500/20 border-blue-500 text-blue-400',
      'Action': 'bg-purple-500/20 border-purple-500 text-purple-400',
      'Logic': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
      'Transform': 'bg-pink-500/20 border-pink-500 text-pink-400',
      'Error Handler': 'bg-red-500/20 border-red-500 text-red-400'
    };
    return colors[type] || 'bg-gray-500/20 border-gray-500 text-gray-400';
  }, []);

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
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                VIBE CODER
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                CONSOLE
              </span>
              <div className="absolute inset-0 blur-2xl opacity-30 pointer-events-none -z-10">
                <span className="text-purple-500">VIBE CODER CONSOLE</span>
              </div>
            </h1>
            <p className="text-2xl text-purple-300 font-light tracking-wide">
              Automate what you hate — <span className="text-pink-400 font-bold">instantly</span>.
            </p>
            <p className="text-lg text-gray-400 mt-2">
              Powered by Multi-Agent AI • Generates 50-100+ node workflows
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
                  ref={textareaRef}
                  value={task}
                  onChange={handleTaskChange}
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
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Generating...
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

          {/* Progress Indicator */}
          {loading && progress && (
            <div className="max-w-4xl mx-auto mb-12 animate-in fade-in duration-500">
              <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-lg shadow-2xl shadow-purple-500/20">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getStageInfo(progress.stage).icon}</span>
                      <div>
                        <h3 className={`text-xl font-bold ${getStageInfo(progress.stage).color}`}>
                          {progress.stage.charAt(0).toUpperCase() + progress.stage.slice(1)} Stage
                        </h3>
                        <p className="text-gray-400">{progress.message}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-400">{progress.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>

                  {/* Stage Checklist */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['decomposition', 'mapping', 'architecture', 'optimization', 'generation', 'complete'].map((stage) => (
                      <div
                        key={stage}
                        className={`flex items-center gap-2 text-sm ${
                          progress.progress >= (['decomposition', 'mapping', 'architecture', 'optimization', 'generation', 'complete'].indexOf(stage) / 5) * 100
                            ? 'text-green-400'
                            : 'text-gray-600'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="capitalize">{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Blueprint Display */}
          {blueprint && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">{blueprint.steps.length}</div>
                  <div className="text-gray-400 text-sm">Total Nodes</div>
                </Card>
                <Card className="bg-gray-900/80 border-blue-500/50 backdrop-blur-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {blueprint.steps.filter(s => s.type === 'Error Handler').length}
                  </div>
                  <div className="text-gray-400 text-sm">Error Handlers</div>
                </Card>
                <Card className="bg-gray-900/80 border-green-500/50 backdrop-blur-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {blueprint.steps.filter(s => s.type === 'Logic').length}
                  </div>
                  <div className="text-gray-400 text-sm">Logic Nodes</div>
                </Card>
                <Card className="bg-gray-900/80 border-pink-500/50 backdrop-blur-lg p-4 text-center">
                  <div className="text-3xl font-bold text-pink-400">
                    {new Set(blueprint.steps.map(s => s.service)).size}
                  </div>
                  <div className="text-gray-400 text-sm">Services Used</div>
                </Card>
              </div>

              {/* Steps Display */}
              <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-lg shadow-2xl shadow-purple-500/20">
                <div className="p-8">
                  <h2 className="text-3xl font-bold text-purple-300 mb-6 flex items-center">
                    <Sparkles className="mr-3 h-8 w-8" />
                    Your Production-Ready Automation Blueprint
                  </h2>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                    {blueprint.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4 group hover:bg-purple-500/5 p-3 rounded-lg transition-all">
                        {/* Step Number */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getTypeColor(step.type)}`}>
                          {step.step}
                        </div>

                        {/* Step Content */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(step.type)}`}>
                              {step.type}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-pink-400 font-semibold">{step.service}</span>
                            <span className="text-xs text-gray-600 font-mono">{step.nodeType}</span>
                          </div>
                          <p className="text-gray-300">{step.description}</p>
                          {step.rationale && (
                            <p className="text-xs text-gray-500 mt-1 italic">💡 {step.rationale}</p>
                          )}
                        </div>

                        {/* Arrow */}
                        {index < blueprint.steps.length - 1 && (
                          <ArrowRight className="flex-shrink-0 h-5 w-5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Visual Flowchart - Compact Grid View */}
              <Card className="bg-gray-900/80 border-purple-500/50 backdrop-blur-lg shadow-2xl shadow-purple-500/20">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-purple-300 mb-6">Visual Flow (First 12 Nodes)</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {blueprint.steps.slice(0, 12).map((step, index) => (
                      <div
                        key={index}
                        className={`relative px-4 py-3 rounded-lg border-2 font-semibold text-center transition-all duration-300 hover:scale-105 ${getTypeColor(step.type)}`}
                      >
                        <div className="text-xs opacity-70 mb-1">{step.type}</div>
                        <div className="text-sm truncate">{step.service}</div>
                        <div className="text-xs opacity-50 mt-1">#{step.step}</div>

                        {/* Glowing effect */}
                        <div className={`absolute inset-0 rounded-lg blur-xl opacity-30 -z-10 ${
                          step.type === 'Trigger' ? 'bg-green-500/30' :
                          step.type === 'Process' ? 'bg-blue-500/30' :
                          step.type === 'Logic' ? 'bg-yellow-500/30' :
                          'bg-purple-500/30'
                        }`} />
                      </div>
                    ))}
                    {blueprint.steps.length > 12 && (
                      <div className="px-4 py-3 rounded-lg border-2 border-dashed border-gray-600 text-gray-400 text-center flex items-center justify-center">
                        +{blueprint.steps.length - 12} more nodes
                      </div>
                    )}
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
                  Download n8n Workflow ({blueprint.steps.length} nodes)
                </Button>
                <p className="text-gray-400 mt-4">
                  Import this .json file directly into your n8n workspace to run this automation!
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  ⚠️ Remember to configure credentials for each service in n8n
                </p>
              </div>
            </div>
          )}

          {/* Info Section */}
          {!blueprint && !loading && (
            <div className="max-w-4xl mx-auto mt-16">
              <Card className="bg-gray-900/60 border-purple-500/30 backdrop-blur-lg">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-purple-300 mb-4">🚀 Powered by Multi-Agent AI:</h3>
                  <ol className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">1</span>
                      <span><strong>Process Decomposition</strong> - AI breaks your task into 10-50 micro-steps</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">2</span>
                      <span><strong>Technical Mapping</strong> - Maps each step to real n8n nodes with proper parameters</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">3</span>
                      <span><strong>Flow Architecture</strong> - Adds error handling, validation, retries, and conditional logic</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">4</span>
                      <span><strong>Optimization</strong> - Parallelizes operations, batches API calls, optimizes performance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-purple-400">5</span>
                      <span><strong>Generation</strong> - Creates production-ready n8n workflow with 50-100+ nodes</span>
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
