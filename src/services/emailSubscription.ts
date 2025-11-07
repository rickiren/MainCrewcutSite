import { sendWelcomeEmail, sendNewsletterConfirmation } from './resendService'
import { saveContactToFirestore } from './firebase'

export interface EmailSubscription {
  email: string
  form_source: string
  first_name?: string
  last_name?: string
  phone_number?: string
  // Additional lead data from AI chat
  company?: string
  business_type?: string
  team_size?: string
  budget?: string
  timeline?: string
  decision_maker?: boolean
  message?: string // For contact form messages
}

export const subscribeToNewsletter = async (subscription: EmailSubscription) => {
  try {
    console.log('📧 Newsletter subscription received:', subscription)
    
    // Save contact to Firebase Firestore
    try {
      const contactId = await saveContactToFirestore({
        email: subscription.email,
        first_name: subscription.first_name,
        last_name: subscription.last_name,
        phone_number: subscription.phone_number,
        form_source: subscription.form_source,
        company: subscription.company,
        business_type: subscription.business_type,
        team_size: subscription.team_size,
        budget: subscription.budget,
        timeline: subscription.timeline,
        decision_maker: subscription.decision_maker,
        message: subscription.message
      });
      console.log('✅ Contact saved to Firestore with ID:', contactId);
    } catch (firestoreError) {
      console.error('❌ Error saving to Firestore:', firestoreError);
      // Continue even if Firestore fails - we still want to send the email
    }
    
    // Try to send welcome email
    try {
      await sendWelcomeEmail({
        email: subscription.email,
        firstName: subscription.first_name,
        lastName: subscription.last_name
      });
      console.log('📧 Welcome email sent successfully');
    } catch (emailError) {
      console.log('📧 Welcome email failed (this is ok in development):', emailError);
    }
    
    return { success: true, data: subscription, message: 'Successfully subscribed' }
  } catch (error) {
    console.error('❌ Error subscribing to newsletter:', error)
    throw error
  }
}

// Function to send newsletter confirmation emails
export const sendNewsletterConfirmationEmail = async (email: string) => {
  try {
    const result = await sendNewsletterConfirmation(email);
    console.log('✅ Newsletter confirmation email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending newsletter confirmation:', error);
    throw error;
  }
}
