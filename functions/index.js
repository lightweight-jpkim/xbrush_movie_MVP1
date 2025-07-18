const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// Slack webhook proxy function
exports.slackNotify = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            // Get the Slack webhook URL from Firestore
            const admin = require('firebase-admin');
            if (!admin.apps.length) {
                admin.initializeApp();
            }
            
            const db = admin.firestore();
            const configDoc = await db.collection('config').doc('slack').get();
            
            if (!configDoc.exists) {
                console.error('Slack webhook not configured in Firestore');
                return res.status(500).json({ error: 'Slack not configured' });
            }
            
            const { webhookUrl } = configDoc.data();
            
            // Forward the request to Slack
            const fetch = require('node-fetch');
            const slackResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body)
            });

            if (!slackResponse.ok) {
                throw new Error(`Slack API error: ${slackResponse.status}`);
            }

            // Return success
            return res.status(200).json({ success: true });
            
        } catch (error) {
            console.error('Error sending to Slack:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });
});