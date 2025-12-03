# QA Studio - Testing Guide

## Prerequisites

1. **Supabase Setup Complete**
   - SQL schema has been run in Supabase SQL Editor
   - Email authentication is enabled
   - Environment variables are configured in `.env`

2. **Development Server Running**
   - Both client (http://localhost:3000) and server (http://localhost:3001) are running
   - Run `npm run dev` to start both servers

## Test Plan

### 1. Authentication Tests

#### Test 1.1: User Registration
**Steps:**
1. Open http://localhost:3000
2. You should see the Login page
3. Click "Don't have an account? Sign Up"
4. Enter email: `test@example.com`
5. Enter password: `test123` (should fail - too short)
6. Enter password: `test1234` (6+ characters)
7. Confirm password: `test1234`
8. Click "Sign Up"

**Expected Results:**
- Short password shows error message
- Valid signup shows success message
- Email verification message appears (if email confirmation enabled)
- User is created in Supabase Auth

**Verification:**
- Check Supabase Dashboard > Authentication > Users
- User should appear in the list

#### Test 1.2: User Login
**Steps:**
1. On login page, enter registered email
2. Enter correct password
3. Click "Sign In"

**Expected Results:**
- User is redirected to dashboard
- Sidebar shows user email
- No errors in console

#### Test 1.3: Session Persistence
**Steps:**
1. After logging in, refresh the page
2. Close browser and reopen

**Expected Results:**
- User remains logged in
- Data persists across sessions

#### Test 1.4: Logout
**Steps:**
1. Click "Logout" button in sidebar
2. Verify redirect to login page

**Expected Results:**
- User is logged out
- Redirected to login page
- Cannot access protected routes

### 2. Data Persistence Tests

#### Test 2.1: Test Cases
**Steps:**
1. Navigate to "Test Cases" page
2. Click "Generate Test Cases" or add manually
3. Add 3-5 test cases
4. Wait 2 seconds (auto-save delay)
5. Refresh the page

**Expected Results:**
- Test cases are saved to Supabase
- Data persists after refresh
- Check Supabase Dashboard > Table Editor > test_cases
- Only current user's test cases are visible

#### Test 2.2: User Stories
**Steps:**
1. Navigate to "STLC / Backlog" page
2. Add 2-3 user stories
3. Wait 2 seconds
4. Refresh the page

**Expected Results:**
- User stories persist
- Data visible in Supabase user_stories table
- User isolation verified

#### Test 2.3: Bugs
**Steps:**
1. In "STLC / Backlog" page, switch to Bugs tab
2. Add 2-3 bugs
3. Wait 2 seconds
4. Refresh the page

**Expected Results:**
- Bugs persist
- Data visible in Supabase bugs table

#### Test 2.4: Test Plans
**Steps:**
1. Navigate to "Test Plans" page
2. Create a new test plan
3. Add test cases to the plan
4. Wait 2 seconds
5. Refresh the page

**Expected Results:**
- Test plan persists with linked test cases
- Data visible in Supabase test_plans table

#### Test 2.5: API Collections
**Steps:**
1. Navigate to "API Testing" page
2. Create a new collection
3. Add API requests
4. Wait 2 seconds
5. Refresh the page

**Expected Results:**
- API collections persist
- Data visible in Supabase api_collections table

### 3. Multi-User Isolation Tests

#### Test 3.1: Data Isolation
**Steps:**
1. Create User A and add test data
2. Logout
3. Create User B and add different test data
4. Verify User B cannot see User A's data
5. Logout and login as User A
6. Verify User A's data is intact

**Expected Results:**
- Each user only sees their own data
- No data leakage between users
- RLS policies working correctly

#### Test 3.2: Concurrent Users
**Steps:**
1. Open two different browsers (Chrome and Firefox)
2. Login as different users in each
3. Add data in both sessions simultaneously

**Expected Results:**
- Both users can work independently
- No conflicts or errors
- Data remains isolated

### 4. AI Features Tests

#### Test 4.1: Test Case Generation
**Steps:**
1. Navigate to "Test Cases" page
2. Enter a user story
3. Click "Generate Test Cases"
4. Wait for AI response

**Expected Results:**
- AI generates 5-10 test cases
- Test cases have proper structure
- Data is saved to Supabase
- Gemini API is working

#### Test 4.2: Test Script Generation
**Steps:**
1. Navigate to "Test Scripts" page
2. Select framework (Playwright, Cypress, etc.)
3. Enter test scenario
4. Click "Generate Script"

**Expected Results:**
- AI generates test script code
- Streaming works properly
- Code is properly formatted

#### Test 4.3: Accessibility Audit
**Steps:**
1. Navigate to "ADA Auditor" page
2. Enter a URL
3. Click "Audit"

**Expected Results:**
- AI generates accessibility report
- Findings are categorized
- WCAG guidelines referenced

#### Test 4.4: API Testing
**Steps:**
1. Navigate to "API Testing" page
2. Create a new request
3. Execute the request
4. Generate assertions using AI

**Expected Results:**
- API request executes
- Response is displayed
- AI generates relevant assertions

### 5. Error Handling Tests

#### Test 5.1: Network Errors
**Steps:**
1. Disconnect internet
2. Try to save data
3. Reconnect internet

**Expected Results:**
- Graceful error messages
- Data saves when connection restored
- No data loss

#### Test 5.2: Invalid Credentials
**Steps:**
1. Try to login with wrong password
2. Try to login with non-existent email

**Expected Results:**
- Clear error messages
- No sensitive information leaked
- User can retry

#### Test 5.3: Session Expiry
**Steps:**
1. Login and wait for session to expire (or manually expire in Supabase)
2. Try to perform actions

**Expected Results:**
- User is redirected to login
- Clear message about session expiry
- Data is not lost

### 6. Performance Tests

#### Test 6.1: Large Dataset
**Steps:**
1. Add 50+ test cases
2. Navigate between pages
3. Search and filter data

**Expected Results:**
- App remains responsive
- No significant lag
- Data loads quickly

#### Test 6.2: Auto-Save Performance
**Steps:**
1. Rapidly add/edit multiple items
2. Observe auto-save behavior

**Expected Results:**
- Debouncing works (1 second delay)
- No duplicate saves
- No race conditions

### 7. UI/UX Tests

#### Test 7.1: Responsive Design
**Steps:**
1. Test on different screen sizes
2. Test on mobile devices

**Expected Results:**
- Layout adapts properly
- All features accessible
- No broken UI elements

#### Test 7.2: Keyboard Shortcuts
**Steps:**
1. Press Ctrl+K
2. Test other shortcuts

**Expected Results:**
- Shortcuts work as expected
- Accessible via keyboard

### 8. Security Tests

#### Test 8.1: SQL Injection
**Steps:**
1. Try to enter SQL commands in input fields
2. Example: `'; DROP TABLE test_cases; --`

**Expected Results:**
- Input is sanitized
- No SQL injection possible
- Supabase RLS protects data

#### Test 8.2: XSS Protection
**Steps:**
1. Try to enter script tags in text fields
2. Example: `<script>alert('XSS')</script>`

**Expected Results:**
- Scripts are escaped
- No XSS execution
- Data is safely rendered

#### Test 8.3: Direct API Access
**Steps:**
1. Try to access Supabase API directly with another user's ID
2. Use browser dev tools to modify requests

**Expected Results:**
- RLS policies block unauthorized access
- Only own data is accessible
- 403 Forbidden errors for unauthorized attempts

## Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development / Production

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | User Registration | ☐ Pass ☐ Fail | |
| 1.2 | User Login | ☐ Pass ☐ Fail | |
| 1.3 | Session Persistence | ☐ Pass ☐ Fail | |
| 1.4 | Logout | ☐ Pass ☐ Fail | |
| 2.1 | Test Cases Persistence | ☐ Pass ☐ Fail | |
| 2.2 | User Stories Persistence | ☐ Pass ☐ Fail | |
| 2.3 | Bugs Persistence | ☐ Pass ☐ Fail | |
| 2.4 | Test Plans Persistence | ☐ Pass ☐ Fail | |
| 2.5 | API Collections Persistence | ☐ Pass ☐ Fail | |
| 3.1 | Data Isolation | ☐ Pass ☐ Fail | |
| 3.2 | Concurrent Users | ☐ Pass ☐ Fail | |
| 4.1 | Test Case Generation | ☐ Pass ☐ Fail | |
| 4.2 | Test Script Generation | ☐ Pass ☐ Fail | |
| 4.3 | Accessibility Audit | ☐ Pass ☐ Fail | |
| 4.4 | API Testing | ☐ Pass ☐ Fail | |
| 5.1 | Network Errors | ☐ Pass ☐ Fail | |
| 5.2 | Invalid Credentials | ☐ Pass ☐ Fail | |
| 5.3 | Session Expiry | ☐ Pass ☐ Fail | |
| 6.1 | Large Dataset | ☐ Pass ☐ Fail | |
| 6.2 | Auto-Save Performance | ☐ Pass ☐ Fail | |
| 7.1 | Responsive Design | ☐ Pass ☐ Fail | |
| 7.2 | Keyboard Shortcuts | ☐ Pass ☐ Fail | |
| 8.1 | SQL Injection | ☐ Pass ☐ Fail | |
| 8.2 | XSS Protection | ☐ Pass ☐ Fail | |
| 8.3 | Direct API Access | ☐ Pass ☐ Fail | |
```

## Known Issues

Document any issues found during testing here.

## Browser Compatibility

Test on:
- ☐ Chrome (latest)
- ☐ Firefox (latest)
- ☐ Edge (latest)
- ☐ Safari (latest)

## Notes

- Auto-save has a 1-second debounce delay
- Email verification may be required depending on Supabase settings
- First-time data load may take a moment
- Gemini API requires valid API key in .env file
