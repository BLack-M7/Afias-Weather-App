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

  const url = `/api/weather?city=${encodeURIComponent(city)}`;

  showLoader(true);
  try {
    const res = await fetch(url);
    showLoader(false);

    if (!res.ok) {
      if (res.status === 404) {
        showError("City not found. Please check the city name.");
        return;
      }
      const text = await res.text().catch(() => "");
      throw new Error(`Server error: ${res.status} ${text}`);
    }

    const data = await res.json();

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
  } catch (err) {
    console.error(err);
    showLoader(false);
    showError("Unable to fetch weather data. Please try again later.");
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
