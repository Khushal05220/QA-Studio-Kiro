# Supabase Setup Instructions

## Step 1: Run the SQL Schema

1. Go to your Supabase project dashboard: https://app.supabase.com/project/cqikvpifgbqohtiednce
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-setup.sql` file
5. Paste it into the SQL editor
6. Click "Run" to execute the schema

This will create:
- All necessary tables (test_cases, user_stories, bugs, test_plans, api_collections)
- Row Level Security (RLS) policies to ensure users only see their own data
- Indexes for better performance
- Triggers for automatic timestamp updates

## Step 2: Enable Email Authentication

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Make sure "Email" provider is enabled
3. Configure email templates if needed (optional)

## Step 3: Test the Application

1. Start the development servers:
   ```
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. You should see the login page

4. Create a new account:
   - Click "Don't have an account? Sign Up"
   - Enter your email and password (min 6 characters)
   - Check your email for verification link (if email confirmation is enabled)

5. Sign in with your credentials

6. You should now see the QA Studio dashboard

## Features

### Multi-User Support
- Each user has their own isolated data
- Data is automatically saved to Supabase
- Real-time sync across devices
- Secure authentication with JWT tokens

### Data Persistence
- Test Cases
- User Stories
- Bugs
- Test Plans
- API Collections

### Security
- Row Level Security ensures data isolation
- Passwords are hashed and never stored in plain text
- JWT tokens for secure API access
- Automatic session management

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env` file exists in the qa-studio folder
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly

### Can't sign up or sign in
- Check Supabase dashboard > Authentication > Users to see if user was created
- Check browser console for error messages
- Verify email provider is enabled in Supabase

### Data not saving
- Check browser console for errors
- Verify RLS policies are created (run the SQL schema again if needed)
- Make sure you're logged in

### "Failed to load data from Supabase" error
- Check that all tables were created successfully
- Verify RLS policies are in place
- Check Supabase logs for errors

## Database Schema

### test_cases
- Stores all test cases with steps, preconditions, expected results
- Linked to user via user_id

### user_stories
- Stores user stories with acceptance criteria
- Supports epic grouping and tagging

### bugs
- Bug tracking with severity, priority, and reproduction steps
- Status tracking (open, in progress, closed)

### test_plans
- Test plan management with linked test cases
- Status tracking (draft, active, completed)

### api_collections
- API request collections for API testing
- Stores request configurations and history

All tables include:
- Automatic timestamps (created_at, updated_at)
- User isolation via RLS
- JSON fields for flexible data structures
