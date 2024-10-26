const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  hour = hour % 12;
  if (hour < 10) hour = "0" + hour;
  if (minute < 10) minute = "0" + minute;
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

// Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=ZQ9N4ZYPL7QAMM9FXJK9XJKXM&contentType=json`
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      
      // Set background based on weather condition
      setWeatherBasedBackground(today.icon);

      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

// function to update Forecast and highlight current time's card
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  const currentHour = new Date().getHours();
  const currentDate = new Date().toISOString().split('T')[0];

  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }

  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");

    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }

    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }

    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = unit === "f" ? "°F" : "°C";

    if (type === "day" && i === currentHour) {
      card.classList.add("highlight-today");
    }
    if (type === "week" && data[day].datetime.split('T')[0] === currentDate) {
      card.classList.add("highlight-today");
    }

    card.innerHTML = `
      <h2 class="day-name">${dayName}</h2>
      <div class="card-icon">
        <img src="${iconSrc}" class="day-icon" alt="" />
      </div>
      <div class="day-temp">
        <h2 class="temp">${dayTemp}</h2>
        <span class="temp-unit">${tempUnit}</span>
      </div>
    `;

    weatherCards.appendChild(card);
    day++;
  }
}

// Highlight styling
const style = document.createElement('style');
style.innerHTML = `
  .highlight-today {
    background-color: rgba(255, 255, 0, 0.3);
    border: 2px solid yellow;
    box-shadow: 0 0 10px rgba(255, 255, 0, 0.6);
    transform: scale(1.05);
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(style);

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "icons/sun/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "icons/moon/15.png";
  } else if (condition === "rain") {
    return "icons/rain/39.png";
  } else if (condition === "clear-day") {
    return "icons/sun/26.png";
  } else if (condition === "clear-night") {
    return "icons/moon/10.png";
  } else {
    return "icons/sun/26.png";
  }
}

// Fallback function for weather-based background
function setWeatherBasedBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";

  if (condition === "partly-cloudy-day") {
    bg = "images/pc.jpg";
  } else if (condition === "partly-cloudy-night") {
    bg = "images/pcn.jpg";
  } else if (condition === "rain") {
    bg = "images/rain.jpg";
  } else if (condition === "clear-day") {
    bg = "images/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "images/cn.jpg";
  } else {
    bg = "images/default.jpg"; // Default background image
  }

  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

// get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  return hour + ":" + minute + " " + ampm;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uv) {
  if (uv < 3) {
    uvText.innerText = "Low";
  } else if (uv < 6) {
    uvText.innerText = "Moderate";
  } else if (uv < 8) {
    uvText.innerText = "High";
  } else {
    uvText.innerText = "Very High";
  }
}

// Convert Celsius to Fahrenheit
function celciusToFahrenheit(temp) {
  return Math.round((temp * 9) / 5 + 32);
}

// Update humidity status
function updateHumidityStatus(humidityValue) {
  if (humidityValue < 30) {
    humidityStatus.innerText = "Low";
  } else if (humidityValue < 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// Update visibility status
function updateVisibiltyStatus(visibilityValue) {
  if (visibilityValue > 10) {
    visibilityStatus.innerText = "Good";
  } else {
    visibilityStatus.innerText = "Poor";
  }
}

// Update air quality status
function updateAirQualityStatus(windDirection) {
  if (windDirection === "North") {
    airQualityStatus.innerText = "Good";
  } else {
    airQualityStatus.innerText = "Moderate";
  }
}

// Event listeners
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentCity = search.value;
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});

celciusBtn.addEventListener("click", () => {
  currentUnit = "c";
  tempUnit.forEach((unit) => (unit.innerText = "°C"));
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});

fahrenheitBtn.addEventListener("click", () => {
  currentUnit = "f";
  tempUnit.forEach((unit) => (unit.innerText = "°F"));
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});

hourlyBtn.addEventListener("click", () => {
  hourlyorWeek = "hourly";
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});

weekBtn.addEventListener("click", () => {
  hourlyorWeek = "week";
  getWeatherData(currentCity, currentUnit, hourlyorWeek);
});

// Initial call to get weather data for a default city
getWeatherData("New York", currentUnit, hourlyorWeek);
