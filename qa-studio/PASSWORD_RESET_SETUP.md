# Password Reset Setup Guide

## Supabase Configuration (REQUIRED)

Go to your **Supabase Dashboard** and configure these settings:

### Step 1: URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173` (or your production domain)
3. In **Redirect URLs**, add:
   - `http://localhost:5173`
   - `http://localhost:5173/#/reset-password`
   - (Add your production URLs too if deploying)

### Step 2: Verify Email Template (Optional)
1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password**
3. The default template should work, but ensure the link format is correct

## Testing

1. Click "Forgot password?" on login page
2. Enter your email
3. Click "Send Reset Link"
4. Check your email inbox
5. Click the reset link in the email
6. You should see the "Set New Password" form
7. Enter new password (min 6 characters)
8. Click "Update Password"

## Debugging

Open browser console (F12) and look for these logs:
- `Checking URL for recovery token: ...`
- `Recovery token detected in URL!`
- `Auth event: PASSWORD_RECOVERY`

If you see `Auth event: SIGNED_IN` but no recovery detection, the redirect URL might not be configured correctly in Supabase.

## How It Works

1. User requests password reset → Supabase sends email
2. Email contains link with recovery token
3. User clicks link → Supabase validates token and redirects to your app
4. App detects `type=recovery` in URL or `PASSWORD_RECOVERY` auth event
5. App shows password reset form
6. User enters new password → Supabase updates it
7. User is redirected to the app

## Common Issues

### Still showing login page instead of reset form
- Check that Redirect URLs in Supabase include your app URL
- Make sure Site URL is set correctly
- Check browser console for auth events

### "Invalid token" error
- Token expired (valid for 1 hour) - request a new reset link

### Link opens wrong page
- Verify the Site URL in Supabase matches your app URL exactly
