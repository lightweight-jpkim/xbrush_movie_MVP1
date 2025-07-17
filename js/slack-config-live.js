/**
 * Live Slack Configuration
 * This file is committed to git and will be deployed automatically
 * For local development, create slack-config.js instead
 */

window.SLACK_CONFIG = {
    // Slack webhook settings
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/services/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',
    
    // Channel settings
    channels: {
        general: '#general',
        models: '#xbrush-models',
        movies: '#xbrush-movies',
        errors: '#xbrush-errors'
    },
    
    // Bot settings
    botName: 'xBrush Bot',
    botEmoji: ':robot_face:',
    
    // Notification settings
    notifications: {
        modelRegistration: true,
        modelApproval: true,
        movieCreation: true,
        errors: true
    }
};