import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import CalendlyModal from "./CalendlyModal";

const Pricing = () => {
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  const pricingTiers = [
    {
      name: "Automation Sprint",
      price: "$7,500",
      duration: "7 days",
      bestFor: "Best for: founders or teams who want a fast win on efficiency.",
      features: [
        "1 custom automation or AI agent (replaces repetitive manual work)",
        "ROI Map: we calculate your exact cost savings potential",
        "Team training so it sticks"
      ],
      outcome: "Outcome: Shave off 20–40 hrs/week of manual work → frees up headcount immediately.",
      isPopular: false
    },
    {
      name: "MVP Sprint",
      price: "$9,500",
      duration: "14 days",
      bestFor: "Best for: early-stage SaaS founders or teams who want a working product to test with users.",
      features: [
        "A live, working SaaS/AI MVP (core product or automation platform)",
        "1 iteration cycle included (real user feedback → improve fast)",
        "ROI Map + Workflow alignment"
      ],
      outcome: "Outcome: Walk away with a launch-ready product that can bring in new revenue or run core workflows.",
      isPopular: true
    },
    {
      name: "Scale Sprint",
      price: "$19,000",
      duration: "30 days",
      bestFor: "Best for: companies ready to scale into full SaaS products or enterprise automations.",
      features: [
        "Multi-feature product build (multiple automations, integrations, or customer-facing modules)",
        "Feedback loops + team onboarding built in",
        "Scaling architecture (ready for 100s/1000s of users or departments)"
      ],
      outcome: "Outcome: A production-grade product that can replace multiple salaries, support entire departments, or serve paying customers at scale.",
      isPopular: false
    }
  ];

  return (
    <>
      <section id="pricing" className="bg-gray-50 py-[50px] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Sprint</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Fixed pricing, guaranteed delivery. Pick the sprint that matches your ambition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
                  tier.isPopular 
                    ? 'border-gray-700 shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{tier.price}</div>
                    <div className="text-gray-500 mb-3">{tier.duration}</div>
                    {tier.bestFor && (
                      <p className="text-sm text-gray-600 mb-4">{tier.bestFor}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">You'll get:</h4>
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {tier.outcome && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium">{tier.outcome}</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setIsCalendlyModalOpen(true)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      tier.isPopular
                        ? 'bg-gray-700 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 text-sm">
              All packages include a 100% satisfaction guarantee. If we can't find a high-ROI use case, we'll pay you $500 for your time.
            </p>
          </div>
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

export default Pricing;