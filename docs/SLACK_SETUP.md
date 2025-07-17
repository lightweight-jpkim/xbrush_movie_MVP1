# Slack Notification Setup Guide

This guide will help you set up Slack notifications for the XBrush Movie MVP application.

## Features

The application can send notifications to Slack for:
- New model registrations
- Model approval requests
- Movie creation completions
- System errors

## Setup Steps

### 1. Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Name your app (e.g., "XBrush Notifications")
5. Select your workspace

### 2. Create an Incoming Webhook

1. In your app settings, go to "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" to ON
3. Click "Add New Webhook to Workspace"
4. Select the channel where you want notifications (you can change this later)
5. Copy the webhook URL (it looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)

### 3. Configure the Application

1. Copy `js/slack-config.example.js` to `js/slack-config.js`:
   ```bash
   cp js/slack-config.example.js js/slack-config.js
   ```

2. Edit `js/slack-config.js` and replace the webhook URL:
   ```javascript
   window.SLACK_CONFIG = {
       webhookUrl: 'YOUR_WEBHOOK_URL_HERE',
       // ... other settings
   };
   ```

3. (Optional) Create separate channels for different notification types:
   - `#model-registrations` - New model signups
   - `#approvals` - Items requiring admin approval
   - `#movie-creations` - Completed video generations
   - `#errors` - System errors

### 4. Test the Integration

1. Open your browser's console on the application
2. Run: `window.slackNotifier.testConnection()`
3. Check your Slack channel for the test message

## Notification Types

### Model Registration
Sent when a new model completes registration:
```
🎉 새로운 모델이 등록되었습니다!
- 모델명: [Name]
- 카테고리: [Categories]
- 등록일시: [DateTime]
```

### Approval Request
Sent when admin approval is needed:
```
⚠️ 모델 승인이 필요합니다!
- 모델명: [Name]
- 모델 ID: [ID]
- 요청 유형: 신규 등록
```

### Movie Creation
Sent when a video is generated:
```
🎬 새로운 동영상이 생성되었습니다!
- 프로젝트명: [Project Name]
- 모델: [Model Name]
- 동영상 유형: [Type]
```

## Security Notes

- **Never commit `slack-config.js` to version control**
- The file is already in `.gitignore`
- Keep your webhook URL secret
- Regenerate the webhook if it's ever exposed

## Troubleshooting

### Notifications not sending
1. Check console for errors
2. Verify webhook URL is correct
3. Ensure `enabled: true` in config
4. Check Slack workspace permissions

### Wrong channel
- Update channel names in `slack-config.js`
- Or configure channel in Slack webhook settings

## Advanced Configuration

You can customize:
- Bot name and icon
- Channel mappings
- Enable/disable notifications
- Add custom notification types

See `js/slack-notifier.js` for available methods.