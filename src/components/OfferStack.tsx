import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import CalendlyModal from "./CalendlyModal";

const OfferStack = () => {
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  const offers = [
    {
      title: "Audit & ROI Map",
      value: "$2,000 value",
      description: "We pinpoint the fastest path to 6–7 figures of hidden profit."
    },
    {
      title: "Custom SaaS / AI Tool Build (14 days)",
      value: "$15,000 value",
      description: "Your working product in production, not a slide deck."
    },
    {
      title: "User Feedback & Iteration Loop",
      value: "$5,000 value",
      description: "We refine in real-time to ensure ROI in weeks, not years."
    },
    {
      title: "Deployment & Team Training",
      value: "$3,000 value",
      description: "Your people know exactly how to use the tool from Day 1."
    },
    {
      title: "Salary Replacement Guarantee",
      value: "$10,000+ value",
      description: "Every system we build is designed to replace at least 1 full-time salary — freeing you from $80K–$120K annual overhead."
    },
    {
      title: "24/7 Digital Employee",
      value: "$8,000 value",
      description: "Unlike humans, your AI doesn't take breaks, doesn't call in sick, and works at scale instantly."
    },
    {
      title: "Speed Advantage",
      value: "$5,000 value",
      description: "Ship in weeks, not months. Outpace competitors who are still 'planning.'"
    },
    {
      title: "Unlimited Scalability",
      value: "$7,500 value",
      description: "Spin up more 'AI workers' at zero marginal cost. Whether you need 1 or 100, it's the same price."
    },
    {
      title: "Profit Protection",
      value: "$6,000 value",
      description: "Systems that never forget, never miss a deadline, and don't make costly human errors."
    },
    {
      title: "New Revenue Stream Creation",
      value: "$12,000 value",
      description: "We don't just cut costs — we help you launch AI-powered products that can create recurring revenue."
    }
  ];

  return (
    <>
      <section id="offer-stack" className="bg-white py-[50px] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Turn Code Into Profit — Fast
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We don't sell "consulting hours." We deliver a complete profit machine in 14 days. Here's exactly what's inside:
            </p>
          </div>
          
          <Card className="border border-gray-200 shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="space-y-6">
                {offers.map((offer, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 rounded-full p-1 mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
                        <span className="text-green-600 font-semibold">{offer.value}</span>
                      </div>
                      <p className="text-gray-600">{offer.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Value:</p>
                    <p className="text-2xl font-bold text-gray-900 line-through">$78,500+</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Your Price:</p>
                    <p className="text-3xl font-bold text-green-600">$9,500</p>
                    <p className="text-sm text-gray-500">(fixed)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <button 
              onClick={() => setIsCalendlyModalOpen(true)}
              className="inline-flex items-center px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              👉 "Book Your 15-Minute Fit Call"
            </button>
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

export default OfferStack;