
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import WhyWrlds from '@/components/WhyWrlds';
import Process from '@/components/Process';
import Proof from '@/components/Proof';
import OfferStack from '@/components/OfferStack';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';
import SEO from '@/components/SEO';
import { useEffect } from 'react';

const Index = () => {
  // Fix any ID conflicts when the page loads
  useEffect(() => {
    const contactElements = document.querySelectorAll('[id="contact"]');
    if (contactElements.length > 1) {
      // If there are multiple elements with id="contact", rename one
      contactElements[1].id = 'contact-footer';
    }
  }, []);

  return (
    <PageLayout>
      <SEO 
        title="Custom AI & SaaS Tools - Unlock 6-7 Figures in 14 Days" 
        description="Turn your processes into code. Custom AI and SaaS tools that create new revenue streams and automate 30-50% of wasted hours. Live in 14 days."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={['custom AI', 'SaaS development', 'business automation', 'revenue growth', 'process automation', 'AI tools', 'custom software']}
      />
      <Hero />
      <WhyWrlds />
      <Process />
      <Proof />
      <OfferStack />
      <Pricing />
      <FAQ />
      <Testimonials />
      <FinalCTA />
    </PageLayout>
  );
};

export default Index;
