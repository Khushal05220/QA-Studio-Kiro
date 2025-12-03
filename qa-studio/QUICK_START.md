# QA Studio - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Supabase Database (2 minutes)

1. Go to your Supabase project: https://app.supabase.com/project/cqikvpifgbqohtiednce

2. Click **"SQL Editor"** in the left sidebar

3. Click **"New Query"**

4. Open the file `supabase-setup.sql` in your project folder

5. Copy ALL the contents and paste into the SQL editor

6. Click **"Run"** button

✅ You should see "Success. No rows returned" - this is correct!

### Step 2: Verify Environment Variables (30 seconds)

The `.env` file has already been created with your credentials:
- ✅ Supabase URL
- ✅ Supabase Anon Key  
- ✅ Gemini API Key

### Step 3: Start the Application (30 seconds)

The app is already running! Open your browser:

**👉 http://localhost:3000**

### Step 4: Create Your Account (1 minute)

1. You'll see the login page
2. Click **"Don't have an account? Sign Up"**
3. Enter your email (e.g., `your-email@example.com`)
4. Enter a password (minimum 6 characters)
5. Confirm your password
6. Click **"Sign Up"**

✅ You should see a success message!

### Step 5: Sign In (30 seconds)

1. Enter your email and password
2. Click **"Sign In"**

🎉 **You're in!** You should now see the QA Studio dashboard.

## ✨ What You Can Do Now

### Generate Test Cases
1. Click **"Test Cases"** in the sidebar
2. Enter a user story or requirement
3. Click **"Generate Test Cases"**
4. AI will create comprehensive test cases for you

### Create Test Scripts
1. Click **"Test Scripts"** in the sidebar
2. Choose your framework (Playwright, Cypress, etc.)
3. Describe your test scenario
4. Click **"Generate Script"**
5. Get production-ready test code

### Audit Accessibility
1. Click **"ADA Auditor"** in the sidebar
2. Enter a website URL
3. Click **"Audit"**
4. Get WCAG compliance report

### Test APIs
1. Click **"API Testing"** in the sidebar
2. Create a new request
3. Configure method, URL, headers, body
4. Click **"Send"**
5. View response and generate assertions

### Manage Test Plans
1. Click **"Test Plans"** in the sidebar
2. Create a new test plan
3. Add test cases to your plan
4. Track execution status

### Track User Stories & Bugs
1. Click **"STLC / Backlog"** in the sidebar
2. Add user stories with acceptance criteria
3. Track bugs with severity and priority
4. Manage your testing workflow

## 🔒 Your Data is Secure

- ✅ Each user has their own isolated data
- ✅ Nobody else can see your test cases, stories, or bugs
- ✅ Data is automatically saved to the cloud
- ✅ Access your data from any device

## 💾 Auto-Save

Everything you create is automatically saved after 1 second. No need to click "Save"!

## 🔄 Multi-Device Sync

Login from any device and your data will be there. Changes sync automatically.

## 🚪 Logout

Click the **"Logout"** button at the bottom of the sidebar when you're done.

## 🆘 Need Help?

### Common Issues

**Can't sign up?**
- Make sure password is at least 6 characters
- Check that email is valid
- Look for error messages on the page

**Can't see your data?**
- Make sure you're logged in
- Check that you ran the SQL schema in Supabase
- Refresh the page

**AI features not working?**
- Check that Gemini API key is in `.env` file
- Verify the backend server is running (you should see it in the terminal)
- Check browser console for errors

### Check Server Status

The terminal should show:
```
[1] Gemini initialized with model: gemini-2.5-flash
[1] QA Studio server running on http://localhost:3001
[1] Gemini API: Connected
[0] VITE v5.4.21  ready in 335 ms
[0] ➜  Local:   http://localhost:3000/
```

### Verify Database Setup

1. Go to Supabase Dashboard
2. Click **"Table Editor"**
3. You should see these tables:
   - test_cases
   - user_stories
   - bugs
   - test_plans
   - api_collections

## 📚 More Information

- **SUPABASE_SETUP.md** - Detailed setup instructions
- **TESTING_GUIDE.md** - Comprehensive testing procedures
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🎯 Next Steps

1. ✅ Create your account
2. ✅ Generate your first test cases
3. ✅ Create a test script
4. ✅ Build a test plan
5. ✅ Invite your team (coming soon!)

---

**Enjoy using QA Studio! 🚀**

Your AI-powered testing workflow automation tool.
