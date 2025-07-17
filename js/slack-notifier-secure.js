/**
 * Secure Slack Notification Service
 * Uses server-side proxy to hide webhook URL
 */

class SlackNotifier {
    constructor() {
        // Use a server endpoint instead of direct webhook
        this.proxyEndpoint = '/api/slack-notify';
        this.enabled = true;
        this.channels = {
            general: '#general',
            models: '#xbrush-models',
            movies: '#xbrush-movies',
            errors: '#xbrush-errors'
        };
        this.botName = 'xBrush Bot';
        this.botIcon = ':robot_face:';
        
        // Check if we're in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn('Slack notifications may not work in local development without a proxy server');
            this.enabled = false;
        }
    }

    /**
     * Send a notification through the server proxy
     */
    async sendNotification(options) {
        if (!this.enabled) {
            console.log('Slack notifications disabled');
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

            // Send through proxy endpoint
            const response = await fetch(this.proxyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
            
            // Fallback: Log to console in development
            if (window.location.hostname === 'localhost') {
                console.log('Would send to Slack:', options);
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * All other methods remain the same...
     */
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
            actions: [
                {
                    type: 'button',
                    text: '관리자 페이지로 이동',
                    url: `https://your-admin-panel.com/models/${modelData.id}`,
                    style: 'primary'
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
}

// Create singleton instance
window.slackNotifier = new SlackNotifier();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SlackNotifier;
}