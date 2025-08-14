# Live Football Match Widget

A modern, real-time football match widget that displays live scores, match events, and detailed information for your favorite leagues. Works perfectly on laptops and iPads with automatic updates.

## Features

- **Real-time Updates**: Automatically refreshes every 30 seconds for live matches
- **Multiple Leagues**: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
- **Live Match Events**: Goals, cards, substitutions with player names and match minutes
- **Match Details**: Click any match for detailed information including venue, referee, and full event timeline
- **Responsive Design**: Works seamlessly on desktop, laptop, and iPad
- **Three View Modes**: 
  - Live Matches (currently playing)
  - Today's Matches (all matches for today)
  - Upcoming Matches (next 7 days)
- **Modern UI**: Clean, professional interface with smooth animations

## Setup Instructions

### 1. Get Your API Key

1. Visit [API-Football on RapidAPI](https://rapidapi.com/api-sports/api/api-football)
2. Sign up for a free account (500 requests per day)
3. Subscribe to the API-Football service
4. Copy your API key from the dashboard

### 2. Install the Widget

1. Download or clone this repository to your computer
2. Open the `football-widget` folder
3. Double-click `index.html` to open in your web browser

### 3. Configure the Widget

1. When you first open the widget, you'll see an API configuration section
2. Paste your API key into the input field
3. Click "Save" - the API configuration will be hidden and stored locally
4. The widget will immediately start loading live matches

### 4. Using the Widget

- **Switch Leagues**: Use the dropdown to select different leagues
- **Browse Match Types**: Click the tabs (Live, Today's, Upcoming) to see different match sets
- **View Match Details**: Click on any match card to see detailed information
- **Auto Refresh**: Live matches automatically refresh every 30 seconds
- **Manual Refresh**: Click the refresh button in the header at any time

## File Structure

```
football-widget/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality and API integration
└── README.md          # This documentation file
```

## Browser Compatibility

- Chrome, Firefox, Safari, Edge (modern versions)
- Works on desktop computers, laptops, and iPads
- Requires internet connection for API data

## API Usage

The widget uses the API-Football service with these endpoints:
- Live matches: `/fixtures?live=all&league={id}&season=2024`
- Today's matches: `/fixtures?date={today}&league={id}&season=2024`
- Upcoming matches: `/fixtures?from={tomorrow}&to={week}&league={id}&season=2024`
- Match events: `/fixtures/events?fixture={id}`
- Match statistics: `/fixtures/statistics?fixture={id}`

## Troubleshooting

### No matches showing
- Check your internet connection
- Verify your API key is correctly entered
- Ensure you haven't exceeded your API rate limit (500 requests/day on free tier)

### API key errors
- Double-check your API key from RapidAPI dashboard
- Make sure you're subscribed to API-Football service
- Try refreshing the page and re-entering the key

### Widget not updating
- Check browser console for error messages
- Verify your API key hasn't expired
- Try manually refreshing with the refresh button

## Customization

### Adding More Leagues
Edit the `leagueSelect` options in `index.html`:
```html
<option value="LEAGUE_ID">League Name</option>
```

### Changing Refresh Rate
Modify the `refreshRate` property in `script.js` (value in milliseconds):
```javascript
this.refreshRate = 30000; // 30 seconds
```

### Styling Changes
All visual customization can be done in `styles.css`. The design uses CSS Grid and Flexbox for responsive layouts.



<img width="1578" height="501" alt="Screenshot 2025-08-14 170841 (1)" src="https://github.com/user-attachments/assets/14589c21-f6af-43b2-86aa-718a014bab03" />


## Performance Notes

- The free API tier allows 500 requests per day
- Live matches refresh every 30 seconds
- Widget stores API key locally in browser storage
- Images are cached by the browser for better performance

## Support

For issues with the widget:
1. Check browser console for error messages
2. Verify API key is valid and not rate-limited
3. Ensure stable internet connection
4. Try clearing browser cache and reloading

For API-related issues, visit the [API-Football documentation](https://rapidapi.com/api-sports/api/api-football).

---

Enjoy your live football match tracking! ⚽
