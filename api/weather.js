// Vercel serverless function to proxy OpenWeatherMap API
export default async function handler(req, res) {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'Missing city query parameter' });

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({ error: 'Unable to fetch weather data' });
  }
}
