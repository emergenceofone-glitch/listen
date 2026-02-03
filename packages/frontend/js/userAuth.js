/**
 * Project Emergence - User Authentication & Profile System
 * Google OAuth integration and user management for the web interface
 */

// User Authentication System
class UserAuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.isAuthenticated = false;
        this.authEndpoint = '/api/auth';

        this.init();
    }

    async init() {
        // Check for existing session
        const savedToken = localStorage.getItem('sessionToken');
        if (savedToken) {
            await this.validateSession(savedToken);
        }

        this.updateUI();
    }

    async loginWithGoogle() {
        try {
            // Generate state for CSRF protection
            const state = this.generateState();

            // Construct Google OAuth URL
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id'; // Use env var if available
            const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback');
            const scope = encodeURIComponent('openid email profile');

            const authUrl = `https://accounts.google.com/oauth/authorize?` +
                `client_id=${clientId}&` +
                `redirect_uri=${redirectUri}&` +
                `response_type=code&` +
                `scope=${scope}&` +
                `state=${state}&` +
                `access_type=offline`;

            // Store state for validation
            sessionStorage.setItem('oauth_state', state);

            // Redirect to Google OAuth
            window.location.href = authUrl;

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleOAuthCallback(code, state) {
        try {
            // Validate state parameter
            const savedState = sessionStorage.getItem('oauth_state');
            if (state !== savedState) {
                throw new Error('Invalid state parameter');
            }

            // Exchange code for session token
            const response = await fetch(`${this.authEndpoint}/google/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, state })
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const authData = await response.json();

            // Store session token and user data
            this.sessionToken = authData.session_token;
            this.currentUser = authData.user;
            this.isAuthenticated = true;

            localStorage.setItem('sessionToken', this.sessionToken);
            sessionStorage.removeItem('oauth_state');

            this.updateUI();
            this.showNotification(`Welcome, ${this.currentUser.name}!`, 'success');

            // Redirect to dashboard
            this.navigateToDashboard();

        } catch (error) {
            console.error('OAuth callback error:', error);
            this.showNotification('Authentication failed. Please try again.', 'error');
            window.location.href = '/';
        }
    }

    async logout() {
        try {
            if (this.sessionToken) {
                await fetch(`${this.authEndpoint}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': this.sessionToken ? `Bearer ${this.sessionToken}` : '',
                        'Content-Type': 'application/json',
                    }
                });
            }

            // Clear local data
            this.currentUser = null;
            this.sessionToken = null;
            this.isAuthenticated = false;

            localStorage.removeItem('sessionToken');
            sessionStorage.removeItem('oauth_state');

            this.updateUI();
            this.showNotification('Logged out successfully', 'success');

        } catch (error) {
            console.error('Logout error:', error);
            // Clear data anyway
            this.currentUser = null;
            this.sessionToken = null;
            this.isAuthenticated = false;
            localStorage.removeItem('sessionToken');
            this.updateUI();
        }
    }

    async validateSession(token) {
        try {
            const response = await fetch(`${this.authEndpoint}/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const sessionData = await response.json();
                this.currentUser = sessionData.user;
                this.sessionToken = token;
                this.isAuthenticated = true;
            } else {
                // Token invalid, clear it
                localStorage.removeItem('sessionToken');
                this.isAuthenticated = false;
            }

        } catch (error) {
            console.error('Session validation error:', error);
            localStorage.removeItem('sessionToken');
            this.isAuthenticated = false;
        }
    }

    generateState() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    updateUI() {
        const authSection = document.getElementById('auth-section');
        const userProfile = document.getElementById('user-profile');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.isAuthenticated && this.currentUser) {
            // Show authenticated state
            if (authSection) authSection.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'flex';
                userProfile.querySelector('.user-name').textContent = this.currentUser.name;
                userProfile.querySelector('.user-avatar').src = this.currentUser.picture || '/images/default-avatar.png';
            }
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';

            // Update personalized content
            this.updatePersonalizedContent();

        } else {
            // Show unauthenticated state
            if (authSection) authSection.style.display = 'block';
            if (userProfile) userProfile.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';
        }
    }

    updatePersonalizedContent() {
        // Update UI elements with user-specific data
        const consciousnessLevel = this.currentUser.profile_data?.consciousness_level || 'emergent';
        const userMetrics = document.querySelectorAll('.user-metric');

        userMetrics.forEach(metric => {
            const metricType = metric.dataset.metric;
            if (metricType === 'consciousness-level') {
                metric.textContent = consciousnessLevel.charAt(0).toUpperCase() + consciousnessLevel.slice(1);
            }
        });

        // Load user's saved analyses and writing sessions
        this.loadUserData();
    }

    async loadUserData() {
        if (!this.isAuthenticated) return;

        try {
            // Load user's analysis history
            const analysisResponse = await fetch(`${this.authEndpoint}/user/analysis-history`, {
                headers: {
                    'Authorization': this.sessionToken ? `Bearer ${this.sessionToken}` : '',
                    'Content-Type': 'application/json',
                }
            });

            if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                this.updateAnalysisHistory(analysisData);
            }

            // Load user's writing sessions
            const writingResponse = await fetch(`${this.authEndpoint}/user/writing-sessions`, {
                headers: {
                    'Authorization': this.sessionToken ? `Bearer ${this.sessionToken}` : '',
                    'Content-Type': 'application/json',
                }
            });

            if (writingResponse.ok) {
                const writingData = await writingResponse.json();
                this.updateWritingProgress(writingData);
            }

        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    updateAnalysisHistory(analysisData) {
        // Update analysis history in the UI
        const historyContainer = document.getElementById('analysis-history');
        if (historyContainer && analysisData.length > 0) {
            const recentAnalyses = analysisData.slice(0, 5);
            historyContainer.innerHTML = recentAnalyses.map(analysis => `
                <div class="analysis-item">
                    <span class="analysis-text">${analysis.text_preview}</span>
                    <span class="analysis-date">${new Date(analysis.timestamp).toLocaleDateString()}</span>
                </div>
            `).join('');
        }
    }

    updateWritingProgress(writingData) {
        // Update writing progress in the UI
        const progressContainer = document.getElementById('writing-progress');
        if (progressContainer) {
            const totalWords = writingData.reduce((sum, session) => sum + session.word_count, 0);
            const totalSessions = writingData.length;

            progressContainer.innerHTML = `
                <div class="progress-stat">
                    <span class="stat-label">Words Written</span>
                    <span class="stat-value">${totalWords.toLocaleString()}</span>
                </div>
                <div class="progress-stat">
                    <span class="stat-label">Writing Sessions</span>
                    <span class="stat-value">${totalSessions}</span>
                </div>
            `;
        }
    }

    navigateToDashboard() {
        // Navigate to main dashboard after login
        const currentSection = document.querySelector('.content-section.active');
        if (currentSection && currentSection.id !== 'overview-section') {
            // Stay on current section if user was working there
            return;
        }

        // Navigate to overview/dashboard
        if (typeof showSection === 'function') {
            showSection('overview');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize user authentication
const userAuth = new UserAuthManager();

// Handle OAuth callback
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
        // Handle the OAuth callback
        userAuth.handleOAuthCallback(code, state);

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    // Handle OAuth callback if present
    handleOAuthCallback();

    // Set up login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            userAuth.loginWithGoogle();
        });
    }

    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            userAuth.logout();
        });
    }

    // Set up profile dropdown
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');

    if (profileDropdown && profileMenu) {
        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            profileMenu.style.display = 'none';
        });
    }
});

// CSS animations for notifications
const notificationStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// Add notification styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Export for use in other modules
window.userAuth = userAuth;
