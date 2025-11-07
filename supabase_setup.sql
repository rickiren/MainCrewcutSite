-- Supabase SQL setup for contact collection from opt-in forms
-- This table stores emails, names, phone numbers, and tracks which form they came through

-- Create the contacts table
CREATE TABLE IF NOT EXISTS contacts (
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

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Create an index on form_source for analytics
CREATE INDEX IF NOT EXISTS idx_contacts_form_source ON contacts(form_source);

-- Create an index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Enable Row Level Security (RLS) for security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows inserting new contacts (for your forms)
CREATE POLICY "Allow insert contacts" ON contacts
    FOR INSERT WITH CHECK (true);

-- Create a policy that allows reading contacts (you can modify this based on your needs)
CREATE POLICY "Allow read contacts" ON contacts
    FOR SELECT USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a row is modified
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data to test the structure
-- You can remove these after testing
INSERT INTO contacts (email, first_name, last_name, phone_number, form_source) VALUES
    ('john.doe@example.com', 'John', 'Doe', '+1234567890', 'hero_section'),
    ('jane.smith@example.com', 'Jane', 'Smith', NULL, 'footer_newsletter'),
    ('contact@business.com', NULL, NULL, '+1987654321', 'contact_form'),
    ('newsletter@example.com', NULL, NULL, NULL, 'blog_sidebar');

-- Grant necessary permissions (adjust based on your Supabase setup)
-- GRANT ALL ON TABLE contacts TO authenticated;
-- GRANT ALL ON TABLE contacts TO anon;
