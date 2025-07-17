/**
 * Slack Configuration Example
 * 
 * To use Slack notifications:
 * 1. Create a new Slack App at https://api.slack.com/apps
 * 2. Add an Incoming Webhook to your app
 * 3. Copy the webhook URL
 * 4. Create a copy of this file named 'slack-config.js'
 * 5. Replace the webhook URL with your actual webhook URL
 * 6. Never commit slack-config.js to version control
 */

// Example configuration - DO NOT USE THIS URL
window.SLACK_CONFIG = {
    // Replace this with your actual webhook URL
    webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    
    // Channel configurations (optional - can be overridden in webhook settings)
    channels: {
        modelRegistrations: '#model-registrations',
        approvals: '#approvals',
        movieCreations: '#movie-creations',
        errors: '#errors',
        general: '#general'
    },
    
    // Enable/disable notifications (useful for testing)
    enabled: true,
    
    // Bot appearance
    botName: 'XBrush Bot',
    botIcon: ':robot_face:'
};