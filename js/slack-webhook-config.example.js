/**
 * Slack Webhook Configuration Example
 * 
 * IMPORTANT SECURITY STEPS:
 * 1. Copy this file to 'slack-webhook-config.js'
 * 2. Add your webhook URL
 * 3. NEVER commit slack-webhook-config.js to git (it's in .gitignore)
 * 4. Upload slack-webhook-config.js manually to your server
 * 
 * To get a webhook URL:
 * 1. Go to https://api.slack.com/apps
 * 2. Select your app
 * 3. Go to "Incoming Webhooks"
 * 4. Click "Add New Webhook to Workspace"
 * 5. Copy the webhook URL
 */

// DO NOT commit this file with a real webhook URL
window.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';