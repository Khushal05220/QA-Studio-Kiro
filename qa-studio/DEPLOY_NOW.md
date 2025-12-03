# 🚀 Deploy to Vercel Now - 5 Steps

## Step 1: Go to Vercel
Visit: https://vercel.com

Click "Sign Up" → "Continue with GitHub"

## Step 2: Import Project
1. Click "Add New..." → "Project"
2. Find: `QA-Studio-Kiro`
3. Click "Import"

## Step 3: Configure
- **Root Directory:** `qa-studio` ⚠️ IMPORTANT!
- **Framework:** Vite
- Keep other settings as default

## Step 4: Add Environment Variables
Click "Environment Variables" and add these 3:

```
GEMINI_API_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

(Use your REAL values from your local `.env` file)

## Step 5: Deploy
Click "Deploy" button

Wait 2-3 minutes ⏱️

Done! Your app is live! 🎉

---

## Your Live URL
`https://your-project-name.vercel.app`

---

## ⚠️ Before Deploying

Set API limits in Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to "APIs & Services" → "Gemini API"
4. Set quota limit: $10/day
5. Enable billing alerts

This protects you from unexpected costs!

---

## After Deployment

1. Test your live app
2. Add live URL to your README
3. Submit to hackathon with:
   - GitHub URL
   - Live demo URL
   - .kiro directory ✅

---

**Ready? Go to https://vercel.com and deploy!** 🚀
