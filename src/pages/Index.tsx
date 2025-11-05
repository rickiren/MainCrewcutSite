
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import WhyCrewCut from '@/components/WhyWrlds';
import Process from '@/components/Process';
import SeeOurApps from '@/components/SeeOurApps';
import Proof from '@/components/Proof';
import OfferStack from '@/components/OfferStack';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';

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
        imageUrl="/image.png"
        keywords={['custom AI', 'SaaS development', 'business automation', 'revenue growth', 'process automation', 'AI tools', 'custom software']}
      />
      <Hero />
      <WhyCrewCut />
      <Process />
      <SeeOurApps />
      <Proof />
      <OfferStack />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </PageLayout>
  );
};

export default Index;
