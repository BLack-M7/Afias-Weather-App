# Afias Weather App

This is a small weather application that fetches current weather and a 4-day forecast.

**Features:**
- Current weather (temperature, description, icon)
- 4-day forecast (icons and daily temps)
- Alert banner for imminent precipitation / low visibility / harmattan (dust/sand)
- "Don't notify again for this city" option (stored in localStorage)
- Per-day detail modal when clicking forecast days
- Secure backend proxy to hide OpenWeather API key

## Local Development

### Static (Python HTTP server):

```cmd
python -m http.server 8000
```
Open `http://localhost:8000`

### With Node proxy:

```cmd
npm install
set OPENWEATHER_API_KEY=your_api_key_here
npm start
```
Open `http://localhost:3000`

## Vercel Deployment

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) and link your repo
3. Add environment variable in Vercel dashboard:
   - Name: `OPENWEATHER_API_KEY`
   - Value: Your OpenWeatherMap API key
4. Deploy

The app will automatically use serverless functions for `/api/weather` and `/api/forecast` endpoints, keeping your API key secure.

## Notes

- Browser notifications require user permission
- Frontend respects per-city "don't notify" preferences in localStorage
- Vercel will handle all serverless routing automatically via `vercel.json`
