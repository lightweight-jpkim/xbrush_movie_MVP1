# Secure Slack Integration Setup

After the webhook was revoked by Slack for being exposed, here's the secure setup process.

## Option 1: Using Vercel (Recommended)

1. **Create new Slack webhook**
   - Go to https://api.slack.com/apps
   - Create new app or use existing
   - Add Incoming Webhook
   - Copy the new webhook URL

2. **Deploy API endpoint to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Set environment variable in Vercel**
   ```bash
   vercel env add SLACK_WEBHOOK_URL
   # Paste your webhook URL when prompted
   ```

4. **Update the proxy endpoint**
   Edit `js/slack-notifier-secure.js`:
   ```javascript
   this.proxyEndpoint = 'https://your-project.vercel.app/api/slack-notify';
   ```

## Option 2: Using Netlify Functions

1. **Create `netlify.toml`**
   ```toml
   [build]
     functions = "api"
   ```

2. **Set environment variable**
   - Go to Netlify dashboard
   - Settings → Environment variables
   - Add `SLACK_WEBHOOK_URL`

3. **Deploy and update endpoint**

## Option 3: Using Firebase Functions

1. **Initialize Firebase Functions**
   ```bash
   firebase init functions
   ```

2. **Create function**
   ```javascript
   const functions = require('firebase-functions');
   
   exports.slackNotify = functions.https.onRequest(async (req, res) => {
       // Similar code to api/slack-notify.js
   });
   ```

3. **Set config**
   ```bash
   firebase functions:config:set slack.webhook_url="YOUR_WEBHOOK_URL"
   ```

## Security Benefits

- Webhook URL never exposed in client code
- Can add rate limiting on server
- Can add authentication if needed
- Can filter/validate messages server-side

## Testing

After setup, test with:
```javascript
window.slackNotifier.testConnection()
```

## Important Notes

- NEVER commit webhook URLs to git
- Always use environment variables
- Rotate webhooks periodically
- Monitor for unauthorized usage