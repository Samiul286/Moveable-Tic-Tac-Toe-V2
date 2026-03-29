# Vercel Deployment Guide

This project is configured for automatic deployment to Vercel.

## Quick Deploy

### Option 1: One-Click Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Option 2: Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New..." → "Project"
4. Import your repository
5. Add environment variables (see below)
6. Click "Deploy"

### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Required Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

Get these values from:
- Firebase Console → Project Settings → Your apps → Config

## Post-Deployment Setup

### 1. Update Firebase Authorized Domains
- Go to Firebase Console → Authentication → Settings
- Add your Vercel domain: `your-project-name.vercel.app`

### 2. Update Firebase Database Rules
- Go to Firebase Console → Realtime Database → Rules
- Ensure your rules allow access from your domain

## Automatic Deployments

Once connected, Vercel will automatically:
- ✅ Deploy every push to `main` branch → Production
- ✅ Create preview deployments for pull requests
- ✅ Provide unique URLs for each deployment

## Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build
```

### Environment Variables Not Working
- Verify all variables are added in Vercel Dashboard
- Redeploy after adding/changing variables
- Check variable names match exactly (case-sensitive)

### Firebase Connection Issues
- Verify Firebase Database URL is correct
- Check Firebase authorized domains include your Vercel domain
- Ensure all Firebase environment variables are set

## Project Configuration

This project includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ Optimized Next.js build settings
- ✅ Environment variable placeholders

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
