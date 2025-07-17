# Simple Slack Setup Instructions

## Step 1: Get New Webhook URL

1. Go to https://api.slack.com/apps
2. Click on your app "XBrush_ModelRegister_Approval" 
3. Click "Incoming Webhooks" in the left menu
4. Click "Add New Webhook to Workspace"
5. Choose the channel (e.g., #xbrush-models)
6. Copy the webhook URL (looks like: https://hooks.slack.com/services/T.../B.../...)

## Step 2: Create Config File Locally

1. Copy `js/slack-webhook-config.example.js` to `js/slack-webhook-config.js`
2. Open `js/slack-webhook-config.js` in a text editor
3. Replace the example URL with your new webhook URL:
   ```javascript
   window.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/YOUR_ACTUAL_WEBHOOK_URL';
   ```
4. Save the file

## Step 3: Upload to Your Server

Since this file is gitignored (for security), you need to manually upload it:

1. Use FTP/SFTP or your hosting control panel
2. Upload `js/slack-webhook-config.js` to the same location on your server
3. Make sure it's in the `js/` folder

## Step 4: Test It

1. Go to your live website
2. Open browser console (F12)
3. Type: `window.slackNotifier.testConnection()`
4. Check your Slack channel for the test message

## Important Security Notes

- NEVER commit the webhook URL to Git
- The file `slack-webhook-config.js` is in .gitignore
- If the webhook gets exposed again, Slack will revoke it
- You'll need to upload this file manually to each environment (local, staging, production)

## How It Works

- When someone registers a model → Sends to #xbrush-models
- When a movie is created → Sends to #xbrush-movies  
- When errors occur → Sends to #xbrush-errors

## Troubleshooting

If notifications aren't working:
1. Check browser console for errors
2. Verify the webhook URL is correct
3. Make sure the config file is uploaded to server
4. Try the test command to debug