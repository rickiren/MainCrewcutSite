import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const testimonials = [
  {
    id: 1,
    title: "Custom Automation Platform",
    company: "TechCorp Inc.",
    result: "$2.3M Revenue Increase",
    timeframe: "3 Weeks",
    description: "Automated their entire customer onboarding process, reducing manual work by 80% and increasing conversion rates by 45%.",
    metrics: ["80% reduction in manual work", "45% increase in conversions", "$2.3M additional revenue"]
  },
  {
    id: 2,
    title: "AI-Powered SaaS Tool",
    company: "Global Services Ltd.",
    result: "$1.8M New Revenue Stream",
    timeframe: "14 Days",
    description: "Built a customer-facing AI tool that became their highest-margin product line within 6 weeks of launch.",
    metrics: ["New $1.8M revenue stream", "85% profit margin", "Highest-demand product"]
  },
  {
    id: 3,
    title: "Internal Process Automation",
    company: "Manufacturing Giant",
    result: "$500K Annual Savings",
    timeframe: "10 Days",
    description: "Streamlined their inventory management and reduced operational costs by $500K annually through smart automation.",
    metrics: ["$500K annual cost savings", "60% faster processing", "Zero errors since launch"]
  }
];

const Proof = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const proofRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isInView && !isHovering) {
      const interval = setInterval(() => {
        setActiveTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsInView(true);
      } else {
        setIsInView(false);
      }
    }, {
      threshold: 0.2
    });
    
    if (proofRef.current) {
      observer.observe(proofRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const getCardAnimationClass = (index: number) => {
    if (index === activeTestimonial) return "scale-100 opacity-100 z-20";
    if (index === (activeTestimonial + 1) % testimonials.length) return "translate-x-[40%] scale-95 opacity-60 z-10";
    if (index === (activeTestimonial - 1 + testimonials.length) % testimonials.length) return "translate-x-[-40%] scale-95 opacity-60 z-10";
    return "scale-90 opacity-0";
  };
  
  return (
    <section id="proof" ref={proofRef} className="bg-gray-50 py-[50px] w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`text-center mb-10 max-w-3xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Proof in Numbers
          </div>
          <h2 className="text-3xl font-bold mb-3">
            From Concept to Cash Flow in Weeks
          </h2>
          <p className="text-gray-600">
            Real results from real clients who chose to code smarter instead of hiring more.
          </p>
        </div>
        
        <div 
          className="relative h-[400px] overflow-hidden" 
          onMouseEnter={() => setIsHovering(true)} 
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`absolute top-0 w-full max-w-2xl transform transition-all duration-500 ${getCardAnimationClass(index)}`} 
              >
                <Card className="overflow-hidden h-[350px] border border-gray-200 shadow-lg hover:shadow-xl flex flex-col bg-white group">
                  <CardContent className="p-8 flex flex-col flex-grow text-center overflow-y-auto scrollbar-hide group-hover:scrollbar-thin group-hover:scrollbar-thumb-gray-300 group-hover:scrollbar-track-transparent">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-800">
                        {testimonial.title}
                      </h3>
                      <p className="text-gray-500 text-lg font-medium">{testimonial.company}</p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-green-600 mb-2">{testimonial.result}</div>
                      <div className="text-gray-500">Delivered in {testimonial.timeframe}</div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 flex-grow">{testimonial.description}</p>
                    
                    <div className="space-y-2">
                      {testimonials[activeTestimonial].metrics.map((metric, idx) => (
                        <div key={idx} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          ✅ {metric}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {!isMobile && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all duration-300 hover:scale-110" 
                onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all duration-300 hover:scale-110" 
                onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-30">
            {testimonials.map((_, idx) => (
              <button 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'bg-gray-500 w-5' : 'bg-gray-200 hover:bg-gray-300'}`} 
                onClick={() => setActiveTestimonial(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proof;