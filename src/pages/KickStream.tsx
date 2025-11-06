import { useEffect } from 'react';

const KickStream = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    // Ensure body background is transparent for this page
    document.body.style.backgroundColor = 'transparent';
    return () => {
      // Reset body background when leaving the page
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Vintage Paper Texture Background - Very subtle */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 69, 19, 0.01) 2px, rgba(139, 69, 19, 0.01) 4px)
          `
        }}
      ></div>
      
      {/* Main Container with Vintage Border */}
      <div className="relative w-full h-screen p-8" style={{ backgroundColor: 'transparent' }}>
        {/* Outer Border Frame */}
        <div className="absolute inset-0 border-[8px] border-black">
          {/* Inner Gold Border */}
          <div className="absolute inset-[8px] border-[2px] border-amber-300/70">
            {/* Decorative Corner Elements */}
            {/* Top Left Corner - L bracket */}
            <div className="absolute top-[8px] left-[8px] w-12 h-12 border-l-[3px] border-t-[3px] border-amber-300/70"></div>
            {/* Bottom Left Corner - L bracket with star */}
            <div className="absolute bottom-[8px] left-[8px] w-12 h-12 border-l-[3px] border-b-[3px] border-amber-300/70">
              <div className="absolute -bottom-2 -left-2 w-3 h-3 text-amber-300/70 text-xs">★</div>
            </div>
            {/* Top Right Corner - star */}
            <div className="absolute top-[8px] right-[8px] w-3 h-3 text-amber-300/70 text-xs">★</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            {/* Mother Approved News Box */}
            <div className="relative">
              <div className="border-[6px] border-amber-800 border-t-amber-900 border-r-amber-700 px-4 py-3 shadow-lg" style={{ backgroundColor: 'rgba(255, 251, 235, 0.85)' }}>
                <div className="border-[2px] border-amber-300/70 px-3 py-2" style={{ backgroundColor: 'transparent' }}>
                  <div className="flex flex-col items-center">
                    <div className="font-serif text-amber-900 font-bold text-xl leading-tight tracking-wider uppercase drop-shadow-sm" style={{ fontFamily: 'serif' }}>
                      <div>MOTHER</div>
                      <div>APPROVED</div>
                      <div>NEWS</div>
                    </div>
                    <div className="text-amber-800 text-xs font-serif mt-1 tracking-wider">EST. 2025</div>
                  </div>
                </div>
              </div>
              {/* Star below */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 text-amber-300/70 text-xs">★</div>
            </div>

            {/* Live on Kick Button */}
            <div className="relative">
              <button className="border-[4px] border-dashed border-amber-300/70 px-6 py-3 flex items-center gap-2 transition-colors shadow-lg" style={{ backgroundColor: 'rgba(120, 53, 15, 0.9)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.85)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(120, 53, 15, 0.9)'}>
                <div className="w-0 h-0 border-l-[6px] border-l-amber-300 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                <span className="font-sans font-bold text-amber-50 text-sm tracking-wider uppercase" style={{ letterSpacing: '0.1em' }}>LIVE ON KICK</span>
              </button>
            </div>
          </div>

          {/* Divider Line */}
          <div className="relative mb-6">
            <div className="h-[2px]" style={{ backgroundColor: 'rgba(252, 211, 77, 0.7)' }}></div>
            <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ backgroundColor: 'rgba(120, 53, 15, 0.9)' }}></div>
            <div className="absolute -bottom-1 left-0 right-0 h-[1px] border-t border-dashed border-amber-300/70"></div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="flex-1 grid grid-cols-2 gap-8">
            {/* Host Cam Section */}
            <div className="flex flex-col">
              {/* Host Cam Label */}
              <div className="mb-2">
                <div className="inline-block border-[3px] border-amber-300/70 px-3 py-1 shadow-md" style={{ backgroundColor: 'rgba(120, 53, 15, 0.9)' }}>
                  <span className="font-sans font-bold text-amber-50 text-xs tracking-wider uppercase" style={{ letterSpacing: '0.1em' }}>HOST CAM</span>
                </div>
              </div>

              {/* Host Video Feed */}
              <div className="relative flex-1 min-h-[400px]">
                <div className="absolute inset-0 border-[6px] border-amber-800" style={{ backgroundColor: 'transparent' }}>
                  <div className="absolute inset-[6px] border-[2px] border-amber-300/70" style={{ backgroundColor: 'transparent' }}>
                    {/* Grid Pattern Background - Fully Transparent */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundColor: 'transparent',
                        backgroundImage: `
                          linear-gradient(to right, rgba(139, 69, 19, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(139, 69, 19, 0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    >
                      {/* Corner Cross Icons */}
                      <div className="absolute top-2 left-2 text-amber-300/60 text-lg">✛</div>
                      <div className="absolute top-2 right-2 text-amber-300/60 text-lg">✛</div>
                      <div className="absolute bottom-2 left-2 text-amber-300/60 text-lg">✛</div>
                      <div className="absolute bottom-2 right-2 text-amber-300/60 text-lg">✛</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Host Nameplate */}
              <div className="relative -mt-4 z-20">
                <div className="border-[6px] border-amber-800 shadow-lg" style={{ backgroundColor: 'rgba(255, 228, 230, 0.85)' }}>
                  <div className="border-[2px] border-amber-300/70 px-4 py-3" style={{ backgroundColor: 'transparent' }}>
                    {/* Diamond on top border */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45" style={{ backgroundColor: 'rgba(252, 211, 77, 0.7)' }}></div>
                    <div className="text-center">
                      <div className="font-serif text-amber-800 text-xs uppercase tracking-wider mb-1" style={{ letterSpacing: '0.15em' }}>HOST</div>
                      <div className="font-serif text-amber-900 text-2xl font-bold uppercase tracking-wider" style={{ letterSpacing: '0.1em', fontFamily: 'serif' }}>YOUR NAME</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Cam Section */}
            <div className="flex flex-col">
              {/* Guest Cam Label */}
              <div className="mb-2">
                <div className="inline-block border-[3px] border-amber-300/70 px-3 py-1 shadow-md" style={{ backgroundColor: 'rgba(30, 58, 138, 0.9)' }}>
                  <span className="font-sans font-bold text-blue-50 text-xs tracking-wider uppercase" style={{ letterSpacing: '0.1em' }}>GUEST CAM</span>
                </div>
              </div>

              {/* Guest Video Feed */}
              <div className="relative flex-1 min-h-[400px]">
                <div className="absolute inset-0 border-[6px] border-blue-800" style={{ backgroundColor: 'transparent' }}>
                  <div className="absolute inset-[6px] border-[2px] border-amber-300/70" style={{ backgroundColor: 'transparent' }}>
                    {/* Grid Pattern Background - Fully Transparent */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundColor: 'transparent',
                        backgroundImage: `
                          linear-gradient(to right, rgba(30, 58, 138, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(30, 58, 138, 0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    >
                      {/* Corner Cross Icons */}
                      <div className="absolute top-2 left-2 text-blue-300/60 text-lg">✛</div>
                      <div className="absolute top-2 right-2 text-blue-300/60 text-lg">✛</div>
                      <div className="absolute bottom-2 left-2 text-blue-300/60 text-lg">✛</div>
                      <div className="absolute bottom-2 right-2 text-blue-300/60 text-lg">✛</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Nameplate */}
              <div className="relative -mt-4 z-20">
                <div className="border-[6px] border-blue-800 shadow-lg" style={{ backgroundColor: 'rgba(219, 234, 254, 0.85)' }}>
                  <div className="border-[2px] border-amber-300/70 px-4 py-3" style={{ backgroundColor: 'transparent' }}>
                    {/* Diamond on top border */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45" style={{ backgroundColor: 'rgba(147, 197, 253, 0.7)' }}></div>
                    <div className="text-center">
                      <div className="font-serif text-blue-800 text-xs uppercase tracking-wider mb-1" style={{ letterSpacing: '0.15em' }}>GUEST</div>
                      <div className="font-serif text-blue-900 text-2xl font-bold uppercase tracking-wider" style={{ letterSpacing: '0.1em', fontFamily: 'serif' }}>GUEST NAME</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KickStream;

