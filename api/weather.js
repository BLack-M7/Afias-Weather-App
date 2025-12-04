export default async function handler(req, res) {
  const { city } = req.query || {};
  if (!city)
    return res.status(400).json({ error: "Missing `city` query parameter" });

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Server misconfiguration: OPENWEATHER_API_KEY not set" });
  }

  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  try {
    const r = await fetch(endpoint);
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json(data);
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error", err);
    return res
      .status(502)
      .json({ error: "Unable to reach OpenWeather service" });
  }
}
