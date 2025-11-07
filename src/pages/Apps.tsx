import { ArrowLeft, ExternalLink, Github, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { apps, type App } from '@/data/apps';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppIframeModal from '@/components/AppIframeModal';

const Apps = () => {
  const [filteredApps, setFilteredApps] = useState<App[]>(apps);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [iframeModalOpen, setIframeModalOpen] = useState(false);
  const [selectedExternalApp, setSelectedExternalApp] = useState<App | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter apps based on search term and category
  useEffect(() => {
    let filtered = apps;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredApps(filtered);
  }, [searchTerm, selectedCategory]);

  const categories = ['all', ...Array.from(new Set(apps.map(app => app.category)))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const handleTryDemo = (app: App) => {
    if (app.isExternal && app.externalUrl) {
      setSelectedExternalApp(app);
      setIframeModalOpen(true);
    }
  };

  const hasDemo = (app: App) => {
    return app.isExternal && app.externalUrl || 
           app.id === 'writing-editor' || 
           app.id === 'ai-logistics-optimizer-2';
  };

  return (
    <PageLayout>
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                See Our Apps
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover what we're building for others — AI solutions that replace manual work, reduce overhead, and deliver results.
              </p>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <div className="relative max-w-md w-full">
                <Input
                  type="text"
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Results Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mb-8"
            >
              <p className="text-gray-600">
                Showing {filteredApps.length + 1} of {apps.length + 1} apps
              </p>
            </motion.div>

            {/* Apps Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Video Generator Card */}
              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 group flex flex-col">
                  <CardHeader className="pb-3">
                    {/* Dashboard Preview */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">AI Video Generator</h3>
                          <p className="text-xs text-gray-600">Professional video creation suite</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-700">LIVE</span>
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Videos</p>
                          <p className="text-lg font-bold text-blue-600">1.2K+</p>
                          <p className="text-xs text-green-600">+24%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Formats</p>
                          <p className="text-lg font-bold text-purple-600">5</p>
                          <p className="text-xs text-gray-500">Export types</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Render</p>
                          <p className="text-lg font-bold text-orange-600">2.3s</p>
                          <p className="text-xs text-gray-500">Avg speed</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Quality</p>
                          <p className="text-lg font-bold text-green-600">4K</p>
                          <p className="text-xs text-gray-500">HD Ready</p>
                        </div>
                      </div>

                      {/* Video Preview Panels */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
                          <div className="text-center text-white">
                            <div className="text-2xl font-bold mb-1" style={{
                              textShadow: '0 0 20px rgba(255,255,255,0.8)',
                            }}>Neon Text</div>
                            <div className="text-xs opacity-80">Glow Effect</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
                          <div className="text-center text-white">
                            <div className="text-2xl font-bold mb-1" style={{
                              textShadow: '0 0 20px rgba(255,255,255,0.8)',
                            }}>3D Motion</div>
                            <div className="text-xs opacity-80">Camera Anim</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardTitle className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                      AI Video Generator
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Create stunning animated videos with neon glow effects, 3D camera movements, and glassmorphic UI scenes. Perfect for product demos, social media content, and marketing videos.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-3 flex-1">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">Neon Glow Text</Badge>
                        <Badge variant="secondary" className="text-xs">3D Camera Motion</Badge>
                        <Badge variant="secondary" className="text-xs">Glassmorphic UI</Badge>
                        <Badge variant="outline" className="text-xs">+5 more</Badge>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">React</Badge>
                        <Badge variant="outline" className="text-xs">Remotion</Badge>
                        <Badge variant="outline" className="text-xs">TypeScript</Badge>
                        <Badge variant="outline" className="text-xs">+1 more</Badge>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 mt-auto">
                    <div className="w-full flex gap-2">
                      <Button asChild className="flex-1" size="sm">
                        <Link to="/video-generator">
                          <Play className="h-4 w-4 mr-2" />
                          Try Demo
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>

              {filteredApps.map((app) => (
                <motion.div key={app.id} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 group flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={app.image}
                          alt={app.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                        {app.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {app.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-3 flex-1">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {app.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {app.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies:</h4>
                        <div className="flex flex-wrap gap-1">
                          {app.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {app.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 mt-auto">
                      <div className="w-full flex gap-2">
                        <div className="w-full flex gap-2">
                          {hasDemo(app) ? (
                            app.isExternal && app.externalUrl ? (
                              <Button 
                                className="flex-1" 
                                size="sm"
                                onClick={() => handleTryDemo(app)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Try Demo
                              </Button>
                            ) : (
                              <Button asChild className="flex-1" size="sm">
                                <Link to={app.demoUrl || `/apps/${app.id}`}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Try Demo
                                </Link>
                              </Button>
                            )
                          ) : (
                            <Button asChild className="flex-1" size="sm">
                              <Link to={`/apps/${app.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* No Results Message */}
            {filteredApps.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No apps found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Iframe Modal for External Apps */}
      {selectedExternalApp && selectedExternalApp.externalUrl && (
        <AppIframeModal
          isOpen={iframeModalOpen}
          onClose={() => {
            setIframeModalOpen(false);
            setSelectedExternalApp(null);
          }}
          appTitle={selectedExternalApp.title}
          appUrl={selectedExternalApp.externalUrl!}
        />
      )}
    </PageLayout>
  );
};

export default Apps;
