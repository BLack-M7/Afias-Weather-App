// Loader / Error helpers and weather fetch via serverless proxy
function showLoader(visible) {
  const loader = document.getElementById("loader");
  const err = document.getElementById("error-message");
  if (loader) {
    if (visible) {
      loader.classList.remove("hidden");
    } else {
      loader.classList.add("hidden");
    }
  }
  if (err && visible) err.classList.add("hidden");
}

// Inline browser-compatible weather API client (moved from api/weather.js)
async function fetchWeatherData(city) {
  const apiKey = "2bc70d527ee1fbcc925e2b568725e615"; // your OpenWeatherMap API key
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

    // Fetch forecast (daily) using One Call API with the coordinates
    try {
      const lat = data.coord && data.coord.lat;
      const lon = data.coord && data.coord.lon;
      if (lat != null && lon != null) {
        const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts,current&units=metric&appid=${apiKey}`;
        const fRes = await fetch(oneCallUrl);
        const fData = await fRes.json();
        if (fRes.ok && fData && Array.isArray(fData.daily)) {
          // attach the next 4 days (skip today's remaining) to the result
          data.forecast = fData.daily.slice(1, 5);
        } else {
          console.warn('Forecast not available', fRes.status, fData);

          // Fallback: some API keys cannot access One Call. Use the free 5-day /forecast endpoint as a fallback.
          try {
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
              city
            )}&units=metric&appid=${apiKey}`;
            const altRes = await fetch(forecastUrl);
            const altData = await altRes.json();
            if (altRes.ok && altData && Array.isArray(altData.list)) {
              // Group list items by date (local date) and pick a representative item (closest to 12:00) for each day
              const groups = {};
              altData.list.forEach((item) => {
                const d = new Date(item.dt * 1000);
                const key = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate();
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
              });

              // Build sorted dates excluding today
              const todayKey = (() => {
                const n = new Date();
                return n.getUTCFullYear() + '-' + (n.getUTCMonth() + 1) + '-' + n.getUTCDate();
              })();

              const keys = Object.keys(groups).sort((a, b) => new Date(a) - new Date(b));
              const nextDays = [];
              for (let k of keys) {
                if (k === todayKey) continue;
                const items = groups[k];
                // find item closest to 12:00 UTC
                let best = items[0];
                let bestDiff = Math.abs(new Date(items[0].dt * 1000).getUTCHours() - 12);
                for (let it of items) {
                  const diff = Math.abs(new Date(it.dt * 1000).getUTCHours() - 12);
                  if (diff < bestDiff) {
                    best = it;
                    bestDiff = diff;
                  }
                }
                // create a simplified forecast-like object
                nextDays.push({
                  dt: best.dt,
                  temp: { day: best.main && (best.main.temp ?? null) },
                  weather: best.weather,
                });
                if (nextDays.length === 4) break;
              }

              if (nextDays.length > 0) data.forecast = nextDays;
            } else {
              console.warn('Fallback forecast not available', altRes.status, altData);
            }
          } catch (altErr) {
            console.warn('Fallback forecast fetch failed', altErr);
          }
        }
      }
    } catch (ferr) {
      console.warn("Failed to fetch forecast:", ferr);
    }

    return data;
  } catch (err) {
    console.error("Weather API error details:", err.message || err, err);
    throw err;
  }
}

function showError(message) {
  const err = document.getElementById("error-message");
  if (err) {
    err.textContent = message;
    err.classList.remove("hidden");
  } else {
    alert(message);
  }
}

async function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  showLoader(true);
  try {
    const fetchFn =
      typeof fetchWeatherData === "function"
        ? fetchWeatherData
        : window.fetchWeatherData;
    if (typeof fetchFn !== "function")
      throw new Error(
        "Weather client not available (fetchWeatherData not found)"
      );
    const data = await fetchFn(city);
    showLoader(false);

    const cityCurrent = document.getElementById("city-name");
    if (cityCurrent)
      cityCurrent.textContent = `${data.name || city}${
        data.sys && data.sys.country ? ", " + data.sys.country : ""
      }`;

    const currentTemperature = document.getElementById("temperature");
    if (currentTemperature)
      currentTemperature.textContent = data.main
        ? `Temperature: ${data.main.temp}°C`
        : "Temperature: --°C";

    const currentDescription = document.getElementById("description");
    if (currentDescription)
      currentDescription.textContent =
        data.weather && data.weather[0]
          ? `Description: ${data.weather[0].description}`
          : "Description: --";

    const picture = document.querySelector(".weather-container #icon");
    if (picture) {
      picture.style.background = "none";
      if (data.weather && data.weather[0] && data.weather[0].icon) {
        const currentIcon = data.weather[0].icon;
        picture.innerHTML = `<img src="https://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="weather icon">`;
      } else {
        picture.innerHTML = "";
      }
    }

    // Render 4-day forecast if available
    if (data.forecast && Array.isArray(data.forecast)) {
      const days = document.querySelectorAll(".forecast .day");
      data.forecast.forEach((f, idx) => {
        const el = days[idx];
        if (!el) return;

        // weekday
        const weekday = el.querySelector(".weekday");
        if (weekday) {
          const date = new Date(f.dt * 1000);
          weekday.textContent = date.toLocaleDateString(undefined, {
            weekday: "short",
          });
        }

        // icon
        const picDiv =
          el.querySelector(".icon div") || el.querySelector("figure.icon div");
        if (picDiv) {
          if (f.weather && f.weather[0] && f.weather[0].icon) {
            const ic = f.weather[0].icon;
            picDiv.innerHTML = `<img src="https://openweathermap.org/img/wn/${ic}@2x.png" alt="icon">`;
          } else {
            picDiv.innerHTML = "";
          }
        }

        // temperature
        const tempEl = el.querySelector(".temp");
        if (tempEl && f.temp && (f.temp.day || f.temp.day === 0)) {
          tempEl.textContent = `${Math.round(f.temp.day)}°C`;
        }
      });
    }
  } catch (err) {
    console.error("getWeather error:", err);
    showLoader(false);
    const userMsg =
      err && err.message
        ? err.message
        : "Unable to fetch weather data. Please try again later.";
    showError(userMsg);
  }
}

function updateClock() {
  const now = new Date();

  //getting time
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");

  //getting date
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = days[now.getDay()];
  const dayNumber = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  //getting elements
  const newTime = document.getElementById("time");
  newTime.textContent = `${hour}:${minute}:${second}`;
  const newDate = document.getElementById("date");
  newDate.textContent = `${dayName}, ${dayNumber} ${month}, ${year}`;
}
setInterval(updateClock, 1000);
updateClock();
