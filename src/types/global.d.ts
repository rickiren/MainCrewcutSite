declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill: Record<string, any>;
        utm: Record<string, any>;
      }) => void;
    };
    fbq?: (event: string, action: string) => void;
  }
}

// Calendly event types
export interface CalendlyEventData {
  event: string;
  data: {
    payload?: {
      invitee?: {
        uuid: string;
        email: string;
        first_name?: string;
        last_name?: string;
        phone_number?: string;
      };
      event?: {
        uuid: string;
        event_type?: {
          name: string;
        };
      };
    };
    invitee?: {
      uuid: string;
      email: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    };
    event?: {
      uuid: string;
      event_type?: {
        name: string;
      };
    };
  };
}

export {};
