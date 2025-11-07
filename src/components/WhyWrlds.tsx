import { motion } from "framer-motion";
import { Zap, BarChart, Rocket, ArrowRight } from "lucide-react";
import { useState } from "react";
import CalendlyModal from "./CalendlyModal";

const WhyCrewCut = () => {
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

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

  return (
    <>
      <section id="why-crewcut" className="relative py-16 md:py-24 bg-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full opacity-60"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-50 to-blue-50 rounded-full opacity-60"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Why Keep Paying for People When Code Can Do It Better?
            </motion.h2>
          </motion.div>

          <motion.div
            className="mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12 mb-8 border border-gray-100 shadow-sm"
              >
                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-6"
                >
                  Every 7– and 8–figure company hits the same wall: growth comes with bloated payroll, endless busywork, and $100K consultants who talk more than they ship.
                </motion.p>
                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-6"
                >
                  Custom AI flips that script. Instead of throwing more people (and money) at the problem, we turn your processes into code — unlocking new recurring SaaS revenue streams for your customers, or automating the internal work that eats 30–50% of employee time.
                </motion.p>
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                  <p className="text-xl md:text-2xl font-bold text-gray-900 text-center">
                    The result: fewer costs, more output, faster growth.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center bg-gray-900 text-white px-6 py-4 rounded-full text-lg font-semibold shadow-lg">
                  <span className="mr-3">👉</span>
                  <span>The winners aren't hiring more. They're coding smarter.</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              className="text-center mb-12"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                That means:
              </h3>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-4 mr-6">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Automations that cut 30–50% of wasted hours</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-green-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-4 mr-6">
                    <BarChart className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">SaaS tools that create new recurring revenue streams</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-purple-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-4 mr-6">
                    <Rocket className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">A competitive edge that scales faster than headcount ever could</h4>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <button
              onClick={() => setIsCalendlyModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl group"
            >
              👉 "See What We Could Build For You" → Book call
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Calendly Modal */}
      <CalendlyModal
        isOpen={isCalendlyModalOpen}
        onClose={() => setIsCalendlyModalOpen(false)}
      />
    </>
  );
};

export default WhyCrewCut;
