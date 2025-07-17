/**
 * Serverless function for Slack notifications
 * Deploy this to Vercel, Netlify Functions, or similar
 * 
 * Environment variable needed: SLACK_WEBHOOK_URL
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get webhook URL from environment variable
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    
    if (!SLACK_WEBHOOK_URL) {
        console.error('SLACK_WEBHOOK_URL not configured');
        return res.status(500).json({ error: 'Slack integration not configured' });
    }

    try {
        // Forward the request to Slack
        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        if (!slackResponse.ok) {
            throw new Error(`Slack API error: ${slackResponse.status}`);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Slack notification error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to send notification' 
        });
    }
}