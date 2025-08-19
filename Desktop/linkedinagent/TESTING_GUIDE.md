# LinkedIn Agent Testing Guide

This guide will help you test the complete LinkedIn agent workflow and verify that the Anthropic API integration is working correctly.

## 🚀 Quick Start (Automated)

Run the complete workflow test:

```bash
./test-workflow.sh
```

This will automatically run all three steps and show you the results.

## 📋 Manual Step-by-Step Testing

### Step 1: Check LinkedIn Health/Login Status

```bash
npm run health
```

**What to look for:**
- ✅ "LinkedIn is accessible and ready"
- ✅ No captcha detected
- ✅ Session is valid

**If you see errors:**
- You may need to log in first: `npm run login`
- Check your LinkedIn credentials
- Ensure you're not rate-limited

### Step 2: Discover LinkedIn Posts

```bash
npm run discover
```

**What to look for:**
- ✅ "Starting LinkedIn post discovery..."
- ✅ "Posts discovered and saved to data/posts.json"
- ✅ Check the count of posts found

**Expected output:**
```
🔍 Starting LinkedIn post discovery...
📊 Found 15 posts matching criteria
💾 Posts saved to data/posts.json
```

**Check the data:**
```bash
# View discovered posts
cat data/posts.json | jq '.posts | length'
```

### Step 3: Generate Engagement Drafts (Claude AI)

```bash
npm run engage
```

**What to look for:**
- ✅ "Starting engagement draft generation..."
- ✅ "Comment draft generated" for each post
- ✅ "DM draft generated" for each post
- ✅ "Engagement drafts generated successfully!"

**Expected output:**
```
💬 Starting engagement draft generation...
📝 Generating drafts for 15 posts...

🔄 Processing post: https://linkedin.com/posts/...
✅ Comment draft generated
✅ DM draft generated
...
🎉 Engagement drafts generated successfully!
📊 Total drafts: 15
💾 Saved to: data/drafts.json
```

**Check the generated drafts:**
```bash
# View all drafts
cat data/drafts.json | jq '.[0]'

# Count total drafts
cat data/drafts.json | jq 'length'
```

## 🖥️ Dashboard Testing

### Start the Dashboard

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### What to Look For in the UI

#### 1. **Dashboard Tab**
- **Posts Section**: Should show discovered posts with author names, companies, and engagement scores
- **Health Status**: Should show "Healthy" with no captcha detected
- **Counters**: Should show discovered posts count

#### 2. **Drafts Tab**
- **Comment Drafts**: Should show AI-generated comments for each post
- **Outreach Drafts**: Should show AI-generated DM messages
- **Copy to Clipboard**: Test that you can copy the generated content

#### 3. **Posts Tab**
- **Post List**: Should display all discovered posts
- **Generate Drafts Button**: Should be available for each post
- **Post Details**: Author, company, engagement metrics

## 🔍 Troubleshooting

### Common Issues

#### 1. **"ANTHROPIC_API_KEY environment variable is required"**
```bash
# Check if .env file exists
ls -la .env

# Create from template if missing
cp env.example .env

# Edit with your actual API key
nano .env
```

#### 2. **No posts discovered**
- Check your niche configuration in `src/config/niche.multifamily.json`
- Verify LinkedIn login status
- Check if discovery criteria are too restrictive

#### 3. **No drafts generated**
- Verify Anthropic API key is correct
- Check API rate limits
- Look for error messages in the console

#### 4. **Dashboard shows no data**
- Ensure the backend scripts have run successfully
- Check that data files exist: `ls -la data/`
- Restart the dashboard after generating data

### Debug Commands

```bash
# Check environment variables
echo $ANTHROPIC_API_KEY

# Monitor data files in real-time
tail -f data/posts.json
tail -f data/drafts.json

# Check file permissions
ls -la data/

# Verify API key format
grep ANTHROPIC_API_KEY .env
```

## 📊 Expected Data Flow

```
LinkedIn Login → Health Check → Post Discovery → AI Draft Generation → Dashboard Display
     ↓              ↓              ↓              ↓                    ↓
  Session      Status OK      posts.json      drafts.json        UI Updates
```

## ✅ Success Indicators

- **Health**: LinkedIn accessible, no captcha
- **Discovery**: 10+ posts found and saved
- **AI Generation**: Claude generates unique comments/DMs for each post
- **Dashboard**: All data displays correctly in the UI
- **Drafts**: Can copy and use generated content

## 🚨 If Something Fails

1. **Check the console output** for specific error messages
2. **Verify your .env file** has the correct API key
3. **Check LinkedIn status** - you might be rate-limited
4. **Review the logs** in the data directory
5. **Restart the process** from the beginning

## 🔄 Re-running Tests

To test again after making changes:

```bash
# Clear existing data
rm -f data/posts.json data/drafts.json

# Re-run the workflow
./test-workflow.sh
```

This ensures you're testing with fresh data each time.
