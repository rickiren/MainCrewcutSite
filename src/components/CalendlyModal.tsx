import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { createContactFromCalendly, extractContactFromCalendlyEvent } from "@/services/calendlyService";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendlyModal = ({ isOpen, onClose }: CalendlyModalProps) => {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load Calendly script if not already loaded
      if (!window.Calendly) {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onload = () => {
          if (window.Calendly && calendlyRef.current) {
            window.Calendly.initInlineWidget({
              url: 'https://calendly.com/rickibodner',
              parentElement: calendlyRef.current,
              prefill: {},
              utm: {}
            });
          }
        };
        document.head.appendChild(script);
      } else if (calendlyRef.current) {
        // Script already loaded, just initialize
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/rickibodner',
          parentElement: calendlyRef.current,
          prefill: {},
          utm: {}
        });
      }

      // Add event listener for Calendly booking events
      const handleCalendlyEvent = async (e: MessageEvent) => {
        // Handle different Calendly event types
        if (e.data.event && (
          e.data.event.indexOf("calendly.event_scheduled") === 0 ||
          e.data.event.indexOf("calendly.event_created") === 0 ||
          e.data.event.indexOf("calendly.invitee.created") === 0
        )) {
          console.log('📅 Calendly event detected:', e.data.event, e.data);
          
          // Extract contact information from the Calendly event
          const contact = extractContactFromCalendlyEvent(e.data);
          
          if (contact) {
            try {
              // Create contact in Supabase
              const result = await createContactFromCalendly(contact);
              console.log('✅ Contact created/updated from Calendly:', result);
              
              // Show success message to user (optional)
              if (result.success) {
                console.log('🎉 Contact successfully saved to database!');
              }
            } catch (error) {
              console.error('❌ Error creating contact from Calendly:', error);
            }
          } else {
            console.warn('⚠️  Could not extract contact info from Calendly event');
            console.log('🔍 Event data structure:', JSON.stringify(e.data, null, 2));
          }
          
          // Fire Meta Pixel event when someone books
          if (window.fbq) {
            window.fbq('track', 'BookedAppointment');
            console.log('Calendly booking detected - Meta Pixel BookedAppointment event fired');
          }
        }
      };

      window.addEventListener('message', handleCalendlyEvent);

      // Cleanup function
      return () => {
        window.removeEventListener('message', handleCalendlyEvent);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Book your 30 min cut — find out how much waste we can shave off
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Calendly Widget */}
              <div className="p-4">
                <div 
                  ref={calendlyRef}
                  className="calendly-inline-widget" 
                  data-url="https://calendly.com/rickibodner" 
                  style={{ minWidth: "320px", height: "700px" }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CalendlyModal;
