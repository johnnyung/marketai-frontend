# 🚀 MarketAI Setup Guide

## Quick Start (5 minutes)

### Step 1: Extract & Navigate
```bash
# Extract the zip file
unzip marketai.zip

# Navigate into the folder
cd marketai
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages (~2-3 minutes).

### Step 3: Start Development Server
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Step 4: Configure AI (Required for AI Features)
1. Open the app in your browser
2. Click **Settings** in the sidebar
3. Get a Claude API key from: https://console.anthropic.com/
4. Paste your API key and set your monthly budget ($10 recommended)
5. Click **Save Settings**

## ✅ You're Done!

The app is now fully functional. Start by:
- Exploring the **Digest** page (mock morning briefing)
- Adding companies to your **Watchlist**
- Asking the **AI Co-Pilot** questions
- Taking quizzes in the **Learning Lab**

## 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Features Available Now

✅ Morning Digest with AI summaries
✅ Company Research & Dossiers  
✅ Calendar with event tracking
✅ Learning Lab with quizzes
✅ Trade Journal with AI review
✅ AI Chat Panel (requires API key)
✅ Dark/Light theme toggle
✅ Density toggle (Comfort/Compact)
✅ Cost tracking & budget limits

## 🔧 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

**AI Chat not working?**
- Make sure you've added your API key in Settings
- Check that you haven't exceeded your monthly budget
- Verify your API key is valid at https://console.anthropic.com/

**Styling looks broken?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Next Steps

### Phase 2 Enhancements (Coming Soon)
- Real-time news scraping
- RSS feed integration
- Brokerage API connections
- Google Calendar sync
- Browser extension for quick captures

### Customize Your Experience
- Add your own watchlist companies
- Set up custom alert preferences
- Adjust AI budget based on usage
- Explore different theme/density combinations

## 💡 Tips for Best Results

1. **Morning Routine**: Check Digest page at 5-6 AM PT for pre-market prep
2. **AI Chat**: Ask specific questions like "Explain why CPI affects tech stocks"
3. **Learning Lab**: Take daily quizzes to build investing knowledge
4. **Trade Journal**: Log every trade idea - AI review helps identify patterns

## 🆘 Need Help?

- Check the README.md for detailed documentation
- Review console errors in browser DevTools (F12)
- Verify all files are in place (check package.json exists)

## 🎯 Success Checklist

- [ ] Extracted zip file
- [ ] Ran `npm install` successfully
- [ ] Server started with `npm run dev`
- [ ] App loaded in browser
- [ ] Added API key in Settings
- [ ] Tested AI chat with a question
- [ ] Explored all pages

Happy investing! 📈
