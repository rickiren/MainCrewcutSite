export interface CalendlyContact {
  email: string
  first_name?: string
  last_name?: string
  phone_number?: string
  form_source: string
  calendly_event_id?: string
  calendly_event_type?: string
  calendly_invitee_id?: string
}

export const createContactFromCalendly = async (contact: CalendlyContact) => {
  try {
    // Log contact information for local development
    console.log('📧 Calendly contact received:', contact)
    console.log('📧 Contact would be stored in database:', {
      email: contact.email,
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      phone: contact.phone_number,
      source: contact.form_source,
      calendly: {
        eventId: contact.calendly_event_id,
        eventType: contact.calendly_event_type,
        inviteeId: contact.calendly_invitee_id
      }
    })
    
    return { success: true, data: contact, message: 'Contact logged successfully' }
  } catch (error) {
    console.error('❌ Error processing Calendly contact:', error)
    throw error
  }
}

// Function to extract contact info from Calendly event data
export const extractContactFromCalendlyEvent = (eventData: any): CalendlyContact | null => {
  try {
    // Calendly sends different data structures depending on the event type
    // This handles the most common structure from inline widget events
    const invitee = eventData.data?.payload?.invitee || eventData.data?.invitee || eventData.invitee
    const event = eventData.data?.payload?.event || eventData.data?.event || eventData.event
    
    if (!invitee?.email) {
      console.warn('⚠️  No email found in Calendly event data:', eventData)
      return null
    }

    const contact: CalendlyContact = {
      email: invitee.email,
      first_name: invitee.first_name || undefined,
      last_name: invitee.last_name || undefined,
      phone_number: invitee.phone_number || undefined,
      form_source: 'calendly_booking',
      calendly_event_id: event?.uuid || undefined,
      calendly_event_type: event?.event_type?.name || undefined,
      calendly_invitee_id: invitee.uuid || undefined
    }

    console.log('📧 Extracted contact info from Calendly event:', contact)
    return contact
  } catch (error) {
    console.error('❌ Error extracting contact from Calendly event:', error)
    return null
  }
}
