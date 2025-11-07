# Calendly Integration with Supabase

This integration automatically creates contacts in your Supabase database when someone books a phone call through Calendly.

## How It Works

1. **Event Detection**: The `CalendlyModal` component listens for Calendly booking events
2. **Contact Extraction**: When a booking is made, contact information is extracted from the Calendly event data
3. **Database Storage**: The contact is automatically saved to the `contacts` table in Supabase
4. **Duplicate Handling**: If the email already exists, the contact information is updated with the new Calendly data

## Supported Event Types

The integration listens for these Calendly events:
- `calendly.event_scheduled` - When an event is scheduled
- `calendly.event_created` - When an event is created
- `calendly.invitee.created` - When an invitee is created

## Contact Data Structure

Each contact created includes:
- **Required**: `email`, `form_source`
- **Optional**: `first_name`, `last_name`, `phone_number`
- **Calendly-specific**: `calendly_event_id`, `calendly_event_type`, `calendly_invitee_id`

## Database Schema

The `contacts` table has been updated to include Calendly-specific fields:

```sql
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    form_source VARCHAR(100) NOT NULL,
    calendly_event_id VARCHAR(255),
    calendly_event_type VARCHAR(255),
    calendly_invitee_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Files Modified

1. **`src/services/calendlyService.ts`** - New service for handling Calendly contacts
2. **`src/components/CalendlyModal.tsx`** - Updated to create contacts on booking
3. **`src/types/global.d.ts`** - Added TypeScript types for Calendly events
4. **`supabase_setup.sql`** - Updated database schema

## Usage

The integration works automatically - no additional setup required. When someone books a call through Calendly:

1. The contact information is automatically extracted
2. A new contact record is created in Supabase
3. If the email already exists, the record is updated
4. All actions are logged to the console for debugging

## Testing

To test the integration:

1. Open the browser console
2. Book a call through Calendly
3. Check the console logs for:
   - `📅 Calendly event detected`
   - `✅ Contact created/updated from Calendly`
   - `🎉 Contact successfully saved to database!`

## Error Handling

The integration includes comprehensive error handling:
- Graceful fallback for missing environment variables
- Duplicate email handling (updates existing records)
- Detailed logging for debugging
- Non-blocking errors (won't prevent the booking from completing)

## Environment Variables

Make sure these are set in your `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

If contacts aren't being created:

1. Check the browser console for error messages
2. Verify Supabase environment variables are set
3. Check the Calendly event data structure in the console
4. Ensure the `contacts` table exists with the correct schema
