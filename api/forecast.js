export default async function handler(req, res) {
  const { city } = req.query;
  if (!city)
    return res.status(400).json({ error: "Missing city query parameter" });

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    // Get current weather to extract coordinates
    const weatherEndpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;
    const weatherRes = await fetch(weatherEndpoint);
    const weatherData = await weatherRes.json();
    if (!weatherRes.ok) return res.status(weatherRes.status).json(weatherData);

    const lat = weatherData.coord?.lat;
    const lon = weatherData.coord?.lon;
    if (lat == null || lon == null)
      return res.status(500).json({ error: "No coordinates found" });

    // Fetch forecast using One Call API
    const forecastEndpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts,current&units=metric&appid=${apiKey}`;
    const forecastRes = await fetch(forecastEndpoint);
    const forecastData = await forecastRes.json();
    return res.status(forecastRes.status).json(forecastData);
  } catch (err) {
    console.error("Forecast proxy error:", err);
    return res.status(502).json({ error: "Unable to fetch forecast data" });
  }
}
