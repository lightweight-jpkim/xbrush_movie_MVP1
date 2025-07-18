/**
 * Slack Notifier using Firebase for webhook storage
 * This keeps the webhook URL in Firestore instead of in code
 */

class SlackNotifier {
    constructor() {
        this.webhookUrl = null;
        this.enabled = false;
        this.loading = true;
        
        // Load webhook from Firebase
        this.loadWebhookFromFirebase();
        
        this.channels = {
            general: '#general',
            models: '#xbrush-models',
            movies: '#xbrush-movies',
            errors: '#xbrush-errors'
        };
        this.botName = 'xBrush Bot';
        this.botIcon = ':robot_face:';
    }

    async loadWebhookFromFirebase() {
        try {
            // Make sure Firebase is initialized
            if (!window.firebaseDB) {
                console.warn('Firebase not initialized yet, retrying...');
                setTimeout(() => this.loadWebhookFromFirebase(), 1000);
                return;
            }

            // Get webhook URL from Firestore
            const configDoc = await window.firebaseDB
                .collection('config')
                .doc('slack')
                .get();

            if (configDoc.exists) {
                const data = configDoc.data();
                this.webhookUrl = data.webhookUrl;
                this.enabled = !!this.webhookUrl;
                console.log('Slack webhook loaded from Firebase');
            } else {
                console.warn('Slack webhook not found in Firebase. Add it at: config/slack/webhookUrl');
            }
        } catch (error) {
            console.error('Failed to load Slack webhook from Firebase:', error);
        } finally {
            this.loading = false;
        }
    }

    async sendNotification(options) {
        // Wait for webhook to load
        if (this.loading) {
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!this.loading) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        if (!this.enabled || !this.webhookUrl) {
            console.log('Slack notifications disabled (no webhook URL)', options);
            return { success: true, skipped: true };
        }

        try {
            const payload = {
                text: options.text,
                channel: options.channel || this.channels.general,
                username: options.username || this.botName,
                icon_emoji: options.icon_emoji || this.botIcon,
                attachments: options.attachments || []
            };

            let response;
            
            // GitHub Pages requires a different approach due to CORS
            if (window.location.hostname.includes('github.io')) {
                console.log('GitHub Pages detected - using alternative method');
                
                // For GitHub Pages, we need to use a server-side solution
                // Option 1: Use your own server endpoint
                // Option 2: Use a service like Zapier or IFTTT
                // Option 3: Use Netlify Functions or Vercel
                
                console.warn('Slack webhooks cannot be called directly from GitHub Pages due to CORS policy.');
                console.log('Notification that would be sent:', payload);
                
                // Return success but mark as skipped
                return { success: true, skipped: true, reason: 'CORS restriction on GitHub Pages' };
            } else {
                // Direct call for proper web hosting
                response = await fetch(this.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                throw new Error(`Slack API error: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
            return { success: false, error: error.message };
        }
    }

    // ... rest of methods remain the same ...
    
    async notifyModelRegistration(modelData) {
        const attachment = {
            color: 'good',
            pretext: '새로운 모델이 등록되었습니다! 🎉',
            fields: [
                {
                    title: '모델명',
                    value: modelData.personalInfo?.name || 'Unknown',
                    short: true
                },
                {
                    title: '카테고리',
                    value: (modelData.personalInfo?.categories || []).join(', ') || 'None',
                    short: true
                },
                {
                    title: '등록일시',
                    value: new Date().toLocaleString('ko-KR'),
                    short: true
                },
                {
                    title: '상태',
                    value: modelData.status || 'pending',
                    short: true
                }
            ],
            footer: 'XBrush Model Registration',
            ts: Math.floor(Date.now() / 1000)
        };

        return this.sendNotification({
            text: `새 모델 등록: ${modelData.personalInfo?.name || 'Unknown'}`,
            channel: this.channels.models || '#xbrush-models',
            attachments: [attachment]
        });
    }

    async notifyApprovalRequest(modelData) {
        const attachment = {
            color: 'warning',
            pretext: '⚠️ 모델 승인이 필요합니다!',
            fields: [
                {
                    title: '모델명',
                    value: modelData.personalInfo?.name || 'Unknown',
                    short: true
                },
                {
                    title: '모델 ID',
                    value: modelData.id || 'N/A',
                    short: true
                },
                {
                    title: '요청 유형',
                    value: modelData.approvalType || '신규 등록',
                    short: true
                },
                {
                    title: '요청일시',
                    value: new Date().toLocaleString('ko-KR'),
                    short: true
                }
            ],
            footer: 'XBrush Admin Approval',
            ts: Math.floor(Date.now() / 1000)
        };

        return this.sendNotification({
            text: `🚨 승인 요청: ${modelData.personalInfo?.name || 'Unknown'}`,
            channel: this.channels.models || '#xbrush-models',
            icon_emoji: ':warning:',
            attachments: [attachment]
        });
    }

    async notifyMovieCreation(movieData) {
        const attachment = {
            color: '#667eea',
            pretext: '🎬 새로운 동영상이 생성되었습니다!',
            fields: [
                {
                    title: '프로젝트명',
                    value: movieData.projectName || 'Untitled',
                    short: true
                },
                {
                    title: '모델',
                    value: movieData.modelName || 'Unknown',
                    short: true
                },
                {
                    title: '동영상 유형',
                    value: movieData.videoType || 'Unknown',
                    short: true
                },
                {
                    title: '생성일시',
                    value: new Date().toLocaleString('ko-KR'),
                    short: true
                }
            ],
            footer: 'XBrush Movie Creator',
            ts: Math.floor(Date.now() / 1000)
        };

        return this.sendNotification({
            text: `새 동영상: ${movieData.projectName || 'Untitled'}`,
            channel: this.channels.movies || '#xbrush-movies',
            icon_emoji: ':movie_camera:',
            attachments: [attachment]
        });
    }

    async notifyError(errorData) {
        const attachment = {
            color: 'danger',
            pretext: '❌ 오류가 발생했습니다!',
            fields: [
                {
                    title: '오류 위치',
                    value: errorData.location || 'Unknown',
                    short: true
                },
                {
                    title: '오류 유형',
                    value: errorData.type || 'Unknown',
                    short: true
                },
                {
                    title: '오류 메시지',
                    value: errorData.message || 'No message',
                    short: false
                },
                {
                    title: '사용자',
                    value: errorData.userId || 'Anonymous',
                    short: true
                },
                {
                    title: '발생일시',
                    value: new Date().toLocaleString('ko-KR'),
                    short: true
                }
            ],
            footer: 'XBrush Error Monitor',
            ts: Math.floor(Date.now() / 1000)
        };

        return this.sendNotification({
            text: `❌ 오류: ${errorData.message || 'Unknown error'}`,
            channel: this.channels.errors || '#xbrush-errors',
            icon_emoji: ':x:',
            attachments: [attachment]
        });
    }

    async testConnection() {
        return this.sendNotification({
            text: '🔧 XBrush Slack 연동 테스트 메시지입니다.',
            channel: '#general',
            icon_emoji: ':wrench:',
            attachments: [{
                color: 'good',
                text: '연동이 정상적으로 작동합니다! ✅',
                footer: 'XBrush Notification System',
                ts: Math.floor(Date.now() / 1000)
            }]
        });
    }

    /**
     * Helper method to set webhook URL in Firebase (run once in console)
     */
    static async setWebhookInFirebase(webhookUrl) {
        if (!window.firebaseDB) {
            console.error('Firebase not initialized');
            return;
        }

        try {
            await window.firebaseDB
                .collection('config')
                .doc('slack')
                .set({
                    webhookUrl: webhookUrl,
                    updatedAt: new Date().toISOString()
                });
            console.log('Webhook URL saved to Firebase successfully');
        } catch (error) {
            console.error('Failed to save webhook URL:', error);
        }
    }
}

// Create singleton instance
window.slackNotifier = new SlackNotifier();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlackNotifier;
}