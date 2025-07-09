/**
 * xBrush User Analytics System
 * Tracks user interactions and provides analytics dashboard
 */

class AnalyticsTracker {
    constructor() {
        this.storageKey = 'xbrush_analytics';
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        
        this.init();
    }

    /**
     * Initialize analytics tracking
     */
    init() {
        this.loadStoredData();
        this.startTracking();
        this.createFloatingButton();
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Load existing analytics data from storage
     */
    loadStoredData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.storedData = JSON.parse(stored);
            } else {
                this.storedData = {
                    sessions: [],
                    totalEvents: 0,
                    createdAt: Date.now()
                };
            }
        } catch (error) {
            console.warn('Failed to load analytics data:', error);
            this.storedData = {
                sessions: [],
                totalEvents: 0,
                createdAt: Date.now()
            };
        }
    }

    /**
     * Start tracking user interactions
     */
    startTracking() {
        // Track clicks on major UI elements
        document.addEventListener('click', (e) => {
            this.trackEvent('click', {
                element: e.target.tagName,
                className: e.target.className,
                id: e.target.id,
                text: e.target.textContent ? e.target.textContent.substring(0, 50) : ''
            });
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                formId: e.target.id,
                formName: e.target.name || 'unnamed'
            });
        });

        // Track step navigation
        document.addEventListener('stepChanged', (e) => {
            this.trackEvent('step_change', {
                fromStep: e.detail.from,
                toStep: e.detail.to,
                stepName: e.detail.stepName || `Step ${e.detail.to}`
            });
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('visibility_change', {
                hidden: document.hidden
            });
        });
    }

    /**
     * Track an event
     */
    trackEvent(eventType, data = {}) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            data: data,
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100)
        };

        this.events.push(event);
        this.saveData();
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Save analytics data to localStorage
     */
    saveData() {
        try {
            const currentSession = {
                id: this.sessionId,
                startTime: this.startTime,
                endTime: Date.now(),
                events: this.events,
                duration: Date.now() - this.startTime,
                eventCount: this.events.length
            };

            // Update or add current session
            const existingIndex = this.storedData.sessions.findIndex(s => s.id === this.sessionId);
            if (existingIndex >= 0) {
                this.storedData.sessions[existingIndex] = currentSession;
            } else {
                this.storedData.sessions.push(currentSession);
            }

            this.storedData.totalEvents = this.storedData.sessions.reduce((sum, session) => sum + session.eventCount, 0);
            this.storedData.lastUpdated = Date.now();

            localStorage.setItem(this.storageKey, JSON.stringify(this.storedData));
        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }

    /**
     * Create floating analytics button
     */
    createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'analytics-button';
        button.innerHTML = '📊';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            transition: all 0.3s ease;
            font-size: 20px;
            user-select: none;
        `;

        // Hover effect
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });

        button.addEventListener('click', () => {
            this.showDashboard();
        });

        document.body.appendChild(button);
    }

    /**
     * Show analytics dashboard
     */
    showDashboard() {
        const dashboard = this.createDashboard();
        document.body.appendChild(dashboard);
    }

    /**
     * Create analytics dashboard
     */
    createDashboard() {
        const overlay = document.createElement('div');
        overlay.id = 'analytics-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const dashboard = document.createElement('div');
        dashboard.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
        `;

        const stats = this.generateStats();
        dashboard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #2d3748;">📊 사용자 분석 대시보드</h2>
                <button id="close-dashboard" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #2b6cb0;">${stats.totalSessions}</div>
                    <div style="color: #4a5568; font-size: 14px;">총 세션</div>
                </div>
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #38a169;">${stats.totalEvents}</div>
                    <div style="color: #4a5568; font-size: 14px;">총 이벤트</div>
                </div>
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #d69e2e;">${stats.avgDuration}초</div>
                    <div style="color: #4a5568; font-size: 14px;">평균 세션 시간</div>
                </div>
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #9f7aea;">${stats.topEvent}</div>
                    <div style="color: #4a5568; font-size: 14px;">최다 이벤트</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin-bottom: 10px;">최근 활동</h3>
                <div style="background: #f7fafc; padding: 15px; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                    ${this.generateRecentActivity()}
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h3 style="color: #2d3748; margin-bottom: 10px;">이벤트 분포</h3>
                <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
                    ${this.generateEventDistribution()}
                </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="export-analytics" style="
                    background: #4299e1;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">📥 데이터 내보내기</button>
                <button id="clear-analytics" style="
                    background: #f56565;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">🗑️ 데이터 삭제</button>
            </div>
        `;

        overlay.appendChild(dashboard);

        // Event listeners
        dashboard.querySelector('#close-dashboard').addEventListener('click', () => {
            overlay.remove();
        });

        dashboard.querySelector('#export-analytics').addEventListener('click', () => {
            this.exportData();
        });

        dashboard.querySelector('#clear-analytics').addEventListener('click', () => {
            if (confirm('정말 모든 분석 데이터를 삭제하시겠습니까?')) {
                this.clearData();
                overlay.remove();
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        return overlay;
    }

    /**
     * Generate statistics
     */
    generateStats() {
        const sessions = this.storedData.sessions;
        const totalSessions = sessions.length;
        const totalEvents = this.storedData.totalEvents;
        const avgDuration = sessions.length > 0 ? 
            Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length / 1000) : 0;

        // Find most common event type
        const eventTypes = {};
        sessions.forEach(session => {
            session.events.forEach(event => {
                eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
            });
        });

        const topEvent = Object.keys(eventTypes).reduce((a, b) => 
            eventTypes[a] > eventTypes[b] ? a : b, 'click') || 'click';

        return {
            totalSessions,
            totalEvents,
            avgDuration,
            topEvent
        };
    }

    /**
     * Generate recent activity HTML
     */
    generateRecentActivity() {
        const recentEvents = this.events.slice(-10).reverse();
        return recentEvents.map(event => `
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 500;">${event.type}</span>
                <span style="color: #718096; font-size: 12px;">${new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
        `).join('') || '<div style="color: #a0aec0; text-align: center;">활동 없음</div>';
    }

    /**
     * Generate event distribution HTML
     */
    generateEventDistribution() {
        const eventTypes = {};
        this.storedData.sessions.forEach(session => {
            session.events.forEach(event => {
                eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
            });
        });

        return Object.entries(eventTypes)
            .sort(([,a], [,b]) => b - a)
            .map(([type, count]) => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span>${type}</span>
                    <span style="font-weight: bold;">${count}</span>
                </div>
            `).join('') || '<div style="color: #a0aec0; text-align: center;">데이터 없음</div>';
    }

    /**
     * Export analytics data
     */
    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            summary: this.generateStats(),
            sessions: this.storedData.sessions
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xbrush_analytics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Clear all analytics data
     */
    clearData() {
        localStorage.removeItem(this.storageKey);
        this.storedData = {
            sessions: [],
            totalEvents: 0,
            createdAt: Date.now()
        };
        this.events = [];
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();
});