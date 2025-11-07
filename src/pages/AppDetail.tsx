import { ArrowLeft, ExternalLink, Github, Play, Calendar, Code, Users, Zap } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { getAppById } from '@/data/apps';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const AppDetail = () => {
  const { appId } = useParams<{ appId: string }>();
  const app = appId ? getAppById(appId) : undefined;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if app not found
  if (!app) {
    return <Navigate to="/apps" replace />;
  }

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

  return (
    <PageLayout>
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <Link to="/apps" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apps
            </Link>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Header Section */}
              <motion.div variants={itemVariants} className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <Badge variant="secondary" className="mb-4">
                      {app.category}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {app.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                      {app.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      {app.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button size="lg" className="flex-1 sm:flex-none" disabled>
                        <Play className="h-5 w-5 mr-2" />
                        Demo Coming Soon
                      </Button>
                      <Button variant="outline" size="lg" className="flex-1 sm:flex-none" disabled>
                        <Github className="h-5 w-5 mr-2" />
                        Code Coming Soon
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={app.image}
                        alt={app.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <Separator className="my-12" />

              {/* Features Section */}
              <motion.div variants={itemVariants} className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {app.features.map((feature, index) => (
                    <Card key={index} className="text-center hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Zap className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{feature}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </motion.div>

              <Separator className="my-12" />

              {/* Technology Stack Section */}
              <motion.div variants={itemVariants} className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Technology Stack</h2>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {app.technologies.map((tech, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div variants={itemVariants} className="text-center">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-2xl mb-2">Ready to explore?</CardTitle>
                    <CardDescription className="text-lg">
                      Discover more amazing applications in our collection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="lg">
                      <Link to="/apps">
                        Browse All Apps
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AppDetail;
