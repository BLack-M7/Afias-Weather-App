async function getWeather() {
  const city = document.getElementById("city").value;

  //getting an apiKey
  const apiKey = "da5cc509bc967933cf9f957a7a06eb9b";
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  //get weather and turn it to javaScript object
  const currentResponse = await fetch(currentWeatherUrl);
  const currentData = await currentResponse.json();

  //inserting the values into our html
  const cityCurrent = document.getElementById("city-name");
  cityCurrent.textContent = `${currentData.name}, ${currentData.sys.country}`;
  const currentTemperature = document.getElementById("temperature");
  currentTemperature.textContent = `Temperature: ${currentData.main.temp}°C`;
  const currentDescription = document.getElementById("description");
  currentDescription.textContent = `Description: ${currentData.weather[0].description}`;

  //getting weather icon
  const currentIcon = currentData.weather[0].icon;
  const picture = document.querySelector(".weather-container #icon");
  picture.style.background = "none";
  picture.innerHTML = `<img src="https://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="weather icon">`;
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
