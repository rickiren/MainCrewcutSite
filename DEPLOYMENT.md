# 🚀 Vercel Deployment Guide

## Setup

1. **Push your code to GitHub**
2. **Connect repo to Vercel** at [vercel.com](https://vercel.com)
3. **Vercel auto-deploys** your frontend and API functions

## Environment Variables

In Vercel dashboard, set:
- `ANTHROPIC_API_KEY` = your Claude API key

## How It Works

- **Frontend**: React app deployed to Vercel
- **Backend**: Serverless function at `/api/claude`
- **Everything**: Hosted on Vercel, no external services needed

## Testing

- **Frontend**: `https://your-domain.vercel.app`
- **API**: `https://your-domain.vercel.app/api/claude`
- **Local dev**: `npm run dev` (frontend) + Vercel dev (API)

## Local Development

```bash
# Install Vercel CLI for local API testing
npm i -g vercel

# Run API functions locally
vercel dev
```
