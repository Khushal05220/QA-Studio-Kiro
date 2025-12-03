# Deploy QA Studio to Vercel

## 🚀 Quick Deployment Guide

### Prerequisites
- GitHub account with your code pushed
- Vercel account (free) - Sign up at https://vercel.com

### Step 1: Sign Up / Login to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Project
1. Click "Add New..." → "Project"
2. Find your repository: `QA-Studio-Kiro`
3. Click "Import"

### Step 3: Configure Project
1. **Framework Preset:** Vite
2. **Root Directory:** `qa-studio` (IMPORTANT!)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add:

```
GEMINI_API_KEY=your_actual_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important:** Use your REAL API keys here (not the .env.example values)

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🔧 Configuration Details

### vercel.json
The `vercel.json` file configures:
- Frontend build (Vite)
- Backend API routes (Express)
- Environment variables
- Routing

### Project Structure
```
qa-studio/
├── src/           → Frontend (React)
├── server/        → Backend (Express API)
├── dist/          → Build output
└── vercel.json    → Vercel config
```

---

## 🛡️ Security Recommendations

### 1. Set API Quotas
Before deploying, set limits in Google Cloud Console:
- Daily quota: $10/day
- Set up billing alerts

### 2. Monitor Usage
After deployment:
- Check Vercel Analytics
- Monitor Gemini API usage
- Watch Supabase usage

### 3. Rate Limiting (Optional)
Consider adding rate limiting to protect costs:
- Limit requests per user
- Add authentication requirements
- Monitor for abuse

---

## 📊 After Deployment

### Your Live URLs
- **Frontend:** `https://your-project.vercel.app`
- **API:** `https://your-project.vercel.app/api/*`

### Test Your Deployment
1. Visit your Vercel URL
2. Create an account
3. Try generating test cases
4. Check if data persists (Supabase)

### Update GitHub README
Add your live URL to README.md:
```markdown
## 🌐 Live Demo
https://your-project.vercel.app
```

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you:
- Push to `main` branch
- Merge a pull request
- Make any changes to your GitHub repo

---

## 💰 Vercel Free Tier Limits

✅ **Included Free:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Custom domains
- Serverless functions

⚠️ **You Pay For:**
- Gemini API usage (your Google Cloud account)
- Supabase usage (free tier: 500MB database, 2GB bandwidth)

---

## 🆘 Troubleshooting

### Build Fails
- Check if `qa-studio` is set as root directory
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

### API Not Working
- Verify environment variables are set
- Check server/index.js is present
- Review function logs in Vercel

### Environment Variables Not Working
- Make sure they start with `VITE_` for frontend
- Backend variables don't need prefix
- Redeploy after adding variables

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] vercel.json created
- [ ] Environment variables ready
- [ ] Gemini API quota limits set
- [ ] Supabase project configured

After deploying:
- [ ] Test all features
- [ ] Check API endpoints
- [ ] Verify data persistence
- [ ] Monitor usage
- [ ] Update README with live URL

---

## 🎯 For Hackathon Submission

Your submission should include:
1. ✅ GitHub repository URL
2. ✅ Live demo URL (Vercel)
3. ✅ README with setup instructions
4. ✅ .kiro directory (for Kiro AI submission)
5. ✅ Demo video (optional but recommended)

---

## 🚀 Ready to Deploy!

1. Push your code to GitHub (already done ✅)
2. Go to https://vercel.com
3. Import your project
4. Add environment variables
5. Click Deploy!

Your QA Studio will be live in minutes! 🎉

---

**Need help?** Check Vercel documentation: https://vercel.com/docs
