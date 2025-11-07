import { ArrowRight } from "lucide-react";
import { useState } from "react";
import CalendlyModal from "./CalendlyModal";

const FinalCTA = () => {
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);

  return (
    <>
      <section id="final-cta" className="bg-gradient-to-b from-white via-gray-50 to-gray-100 py-[70px] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Most Profitable Hire Is Waiting
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get your custom AI tool or SaaS live in 14 days. Stop burning cash on payroll and consultants. Start printing profit.
          </p>
          
          <button 
            onClick={() => setIsCalendlyModalOpen(true)}
            className="inline-flex items-center px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-lg font-semibold shadow-lg hover:shadow-xl group"
          >
            👉 "Book Your 15-Minute Fit Call"
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-gray-500 text-sm mt-6">
            No commitment. No sales pitch. Just a conversation about what's possible.
          </p>
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

export default FinalCTA;