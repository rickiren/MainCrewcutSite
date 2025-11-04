import { sendWelcomeEmail, sendNewsletterConfirmation } from './resendService'

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
}

export const subscribeToNewsletter = async (subscription: EmailSubscription) => {
  try {
    console.log('📧 Newsletter subscription received:', subscription)
    console.log('📧 Contact would be stored in database:', {
      email: subscription.email,
      name: `${subscription.first_name || ''} ${subscription.last_name || ''}`.trim(),
      phone: subscription.phone_number,
      source: subscription.form_source,
      company: subscription.company,
      businessType: subscription.business_type,
      teamSize: subscription.team_size,
      budget: subscription.budget,
      timeline: subscription.timeline,
      decisionMaker: subscription.decision_maker
    })
    
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
