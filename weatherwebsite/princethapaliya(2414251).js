/**PrinceThapaliya(2414251) */
// Set the OpenWeatherMap API key and default city
const apiKey = "c4f44909178001c5d1c9d0add3948cdb";
let defaultCity = "Yangon";

// Get references to HTML elements
const weatherDiv = document.getElementById("weather");
const body = document.body;

// Function to get the current time in HH:mm format
function getCurrentTime() {
  const currentDate = new Date();
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;
  return currentTime;
}

// Function to get the current time for a specific city using its name
function getCurrentTimeForCity(city) {
  // Construct the API URL for the city's weather data
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  // Fetch data from the API
  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      // Calculate the local time for the city using its timezone offset
      const timezoneOffset = data.timezone;
      const currentDate = new Date();
      const currentUTC =
        currentDate.getTime() + currentDate.getTimezoneOffset() * 60000;
      const cityTime = currentUTC + timezoneOffset * 1000;
      const cityDate = new Date(cityTime);

      // Return the local time in HH:mm format
      return cityDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      return "Time Unavailable";
    });
}

// Function to get and display weather information for a specific city
function getWeather(city) {
  // Fetch weather data from the OpenWeatherMap API
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      // Extract relevant information from the weather data
      const tempInCelsius = (data.main.temp - 273.15).toFixed(2);
      const rainfall = data.rain ? data.rain["1h"] : 0;
      const snowfall = data.snow ? data.snow["1h"] : 0;
      const weatherCondition = data.weather[0].description;
      const weatherIconCode = data.weather[0].icon;
      const pressure = data.main.pressure[0];

      // Clear the existing content in the weatherDiv
      weatherDiv.innerHTML = "";

      // Create an image element for the weather icon
      const weatherIcon = document.createElement("img");
      weatherIcon.src = `http://openweathermap.org/img/wn/${weatherIconCode}.png`;
      weatherIcon.alt = "Weather Icon";
      weatherIcon.style.width = "100px";

      // Append the weather icon to the weatherDiv
      weatherDiv.appendChild(weatherIcon);
      const canvas = document.createElement("canvas");
      canvas.width = weatherIcon.width;
      canvas.height = weatherIcon.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(weatherIcon, 0, 0, weatherIcon.width, weatherIcon.height);
      const base64Icon = canvas.toDataURL();

      // Get the current time for the city and update the weatherDiv content
      getCurrentTimeForCity(city).then((cityTime) => {
        weatherDiv.innerHTML += `
          <h2>${data.name}</h2>
          <p>Time: ${cityTime}</p>
          <p>Temperature: ${tempInCelsius}°C</p>
          <p>Rainfall: ${rainfall} mm</p>
          <p>Snowfall: ${snowfall} mm</p>
          <p>Weather Condition: ${weatherCondition}</p>
          <p>Wind Speed: ${data.wind.speed} m/s</p> 
          <p>Humidity: ${data.main.humidity}%</p>
          <p>Pressure: ${data.main.pressure}%</p>
        `;
        saveWeatherDataToServer(
          data.name,
          tempInCelsius,
          weatherCondition,
          data.wind.speed,
          data.main.humidity,
          base64Icon
        );
      });
    })
    .catch(() => {
      // Display an error message if data for the city is unavailable
      weatherDiv.innerHTML = `<p>No data for this city.</p>`;
    });
}
function saveWeatherDataToServer(
  cityName,
  tempInCelsius,
  weatherCondition,
  windSpeed,
  humidity,
  base64Icon
) {
  const data = {
    cityName: cityName,
    tempInCelsius: tempInCelsius,
    weatherCondition: weatherCondition,
    humidity: humidity,
    windSpeed: windSpeed,
    base64Icon: base64Icon,
  };

  fetch("weather.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error saving data:", error);
    });
}
// Get weather information for the default city when the page loads
getWeather(defaultCity);

document.getElementById("search-button").addEventListener("click", () => {
  searchWeather();
});

document.getElementById("city").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});

function searchWeather() {
  const city = document.getElementById("city").value;
  if (city) {
    defaultCity = city;
    getWeather(city);
  } else {
    // Display a message if no city is entered
    weatherDiv.innerHTML = `<p>Please enter a city.</p>`;
  }
}

document.getElementById("past-search-button").addEventListener("click", () => {
  const cityName = document.getElementById("city").value.trim();
  if (cityName) {
    fetch(`weather.php?city=${encodeURIComponent(cityName)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid content type. Expected JSON.");
        }
        return response.json();
      })
      .then((data) => {
        displayPastWeatherData(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        pastWeatherDataDiv.innerHTML = `<p>Error fetching cached data: ${error.message}</p>`;
      });
  } else {
    // If no city name is provided, display an error message
    pastWeatherDataDiv.innerHTML = "<p>No Past Data Found for this City .</p>";
  }
});

const pastWeatherDataDiv = document.getElementById("past-weather-data");

function displayPastWeatherData(data) {
  pastWeatherDataDiv.innerHTML = ""; // Clear previous data

  const daysMap = new Map(); // Map to store data for each day

  // Iterate through each entry in the data
  data.forEach((entry) => {
    const date = new Date(entry.Date);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });

    if (!daysMap.has(day) || entry.Priority < daysMap.get(day).Priority) {
      daysMap.set(day, entry);
    }
  });

  // Iterate through the map to display the data for each day
  daysMap.forEach((entry) => {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("weather-entry");

    // Format the date
    const formattedDate = new Date(entry.Date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    entryDiv.innerHTML = `
          <p>Date: ${formattedDate}</p>
          <p>City: ${entry.City}</p>
          <p>Temperature: ${entry.Temperature} °C</p>
          <p>Humidity: ${entry.Humidity} %</p>
          <p>Wind Speed: ${entry.WindSpeed} m/s</p>`;

    // Create an <img> element for the weather icon
    const weatherIcon = document.createElement("img");
    weatherIcon.src = entry.Icon; // Assuming entry.Icon contains the full data URI
    weatherIcon.alt = "Weather Icon";
    weatherIcon.style.width = "50px"; // Adjust size as needed

    // Append the weather icon to the entryDiv
    entryDiv.appendChild(weatherIcon);
    pastWeatherDataDiv.appendChild(entryDiv);
  });
}

// Update the entered city when a past entry is clicked
pastWeatherDataDiv.addEventListener("click", (event) => {
  const selectedEntry = event.target.closest(".weather-entry");
  if (selectedEntry) {
    enteredCity = selectedEntry
      .querySelector("p:nth-child(2)")
      .textContent.split(":")[1]
      .trim();
    displayPastWeatherData(data);
  }
});
