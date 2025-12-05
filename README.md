# Afias Weather App

This is a small weather application that fetches current weather and a 4-day forecast.

Features added:

- Current weather (temperature, description, icon)
- 4-day forecast (icons and daily temps)
- Alert banner for imminent precipitation / low visibility / harmattan (dust/sand)
- "Don't notify again for this city" option (stored in localStorage)
- Per-day detail modal when clicking forecast days
- Local Node proxy server to hide OpenWeather API key (`server.js`).

Running the static app locally:

1. Start a simple static server in the project folder (for example):

```cmd
python -m http.server 8000
```

2. Open `http://localhost:8000` in your browser.

Using the Node proxy (recommended for production and to hide API key):

1. Install dependencies:

```cmd
npm install
```

2. Set your OpenWeather API key in the environment:

Windows (cmd):

```cmd
set OPENWEATHER_API_KEY=your_api_key_here
npm start
```

Linux/macOS:

```bash
export OPENWEATHER_API_KEY=your_api_key_here
npm start
```

This will start `server.js` on port 3000 by default and expose `/api/weather` and `/api/forecast` endpoints for the frontend to use.

Notes:

- The Node proxy is optional. The frontend can call OpenWeather directly if you prefer, but keeping the key in frontend is insecure.
- Browser notifications require permission; the app asks when an alert appears.
