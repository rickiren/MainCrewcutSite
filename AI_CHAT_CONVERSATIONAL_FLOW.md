# AI Chat Conversational Flow & Email Collection

## Overview

The AI Chat component has been enhanced to provide a more conversational experience with automatic email collection and PDF report delivery. The system now operates in multiple stages to create a natural conversation flow.

## How It Works

### 1. Initial Conversation Stage
- **User Input**: User describes their business (industry, size, challenges)
- **AI Response**: Provides 3 specific AI solutions with the standard ending about PDF report
- **System Prompt**: Uses the business consultant persona with structured recommendations

### 2. Email Collection Stage
- **User Input**: User provides their email address
- **System Action**: Automatically detects email format and sends PDF report
- **Email Service**: Uses EmailJS to send personalized AI implementation guide
- **Success Message**: Confirms email sent and transitions to follow-up mode

### 3. Follow-up Conversation Stage
- **User Input**: User asks questions about implementation or new challenges
- **AI Response**: Conversational, helpful responses about AI implementation
- **System Prompt**: Switches to follow-up mode for ongoing support
- **Reset Option**: Users can start new conversations with the reset button

## Key Features

### Email Detection
- Automatically detects email addresses in user messages
- Uses regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Triggers PDF report delivery when email is found

### Dynamic System Prompts
- **Initial Mode**: Structured business consultant with 3-point recommendations
- **Follow-up Mode**: Conversational AI implementation support
- Context-aware responses based on conversation stage

### Email Integration
- **Primary**: EmailJS for immediate email delivery
- **Backup**: Custom API endpoint (`/api/email-collection`) for data collection
- **Template**: Personalized AI implementation guide based on business context

### Visual Indicators
- **Stage-specific placeholders**: Different text based on conversation stage
- **Loading states**: AI thinking, email sending, etc.
- **Button changes**: Send → Mail → Loading spinner
- **Reset button**: Appears in follow-up mode for new conversations

## Technical Implementation

### State Management
```typescript
const [conversationStage, setConversationStage] = useState<'initial' | 'followup' | 'email_collection'>('initial');
const [collectedEmail, setCollectedEmail] = useState<string>('');
const [isSendingEmail, setIsSendingEmail] = useState(false);
```

### Email Detection Logic
```typescript
const extractEmail = (text: string): string | null => {
  const match = text.match(emailRegex);
  return match ? match[0] : null;
};
```

### Dynamic System Prompts
- System prompts change based on `conversationStage`
- Initial stage: Business consultant with structured format
- Follow-up stage: Conversational AI implementation support

### EmailJS Integration
- Uses existing EmailJS configuration
- Sends personalized AI implementation guide
- Includes business context in email content

## API Endpoints

### Primary: EmailJS
- **Service ID**: `service_i3h66xg`
- **Template ID**: `template_fgq53nh`
- **Public Key**: `wQmcZvoOqTAhGnRZ3`

### Backup: Custom API
- **Endpoint**: `/api/email-collection`
- **Purpose**: Data collection and backup email delivery
- **Features**: Email validation, logging, CRM integration ready

## User Experience Flow

1. **User describes business** → AI gives 3 AI solutions
2. **User provides email** → System automatically sends PDF report
3. **User asks follow-up questions** → AI provides conversational support
4. **User can reset** → Start new conversation anytime

## Customization Options

### Email Templates
- Modify EmailJS template for different email content
- Add branding, company information, contact details
- Include specific AI tool recommendations

### System Prompts
- Adjust AI personality and response style
- Modify the 3-point recommendation format
- Change follow-up conversation behavior

### Email Services
- Replace EmailJS with other services (SendGrid, Mailgun, etc.)
- Integrate with CRM systems (HubSpot, Salesforce, etc.)
- Add email automation workflows

## Troubleshooting

### Common Issues
- **Email not detected**: Check regex pattern and input format
- **EmailJS errors**: Verify service ID, template ID, and public key
- **API errors**: Check Vercel function logs and environment variables

### Debug Mode
- Console logs show conversation stage changes
- Email detection and sending status
- API response details

## Future Enhancements

### Analytics & Tracking
- Track conversation completion rates
- Monitor email collection success
- Analyze user engagement patterns

### Advanced Features
- Multiple email templates based on business type
- A/B testing for different AI response styles
- Integration with marketing automation tools
- Lead scoring based on conversation quality

### CRM Integration
- Automatic lead creation
- Contact information enrichment
- Follow-up task creation
- Sales pipeline integration

## Security Considerations

- Email validation on both client and server
- Rate limiting for email sending
- Input sanitization for all user messages
- Secure API key management

## Cost Optimization

- Monitor EmailJS usage and costs
- Implement email sending limits
- Cache common AI responses
- Optimize API token usage for Claude
