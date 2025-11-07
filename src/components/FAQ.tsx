import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const FAQ = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is this expensive?",
      answer: "Not compared to payroll. Most companies spend 10x more on salaries for repetitive tasks than what it costs to automate them. Our systems don't call in sick, don't need training, and scale infinitely. Think of it as replacing a $100K/year staff role with a $10K/year AI system that never stops working. Plus, instead of paying hundreds of thousands for a traditional dev team, our AI-assisted builds deliver results in weeks for a fraction of the cost."
    },
    {
      question: "Who is this really for?",
      answer: "This is for businesses that want to move fast, cut costs, and stay ahead of the competition:\n\n• Founders who want an MVP live in weeks, not months.\n• Teams drowning in repetitive tasks that should already be automated.\n• Companies tired of paying $100K+ salaries for work AI can do better, faster, and cheaper.\n\nIf you want to leverage AI without hiring a team of engineers, this is built for you."
    },
    {
      question: "What exactly are we offering?",
      answer: "We build custom AI-powered systems designed to replace repetitive work, accelerate development, and unlock growth. That means:\n\n• AI Automations → Cut 30–50% of wasted hours with workflows that run 24/7.\n• AI SaaS & Tools → Software that creates new recurring revenue streams.\n• AI Coding & Development → Get apps, platforms, and MVPs live in weeks.\n• Cost Savings & Scalability → The output of a dev team, without the payroll.\n\nIn plain English: we help you do more, spend less, and move faster using AI as your unfair advantage."
    },
    {
      question: "How fast can we see results?",
      answer: "Most clients see live automations within days and working MVPs within 2–6 weeks. Because we use AI-assisted coding, the timeline is cut by 70–80% compared to hiring a dev team."
    },
    {
      question: "What if I don't know where to start?",
      answer: "That's exactly why we exist. We'll help you identify the highest-ROI areas to automate or build, then design a solution tailored to your business. No tech expertise required — you just tell us the outcome you want, we handle the rest."
    },
    {
      question: "Will this work for my industry?",
      answer: "Yes. We've automated and built systems for e-commerce, SaaS, real estate, agencies, finance, healthcare, and more. Anywhere people waste time on repetitive tasks or want to ship products faster, this works."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="bg-white py-[50px] w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            FAQ
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    Q: {faq.question}
                  </h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                        <strong className="text-gray-900">A:</strong> {faq.answer}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;