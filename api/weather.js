// Browser-compatible weather API client
async function fetchWeatherData(city) {
  // Note: For production, you should use a backend proxy to hide your API key
  // This demonstrates a direct call to OpenWeatherMap API

  const apiKey = "2bc70d527ee1fbcc925e2b568725e615"; // Replace with your actual OpenWeatherMap API key

  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      console.error("API Response not OK:", response.status, data);
      throw new Error(data.message || `Error: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error("Weather API error details:", err.message, err);
    throw err;
  }
}

// Ensure the function is available on the window object when loaded in the browser
try {
  if (typeof window !== "undefined") {
    window.fetchWeatherData = fetchWeatherData;
  }
} catch (e) {
  // ignore (non-browser environments)
}
