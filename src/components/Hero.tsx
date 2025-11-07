import { ArrowRight, Code, Workflow, MessageSquare, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { useState } from "react";
import CalendlyModal from "./CalendlyModal";
import AIChat from "./AIChat";
import { Link } from 'react-router-dom';
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

const Hero = () => {
  const isMobile = useIsMobile();
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

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
        duration: 0.6
      }
    }
  };

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <motion.div className="relative w-full" initial="hidden" animate="visible" variants={containerVariants}>
        <BackgroundBeamsWithCollision>
          <div className="pt-0 sm:pt-0 md:pt-0 w-full">
            <motion.div
              className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-8"
              animate={{
                paddingBottom: isChatExpanded ? "4rem" : "2rem"
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ scrollBehavior: 'auto' }}
            >
              <motion.div 
                className="w-full max-w-4xl text-center" 
                variants={itemVariants}
                style={{ transition: 'all 0.3s ease-in-out' }}
              >
                <motion.h2
                  className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-700 to-neutral-100 dark:from-neutral-600 dark:to-neutral-100 text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight mb-6"
                  variants={itemVariants}
                >
                  Unlock 6+ Figures of<br />Hidden Profit in 14 Days<br />
                  <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
                    <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
                      <span className="">With Custom AI & SaaS Tools</span>
                    </div>
                    <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
                      <span className="">With Custom AI & SaaS Tools</span>
                    </div>
                  </div>
                </motion.h2>

                <motion.p className="text-gray-300 mt-4 text-lg text-center font-sans mb-8" variants={itemVariants}>
                  The most profitable 'hire' you'll make this year isn't a person — it's custom AI
                </motion.p>

                <motion.p className="text-gray-400 mt-2 text-base text-center font-sans mb-6" variants={itemVariants}>
                  Get instant, personalized AI solutions for your business in seconds
                </motion.p>

                {/* AI Chat Section */}
                <motion.div
                  className="rounded-xl w-full max-w-2xl mx-auto"
                  variants={itemVariants}
                  style={{ 
                    marginBottom: isChatExpanded ? '1rem' : '2rem',
                    transition: 'margin-bottom 0.3s ease-in-out'
                  }}
                >
                  <AIChat onExpandedChange={setIsChatExpanded} />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center relative z-10" 
                  variants={itemVariants}
                  style={{ 
                    marginTop: isChatExpanded ? '2rem' : '1rem',
                    transition: 'margin-top 0.3s ease-in-out'
                  }}
                >
                  {/* Book Your 15-Minute Fit Call */}
                  <button 
                    onClick={() => setIsCalendlyModalOpen(true)}
                    className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-[15px] py-1 text-sm font-medium text-white backdrop-blur-3xl">
                      Book Your 15-Minute Fit Call
                    </span>
                  </button>

                  {/* See what we can build */}
                  <Link
                    to="/apps"
                    className="w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 text-gray-300 hover:text-white transition-colors rounded-md flex items-center justify-center group text-sm sm:text-base font-medium"
                  >
                    See what we can build
                    <Code className="ml-2 w-4 w-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </BackgroundBeamsWithCollision>
      </motion.div>

      {/* Calendly Modal */}
      <CalendlyModal
        isOpen={isCalendlyModalOpen}
        onClose={() => setIsCalendlyModalOpen(false)}
      />
    </>
  );
};

export default Hero;
