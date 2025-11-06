import { UIMockupProps } from '@/types/videoJSON';

/**
 * Pre-built UI templates for glassmorphic mockups
 */
export const UI_TEMPLATES: Record<string, UIMockupProps> = {
  flightBooking: {
    title: 'Flight Booking',
    layout: 'split',
    sections: [
      {
        id: 'form',
        type: 'form',
        position: { x: 5, y: 10, width: 45, height: 80 },
        content: {
          title: 'Where to next?',
          fields: [
            { label: 'From', value: 'Malaga' },
            { label: 'To', value: 'Denpasar' },
            { label: 'Trip Type', value: 'Round trip' },
            { label: 'Passengers', value: '2 Passengers' },
            { label: 'Class', value: 'Economy Class' },
            { label: 'Departure', value: 'April 1 2024' },
            { label: 'Return', value: 'April 14 2024' },
          ],
          button: {
            text: 'Explore Trips',
          },
        },
        style: {
          opacity: 0.3,
          blur: 15,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        },
      },
      {
        id: 'ticket',
        type: 'ticket',
        position: { x: 50, y: 10, width: 45, height: 80 },
        content: {
          title: 'Your Trip',
          fields: [
            { label: 'From', value: 'Malaga' },
            { label: 'To', value: 'Denpasar' },
            { label: 'Date', value: 'April 1st 2024' },
          ],
          barcode: true,
        },
        style: {
          backgroundColor: '#1e3a8a',
          opacity: 0.9,
          blur: 10,
        },
      },
    ],
    background: {
      type: 'pattern',
      pattern: 'ribbed',
      color: '#f3f4f6',
    },
    animations: {
      entrance: 'slideUp',
      stagger: 8,
    },
  },

  productCard: {
    title: 'Product Showcase',
    layout: 'centered',
    sections: [
      {
        id: 'product',
        type: 'card',
        position: { x: 20, y: 15, width: 60, height: 70 },
        content: {
          title: 'Premium Product',
          fields: [
            { label: 'Price', value: '$299' },
            { label: 'Rating', value: '4.8 ⭐' },
            { label: 'Reviews', value: '1,234 reviews' },
            { label: 'Availability', value: 'In Stock' },
          ],
        },
        style: {
          opacity: 0.25,
          blur: 20,
        },
      },
    ],
    background: {
      type: 'gradient',
    },
    animations: {
      entrance: 'scale',
      stagger: 5,
    },
  },

  dashboard: {
    title: 'Dashboard',
    layout: 'grid',
    sections: [
      {
        id: 'stat1',
        type: 'card',
        position: { x: 5, y: 10, width: 28, height: 35 },
        content: {
          title: 'Total Users',
          fields: [{ label: 'Count', value: '12,345' }],
        },
        style: { opacity: 0.3, blur: 15 },
      },
      {
        id: 'stat2',
        type: 'card',
        position: { x: 36, y: 10, width: 28, height: 35 },
        content: {
          title: 'Revenue',
          fields: [{ label: 'Amount', value: '$45,678' }],
        },
        style: { opacity: 0.3, blur: 15 },
      },
      {
        id: 'stat3',
        type: 'card',
        position: { x: 67, y: 10, width: 28, height: 35 },
        content: {
          title: 'Growth',
          fields: [{ label: 'Percentage', value: '+23.5%' }],
        },
        style: { opacity: 0.3, blur: 15 },
      },
      {
        id: 'main',
        type: 'form',
        position: { x: 5, y: 50, width: 90, height: 45 },
        content: {
          title: 'Analytics Overview',
          fields: [
            { label: 'Active Sessions', value: '8,912' },
            { label: 'Conversion Rate', value: '3.2%' },
            { label: 'Avg. Session', value: '4m 32s' },
          ],
        },
        style: { opacity: 0.25, blur: 20 },
      },
    ],
    background: {
      type: 'pattern',
      pattern: 'grid',
      color: '#f8f9fa',
    },
    animations: {
      entrance: 'slideUp',
      stagger: 6,
    },
  },

  contactForm: {
    title: 'Contact Form',
    layout: 'centered',
    sections: [
      {
        id: 'form',
        type: 'form',
        position: { x: 25, y: 20, width: 50, height: 60 },
        content: {
          title: 'Get in Touch',
          fields: [
            { label: 'Name', value: 'John Doe' },
            { label: 'Email', value: 'john@example.com' },
            { label: 'Message', value: 'Hello, I would like...' },
          ],
          button: {
            text: 'Send Message',
          },
        },
        style: {
          opacity: 0.3,
          blur: 15,
        },
      },
    ],
    background: {
      type: 'gradient',
    },
    animations: {
      entrance: 'scale',
      stagger: 5,
    },
  },
};

/**
 * Get a template by name
 */
export const getUITemplate = (name: string): UIMockupProps | null => {
  return UI_TEMPLATES[name] || null;
};

/**
 * Get all template names
 */
export const getUITemplateNames = (): string[] => {
  return Object.keys(UI_TEMPLATES);
};

