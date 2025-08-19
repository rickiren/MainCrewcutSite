import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  MessageSquare, 
  Send, 
  Settings, 
  BarChart3, 
  FileText, 
  Inbox, 
  Play, 
  Pause,
  Clock,
  User,
  Building,
  Link as LinkIcon,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface HealthStatus {
  url: string;
  ip: string;
  userAgent: string;
  captcha: boolean;
  paused: boolean;
  lastCheck: string;
}

interface Budget {
  type: 'COMMENTS' | 'CONNECTS' | 'DMS' | 'REPLIES' | 'LIKES';
  used: number;
  limit: number;
}

interface ActivityItem {
  id: string;
  type: 'comment' | 'dm' | 'reply' | 'like' | 'connect';
  summary: string;
  timestamp: string;
  link?: string;
  status: 'success' | 'pending' | 'failed';
}

interface Post {
  id: string;
  niche: string;
  author: string;
  company: string;
  likes: number;
  comments: number;
  age: string;
  score: number;
  postLink: string;
  content: string;
}

interface QueueItem {
  id: string;
  niche: string;
  runAfter: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  refLink: string;
  payload: string;
  kind: 'COMMENT' | 'DM' | 'REPLY';
}

interface Draft {
  id: string;
  created: string;
  niche?: string;
  author?: string;
  company?: string;
  content: string;
  postLink?: string;
  sourcePost?: string;
  sender?: string;
  threadLink?: string;
  intent?: string;
  confidence?: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPaused, setIsPaused] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [currentTz, setCurrentTz] = useState('UTC');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      // Fetch health status
      const healthResponse = await apiClient.getHealth();
      if (healthResponse.data) {
        setHealthStatus(healthResponse.data);
        setIsPaused(healthResponse.data.paused || false);
      }

      // Fetch counters/budgets
      const countersResponse = await apiClient.getCounters();
      if (countersResponse.data) {
        // Transform counters data to budget format
        const budgetData = Object.entries(countersResponse.data).map(([type, data]: [string, any]) => ({
          type: type.toUpperCase() as Budget['type'],
          used: data.used || 0,
          limit: data.limit || 100
        }));
        setBudgets(budgetData);
      }

      // Fetch posts
      const postsResponse = await apiClient.getPosts({ since: '48h' });
      if (postsResponse.data) {
        setPosts(postsResponse.data);
      }

      // Fetch queue
      const queueResponse = await apiClient.getQueue();
      if (queueResponse.data) {
        setQueue(queueResponse.data);
      }

      // Fetch drafts
      const [commentsResponse, outreachResponse, repliesResponse] = await Promise.all([
        apiClient.getDraftComments(),
        apiClient.getDraftOutreach(),
        apiClient.getDraftReplies()
      ]);

      const allDrafts: Draft[] = [];
      if (commentsResponse.data) allDrafts.push(...commentsResponse.data);
      if (outreachResponse.data) allDrafts.push(...outreachResponse.data);
      if (repliesResponse.data) allDrafts.push(...repliesResponse.data);
      
      setDrafts(allDrafts);

      // Generate activity feed from recent actions
      if (queueResponse.data) {
        const recentActivities: ActivityItem[] = queueResponse.data
          .filter((item: any) => item.status === 'completed')
          .slice(0, 25)
          .map((item: any, index: number) => ({
            id: item.id || `activity-${index}`,
            type: item.kind?.toLowerCase() as ActivityItem['type'] || 'comment',
            summary: `${item.kind} on ${item.niche} post`,
            timestamp: item.completedAt || new Date().toISOString(),
            status: item.status === 'completed' ? 'success' : 'pending'
          }));
        setActivities(recentActivities);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch dashboard data. Please check your connection.');
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const togglePause = async () => {
    try {
      if (isPaused) {
        const response = await apiClient.resume();
        if (response.status === 200) {
          setIsPaused(false);
          toast({
            title: "Resumed",
            description: "LinkedIn Agent has been resumed successfully.",
          });
        }
      } else {
        const response = await apiClient.pause();
        if (response.status === 200) {
          setIsPaused(true);
          toast({
            title: "Paused",
            description: "LinkedIn Agent has been paused successfully.",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      toast({
        title: "Error",
        description: "Failed to toggle pause/resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyDraft = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Draft content copied to clipboard.",
    });
  };

  const clearDrafts = async (kind?: string) => {
    try {
      const response = await apiClient.clearDrafts(kind);
      if (response.status === 200) {
        setDrafts([]);
        toast({
          title: "Cleared",
          description: `All ${kind || 'drafts'} have been cleared successfully.`,
        });
      }
    } catch (error) {
      console.error('Error clearing drafts:', error);
      toast({
        title: "Error",
        description: "Failed to clear drafts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateDraft = async (postId: string, type: 'comment' | 'dm') => {
    try {
      // This would call your draft generation API
      toast({
        title: "Generating...",
        description: `Generating ${type} draft for this post.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate ${type} draft. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'dm': return <Send className="w-4 h-4" />;
      case 'reply': return <MessageSquare className="w-4 h-4" />;
      case 'like': return <BarChart3 className="w-4 h-4" />;
      case 'connect': return <User className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchInitialData} className="mr-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">ENGAGE ENGINE Dashboard</h1>
            <Badge variant={healthStatus?.captcha ? "destructive" : "secondary"}>
              {healthStatus?.captcha ? "Captcha Detected" : "Logged In"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch checked={isPaused} onCheckedChange={togglePause} />
              <span className="text-sm text-gray-600">
                {isPaused ? 'Paused' : 'Running'}
              </span>
            </div>
            
            <Button
              variant={isPaused ? "default" : "outline"}
              size="sm"
              onClick={togglePause}
              disabled={refreshing}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Badge variant={dryRun ? "secondary" : "default"}>
              {dryRun ? "DRY RUN" : "LIVE"}
            </Badge>
            
            <Badge variant="outline">
              {currentTz}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchInitialData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Navigation */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'posts', label: 'Posts', icon: FileText },
              { id: 'queue', label: 'Queue', icon: Clock },
              { id: 'drafts', label: 'Drafts', icon: MessageSquare },
              { id: 'inbox', label: 'Inbox', icon: Inbox },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'logs', label: 'Logs', icon: FileText }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              
              {/* Today's Budgets */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Budgets</CardTitle>
                  <CardDescription>Usage across different engagement types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgets.length > 0 ? (
                    budgets.map((budget) => (
                      <div key={budget.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{budget.type}</span>
                          <span className="text-gray-500">
                            {budget.used} / {budget.limit}
                          </span>
                        </div>
                        <Progress value={(budget.used / budget.limit) * 100} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No budget data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Last health check information</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthStatus ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">URL:</span> {healthStatus.url}
                      </div>
                      <div>
                        <span className="font-medium">IP:</span> {healthStatus.ip}
                      </div>
                      <div>
                        <span className="font-medium">User Agent:</span> {healthStatus.userAgent}
                      </div>
                      <div>
                        <span className="font-medium">Captcha:</span> {healthStatus.captcha ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Paused:</span> {healthStatus.paused ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Last Check:</span> {new Date(healthStatus.lastCheck).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No health status available</p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>Recent actions and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.summary}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {getStatusIcon(activity.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
                <div className="flex space-x-4">
                  <Input placeholder="Search posts..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Niche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  {posts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Niche</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Likes</TableHead>
                          <TableHead>Comments</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <Badge variant="outline">{post.niche}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{post.author}</TableCell>
                            <TableCell>{post.company}</TableCell>
                            <TableCell>{post.likes}</TableCell>
                            <TableCell>{post.comments}</TableCell>
                            <TableCell>{post.age}</TableCell>
                            <TableCell>{post.score}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => generateDraft(post.id, 'comment')}
                                >
                                  Generate Comment
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => generateDraft(post.id, 'dm')}
                                >
                                  Generate DM
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No posts found</p>
                      <p className="text-sm">Posts will appear here as they are discovered</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Queue</h2>
              
              <Tabs defaultValue="COMMENT" className="w-full">
                <TabsList>
                  <TabsTrigger value="COMMENT">Comments</TabsTrigger>
                  <TabsTrigger value="DM">DMs</TabsTrigger>
                  <TabsTrigger value="REPLY">Replies</TabsTrigger>
                </TabsList>
                
                <TabsContent value="COMMENT" className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      {queue.filter(item => item.kind === 'COMMENT').length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Niche</TableHead>
                              <TableHead>Run After</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Reference</TableHead>
                              <TableHead>Payload</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {queue.filter(item => item.kind === 'COMMENT').map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Badge variant="outline">{item.niche}</Badge>
                                </TableCell>
                                <TableCell>{item.runAfter}</TableCell>
                                <TableCell>
                                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <a href={item.refLink} className="text-purple-600 hover:underline">
                                    <LinkIcon className="w-4 h-4 inline mr-1" />
                                    View
                                  </a>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{item.payload}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No comment tasks in queue</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="DM" className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      {queue.filter(item => item.kind === 'DM').length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Niche</TableHead>
                              <TableHead>Run After</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Reference</TableHead>
                              <TableHead>Payload</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {queue.filter(item => item.kind === 'DM').map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Badge variant="outline">{item.niche}</Badge>
                                </TableCell>
                                <TableCell>{item.runAfter}</TableCell>
                                <TableCell>
                                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <a href={item.refLink} className="text-purple-600 hover:underline">
                                    <LinkIcon className="w-4 h-4 inline mr-1" />
                                    View
                                  </a>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{item.payload}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No DM tasks in queue</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="REPLY" className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      {queue.filter(item => item.kind === 'REPLY').length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Niche</TableHead>
                              <TableHead>Run After</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Reference</TableHead>
                              <TableHead>Payload</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {queue.filter(item => item.kind === 'REPLY').map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Badge variant="outline">{item.niche}</Badge>
                                </TableCell>
                                <TableCell>{item.runAfter}</TableCell>
                                <TableCell>
                                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <a href={item.refLink} className="text-purple-600 hover:underline">
                                    <LinkIcon className="w-4 h-4 inline mr-1" />
                                    View
                                  </a>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{item.payload}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No reply tasks in queue</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Drafts Tab */}
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Drafts</h2>
                <Button onClick={() => clearDrafts()} variant="outline">
                  Clear All Drafts
                </Button>
              </div>
              
              <Tabs defaultValue="comments" className="w-full">
                <TabsList>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="outreach">Outreach</TabsTrigger>
                  <TabsTrigger value="replies">Replies</TabsTrigger>
                </TabsList>
                
                <TabsContent value="comments" className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      {drafts.filter(draft => draft.niche && draft.author).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Created</TableHead>
                              <TableHead>Niche</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Draft</TableHead>
                              <TableHead>Post Link</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {drafts.filter(draft => draft.niche && draft.author).map((draft) => (
                              <TableRow key={draft.id}>
                                <TableCell>{new Date(draft.created).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{draft.niche}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{draft.author}</TableCell>
                                <TableCell className="max-w-xs truncate">{draft.content}</TableCell>
                                <TableCell>
                                  <a href={draft.postLink} className="text-purple-600 hover:underline">
                                    <LinkIcon className="w-4 h-4 inline mr-1" />
                                    View
                                  </a>
                                </TableCell>
                                <TableCell>
                                  <Button size="sm" variant="outline" onClick={() => copyDraft(draft.content)}>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No comment drafts available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="outreach" className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      {drafts.filter(draft => draft.company && draft.sourcePost).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Created</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Draft</TableHead>
                              <TableHead>Source Post</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {drafts.filter(draft => draft.company && draft.sourcePost).map((draft) => (
                              <TableRow key={draft.id}>
                                <TableCell>{new Date(draft.created).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{draft.author}</TableCell>
                                <TableCell>{draft.company}</TableCell>
                                <TableCell className="max-w-xs truncate">{draft.content}</TableCell>
                                <TableCell className="max-w-xs truncate">{draft.sourcePost}</TableCell>
                                <TableCell>
                                  <Button size="sm" variant="outline" onClick={() => copyDraft(draft.content)}>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No outreach drafts available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="replies" className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      {drafts.filter(draft => draft.sender && draft.threadLink).length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Created</TableHead>
                              <TableHead>Sender</TableHead>
                              <TableHead>Thread Link</TableHead>
                              <TableHead>Intent</TableHead>
                              <TableHead>Confidence</TableHead>
                              <TableHead>Draft</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {drafts.filter(draft => draft.sender && draft.threadLink).map((draft) => (
                              <TableRow key={draft.id}>
                                <TableCell>{new Date(draft.created).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">{draft.sender}</TableCell>
                                <TableCell>
                                  <a href={draft.threadLink} className="text-purple-600 hover:underline">
                                    <LinkIcon className="w-4 h-4 inline mr-1" />
                                    View
                                  </a>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{draft.intent || 'General'}</Badge>
                                </TableCell>
                                <TableCell>{draft.confidence || 'N/A'}%</TableCell>
                                <TableCell className="max-w-xs truncate">{draft.content}</TableCell>
                                <TableCell>
                                  <Button size="sm" variant="outline" onClick={() => copyDraft(draft.content)}>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No reply drafts available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Inbox</h2>
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No unread threads at the moment</p>
                  <p className="text-sm">New messages will appear here</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Niche Configuration</CardTitle>
                  <CardDescription>Manage your target niches and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active Niches
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['AI', 'Automation', 'Tech', 'SaaS'].map((niche) => (
                        <Badge key={niche} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                          {niche}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button>Save & Reload</Button>
                    <Button variant="outline">Export Config</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Logs</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Last 200 log entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-2 bg-gray-50 rounded text-sm font-mono">
                        <span className="text-gray-500">[{new Date(Date.now() - i * 60000).toLocaleTimeString()}]</span>
                        <Badge variant="outline">INFO</Badge>
                        <span>Processing post from John Doe in AI niche</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
