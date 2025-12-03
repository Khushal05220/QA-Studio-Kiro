# Fix Vercel API 404 Error

## Problem
The backend API returns 404 because Vercel doesn't support Express servers directly.

## Solution
I've created Vercel Serverless Functions in the `/api` directory.

## What I Did
1. Created `api/generate-testcases.js` - Handles test case generation
2. Created `api/health.js` - Health check endpoint
3. Updated `vercel.json` - Proper routing configuration

## What You Need to Do

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Add Vercel serverless functions for API"
git push
```

### Step 2: Vercel Will Auto-Deploy
Vercel automatically redeploys when you push to GitHub.
Wait 2-3 minutes for the new deployment.

### Step 3: Test Again
After redeployment:
1. Go to your live URL
2. Try generating test cases
3. Should work now! ✅

## Note
I've only created 2 API endpoints so far:
- `/api/generate-testcases` - Generate test cases
- `/api/health` - Health check

If you need other endpoints (generate-script, audit-accessibility, etc.), let me know and I'll create them!

## Quick Fix
Just run:
```bash
git add .
git commit -m "Fix API for Vercel"
git push
```

Vercel will redeploy automatically! 🚀
