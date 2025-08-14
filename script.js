class FootballWidget {
    constructor() {
        this.apiKey = localStorage.getItem('footballApiKey') || '';
        this.currentLeague = '39'; // Premier League default
        this.currentTab = 'live';
        this.refreshInterval = null;
        this.refreshRate = 30000; // 30 seconds for live matches
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStoredApiKey();
        this.switchTab('live');
        
        if (this.apiKey) {
            this.startAutoRefresh();
            this.loadMatches();
        }
    }

    setupEventListeners() {
        // API Key management
        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });

        document.getElementById('apiKey').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // League selector
        document.getElementById('leagueSelect').addEventListener('change', (e) => {
            this.currentLeague = e.target.value;
            this.loadMatches();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadMatches();
        });

        // Modal functionality
        const modal = document.getElementById('matchModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    loadStoredApiKey() {
        if (this.apiKey) {
            document.getElementById('apiKey').value = this.apiKey;
            document.querySelector('.api-config').style.display = 'none';
        }
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter your API key');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('footballApiKey', apiKey);
        
        // Hide API config section
        document.querySelector('.api-config').style.display = 'none';
        
        // Start loading data
        this.startAutoRefresh();
        this.loadMatches();
        
        // Show success message
        this.showNotification('API key saved successfully!', 'success');
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update sections
        document.querySelectorAll('.matches-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}Matches`).classList.add('active');
        
        // Load matches for the current tab
        this.loadMatches();
    }

    async loadMatches() {
        if (!this.apiKey) {
            this.showError('Please configure your API key first');
            return;
        }

        const loadingId = `loading${this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1)}`;
        const listId = `${this.currentTab}MatchesList`;
        
        this.showLoading(loadingId, true);

        try {
            let endpoint = '';
            const today = new Date().toISOString().split('T')[0];
            
            switch (this.currentTab) {
                case 'live':
                    endpoint = `fixtures?live=all&league=${this.currentLeague}&season=2024`;
                    break;
                case 'today':
                    endpoint = `fixtures?date=${today}&league=${this.currentLeague}&season=2024`;
                    break;
                case 'upcoming':
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowStr = tomorrow.toISOString().split('T')[0];
                    endpoint = `fixtures?from=${tomorrow.toISOString().split('T')[0]}&to=${new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&league=${this.currentLeague}&season=2024`;
                    break;
            }

            const matches = await this.fetchFromAPI(endpoint);
            this.displayMatches(matches, listId);
            this.updateLastRefresh();
            
        } catch (error) {
            this.showError(`Failed to load ${this.currentTab} matches: ${error.message}`);
        } finally {
            this.showLoading(loadingId, false);
        }
    }

    async fetchFromAPI(endpoint) {
        const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/${endpoint}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': this.apiKey,
                'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please wait before making more requests.');
            } else if (response.status === 403) {
                throw new Error('Invalid API key or insufficient permissions.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();
        return data.response || [];
    }

    displayMatches(matches, containerId) {
        const container = document.getElementById(containerId);
        
        if (!matches || matches.length === 0) {
            container.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-calendar-times"></i>
                    <p>No ${this.currentTab} matches found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = matches.map(match => this.createMatchCard(match)).join('');
        
        // Add click listeners for match details
        container.querySelectorAll('.match-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showMatchDetails(matches[index]);
            });
        });
    }

    createMatchCard(match) {
        const fixture = match.fixture;
        const teams = match.teams;
        const goals = match.goals;
        const score = match.score;
        
        const isLive = fixture.status.short === '1H' || fixture.status.short === '2H' || fixture.status.short === 'HT' || fixture.status.short === 'ET';
        const isFinished = fixture.status.short === 'FT' || fixture.status.short === 'AET' || fixture.status.short === 'PEN';
        
        let statusClass = 'status-scheduled';
        let statusText = 'Scheduled';
        
        if (isLive) {
            statusClass = 'status-live';
            statusText = `${fixture.status.elapsed || 0}'`;
        } else if (isFinished) {
            statusClass = 'status-finished';
            statusText = 'Finished';
        }

        const matchTime = new Date(fixture.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="match-card ${isLive ? 'live' : ''}" data-fixture-id="${fixture.id}">
                <div class="match-header">
                    <div class="match-time">${matchTime}</div>
                    <div class="match-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="match-teams">
                    <div class="team home">
                        <img src="${teams.home.logo}" alt="${teams.home.name}" class="team-logo" onerror="this.style.display='none'">
                        <span class="team-name">${teams.home.name}</span>
                    </div>
                    
                    <div class="match-score">
                        <span>${goals.home !== null ? goals.home : '-'}</span>
                        <span class="score-separator">:</span>
                        <span>${goals.away !== null ? goals.away : '-'}</span>
                    </div>
                    
                    <div class="team away">
                        <img src="${teams.away.logo}" alt="${teams.away.name}" class="team-logo" onerror="this.style.display='none'">
                        <span class="team-name">${teams.away.name}</span>
                    </div>
                </div>
                
                ${fixture.status.short !== 'NS' ? this.createEventsPreview(match) : ''}
            </div>
        `;
    }

    createEventsPreview(match) {
        // This would normally fetch events from the API, but for preview we'll show basic info
        return `
            <div class="match-events">
                <div class="events-title">Match Info</div>
                <div class="event">
                    <i class="fas fa-map-marker-alt event-icon"></i>
                    <span class="event-player">${match.fixture.venue.name || 'Unknown Venue'}</span>
                </div>
            </div>
        `;
    }

    async showMatchDetails(match) {
        const modal = document.getElementById('matchModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        modalTitle.textContent = `${match.teams.home.name} vs ${match.teams.away.name}`;
        
        // Show loading in modal
        modalContent.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> Loading match details...
            </div>
        `;
        
        modal.style.display = 'block';
        
        try {
            // Fetch detailed match events
            const events = await this.fetchFromAPI(`fixtures/events?fixture=${match.fixture.id}`);
            const statistics = await this.fetchFromAPI(`fixtures/statistics?fixture=${match.fixture.id}`);
            
            modalContent.innerHTML = this.createDetailedMatchView(match, events, statistics);
        } catch (error) {
            modalContent.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load match details: ${error.message}</p>
                </div>
            `;
        }
    }

    createDetailedMatchView(match, events, statistics) {
        const eventsHtml = events && events.length > 0 ? 
            events.map(event => this.createEventElement(event)).join('') :
            '<p>No events available</p>';
            
        return `
            <div class="detailed-match">
                <div class="match-summary">
                    <div class="team-detail">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="team-logo">
                        <h3>${match.teams.home.name}</h3>
                        <div class="score">${match.goals.home !== null ? match.goals.home : '-'}</div>
                    </div>
                    
                    <div class="vs-separator">
                        <div class="match-status">${match.fixture.status.long}</div>
                        <div class="match-time">${new Date(match.fixture.date).toLocaleString()}</div>
                    </div>
                    
                    <div class="team-detail">
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="team-logo">
                        <h3>${match.teams.away.name}</h3>
                        <div class="score">${match.goals.away !== null ? match.goals.away : '-'}</div>
                    </div>
                </div>
                
                <div class="match-details-tabs">
                    <h4>Match Events</h4>
                    <div class="events-list">
                        ${eventsHtml}
                    </div>
                </div>
                
                <div class="venue-info">
                    <h4>Venue Information</h4>
                    <p><strong>Stadium:</strong> ${match.fixture.venue.name || 'Unknown'}</p>
                    <p><strong>City:</strong> ${match.fixture.venue.city || 'Unknown'}</p>
                    <p><strong>Referee:</strong> ${match.fixture.referee || 'Unknown'}</p>
                </div>
            </div>
        `;
    }

    createEventElement(event) {
        let iconClass = 'fas fa-info-circle';
        let eventClass = '';
        
        switch (event.type) {
            case 'Goal':
                iconClass = 'fas fa-futbol goal-icon';
                eventClass = 'goal-icon';
                break;
            case 'Card':
                iconClass = event.detail === 'Yellow Card' ? 'fas fa-square card-yellow' : 'fas fa-square card-red';
                eventClass = event.detail === 'Yellow Card' ? 'card-yellow' : 'card-red';
                break;
            case 'subst':
                iconClass = 'fas fa-exchange-alt substitution';
                eventClass = 'substitution';
                break;
        }
        
        return `
            <div class="event ${eventClass}">
                <i class="${iconClass} event-icon"></i>
                <span class="event-minute">${event.time.elapsed}'</span>
                <span class="event-player">${event.player.name} ${event.assist ? `(Assist: ${event.assist.name})` : ''}</span>
                <span class="event-team">${event.team.name}</span>
            </div>
        `;
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        
        this.refreshInterval = setInterval(() => {
            if (this.currentTab === 'live') {
                this.loadMatches();
            }
        }, this.refreshRate);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoading(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    updateLastRefresh() {
        const now = new Date().toLocaleTimeString();
        document.getElementById('lastUpdate').textContent = `Last updated: ${now}`;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .detailed-match .team-detail {
        text-align: center;
        flex: 1;
    }
    
    .detailed-match .team-detail .score {
        font-size: 48px;
        font-weight: bold;
        color: #1e3c72;
        margin: 10px 0;
    }
    
    .detailed-match .match-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
    }
    
    .detailed-match .vs-separator {
        text-align: center;
        padding: 0 20px;
    }
    
    .detailed-match .events-list {
        max-height: 300px;
        overflow-y: auto;
        margin-top: 15px;
    }
    
    .detailed-match .venue-info {
        margin-top: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
    }
`;
document.head.appendChild(style);

// Initialize the widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FootballWidget();
});
