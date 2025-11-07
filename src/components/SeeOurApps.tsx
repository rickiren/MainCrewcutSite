import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, ExternalLink } from "lucide-react";
import { useState } from "react";
import { apps, type App } from "@/data/apps";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppIframeModal from "@/components/AppIframeModal";

const SeeOurApps = () => {
  const [iframeModalOpen, setIframeModalOpen] = useState(false);
  const [selectedExternalApp, setSelectedExternalApp] = useState<App | null>(null);

  // Filter to only show apps that have demos
  const demoApps = apps.filter(app => 
    app.id === 'writing-editor' || 
    app.id === 'ai-logistics-optimizer-2' ||
    (app.isExternal && app.externalUrl)
  );

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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            See Our Apps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our AI-powered solutions firsthand. Try these live demos to see how we transform business processes.
          </p>
        </motion.div>

        {/* Apps Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {demoApps.map((app) => (
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

        {/* View All Apps CTA */}
        <motion.div 
          className="text-center mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
        >
          <Link
            to="/apps"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            View all our apps
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>

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
    </section>
  );
};

export default SeeOurApps;
