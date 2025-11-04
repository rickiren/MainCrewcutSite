import { supabase } from '@/lib/supabase'

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
    // Check if we're using the mock client (local development without env vars)
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.log('📧 Mock mode: Calendly contact would be stored in Supabase:', contact)
      return { success: true, data: null, message: 'Contact would be stored (mock mode)' }
    }

    console.log('🔌 Connecting to Supabase...')
    console.log('📧 Inserting Calendly contact:', contact)

    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()

    if (error) {
      console.log('⚠️  Supabase error:', error)
      // If it's a duplicate email error, we can handle it gracefully
      if (error.code === '23505') { // Unique constraint violation
        console.log('📧 Email already exists, updating contact info...')
        // Update existing contact with new Calendly info
        const { data: updateData, error: updateError } = await supabase
          .from('contacts')
          .update({
            first_name: contact.first_name,
            last_name: contact.last_name,
            phone_number: contact.phone_number,
            form_source: contact.form_source,
            calendly_event_id: contact.calendly_event_id,
            calendly_event_type: contact.calendly_event_type,
            calendly_invitee_id: contact.calendly_invitee_id,
            updated_at: new Date().toISOString()
          })
          .eq('email', contact.email)
          .select()

        if (updateError) {
          console.error('❌ Error updating existing contact:', updateError)
          throw updateError
        }

        console.log('✅ Existing contact updated with Calendly info:', updateData)
        return { success: true, data: updateData, message: 'Contact updated with Calendly info' }
      }
      throw error
    }

    console.log('✅ Calendly contact successfully stored in Supabase:', data)
    return { success: true, data, message: 'Contact created successfully' }
  } catch (error) {
    console.error('❌ Error creating Calendly contact:', error)
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
