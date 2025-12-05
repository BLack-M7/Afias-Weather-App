const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.warn(
    "Warning: OPENWEATHER_API_KEY not set. Proxy endpoints will fail without a valid key."
  );
}

app.get("/api/ping", (req, res) => res.json({ ok: true }));

app.get("/api/weather", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "Missing city" });
  if (!API_KEY)
    return res
      .status(500)
      .json({ error: "Server misconfigured: OPENWEATHER_API_KEY missing" });
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=metric`;
  try {
    const r = await fetch(endpoint);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    console.error("Proxy error", err);
    return res
      .status(502)
      .json({ error: "Unable to reach OpenWeather service" });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "Missing city" });
  if (!API_KEY)
    return res
      .status(500)
      .json({ error: "Server misconfigured: OPENWEATHER_API_KEY missing" });
  // First get coordinates
  try {
    const w = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );
    const wdata = await w.json();
    if (!w.ok) return res.status(w.status).json(wdata);
    const lat = wdata.coord && wdata.coord.lat;
    const lon = wdata.coord && wdata.coord.lon;
    if (lat == null || lon == null)
      return res.status(500).json({ error: "No coordinates" });

    const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts,current&units=metric&appid=${API_KEY}`;
    const f = await fetch(oneCallUrl);
    const fdata = await f.json();
    return res.status(f.status).json(fdata);
  } catch (err) {
    console.error("Proxy forecast error", err);
    return res
      .status(502)
      .json({ error: "Unable to reach OpenWeather service" });
  }
});

app.use(express.static("."));

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);
