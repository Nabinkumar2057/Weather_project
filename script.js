// map
// Initialize map
var map = L.map("map").setView([28.3949, 84.124], 8);

// OSM layer
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});
osm.addTo(map);

// Create marker
var marker = L.marker([28.3949, 84.124]).addTo(map);

// Function to fetch geocode from the API
async function fetchGeocode(address) {
  const apiKey = "6753e908b9a15112192152sxa31b70f"; // Your geocoding API key
  const apiUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(
    address
  )}&api_key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data && data.length > 0) {
      return data[0];
    } else {
      // alert('Place not found');
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
  }
  return null;
}

// Handle search button click
// $('#search-btn').click(async function () {
//     var place = $('#map-input').val().trim();
//     if (!place) {
//         alert('Please enter a place name');
//         return;
//     }

//     const geocode = await fetchGeocode(place);
//     if (geocode) {
//         const { lat, lon, display_name } = geocode;
//         map.setView([lat, lon], 8);
//         marker.setLatLng([lat, lon])
//             .bindPopup(`Place: ${display_name}<br>Latitude: ${lat}<br>Longitude: ${lon}`)
//             .openPopup();
//     }
// });
// map
document.getElementById("city").addEventListener("input", function () {
  var city = this.value;
  getWeather(city);
});

async function getWeather() {
  try {
    var city = document.getElementById("city").value;

    //
    const geocode = await fetchGeocode(city);
    if (geocode) {
      const { lat, lon, display_name } = geocode;
      map.setView([lat, lon], 8);
      marker
        .setLatLng([lat, lon])
        .bindPopup(
          `Place: ${display_name}<br>Latitude: ${lat}<br>Longitude: ${lon}`
        )
        .openPopup();
    }
    //
    console.log("Şəhər adı:", city);

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: city,
          appid: "54a57bc234ad752a4f59e59cd372201d",
          units: "metric",
        },
      }
    );
    const currentTemperature = response.data.list[0].main.temp;

    document.querySelector(".weather-temp").textContent =
      Math.round(currentTemperature) + "ºC";

    const forecastData = response.data.list;

    const dailyForecast = {};
    forecastData.forEach((data) => {
      const day = new Date(data.dt * 1000).toLocaleDateString("en-US", {
        weekday: "long",
      });
      if (!dailyForecast[day]) {
        dailyForecast[day] = {
          minTemp: data.main.temp_min,
          maxTemp: data.main.temp_max,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          icon: data.weather[0].icon,
        };
      } else {
        dailyForecast[day].minTemp = Math.min(
          dailyForecast[day].minTemp,
          data.main.temp_min
        );
        dailyForecast[day].maxTemp = Math.max(
          dailyForecast[day].maxTemp,
          data.main.temp_max
        );
      }
    });

    document.querySelector(".date-dayname").textContent =
      new Date().toLocaleDateString("en-US", { weekday: "long" });

    const date = new Date().toUTCString();
    const extractedDateTime = date.slice(5, 16);
    document.querySelector(".date-day").textContent =
      extractedDateTime.toLocaleString("en-US");

    const currentWeatherIconCode =
      dailyForecast[new Date().toLocaleDateString("en-US", { weekday: "long" })]
        .icon;
    const weatherIconElement = document.querySelector(".weather-icon");
    weatherIconElement.innerHTML = getWeatherIcon(currentWeatherIconCode);

    document.querySelector(".location").textContent = response.data.city.name;
    document.querySelector(".weather-desc").textContent = dailyForecast[
      new Date().toLocaleDateString("en-US", { weekday: "long" })
    ].description
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    document.querySelector(".humidity .value").textContent =
      dailyForecast[new Date().toLocaleDateString("en-US", { weekday: "long" })]
        .humidity + " %";
    document.querySelector(".wind .value").textContent =
      dailyForecast[new Date().toLocaleDateString("en-US", { weekday: "long" })]
        .windSpeed + " m/s";

    const dayElements = document.querySelectorAll(".day-name");
    const tempElements = document.querySelectorAll(".day-temp");
    const iconElements = document.querySelectorAll(".day-icon");

    dayElements.forEach((dayElement, index) => {
      const day = Object.keys(dailyForecast)[index];
      const data = dailyForecast[day];
      dayElement.textContent = day;
      tempElements[index].textContent = `${Math.round(
        data.minTemp
      )}º / ${Math.round(data.maxTemp)}º`;
      iconElements[index].innerHTML = getWeatherIcon(data.icon);
    });
  } catch (error) {
    console.error("Məlumat alınarkən səhv baş verdi:", error.message);
  }
}

function getWeatherIcon(iconCode) {
  const iconBaseUrl = "https://openweathermap.org/img/wn/";
  const iconSize = "@2x.png";
  return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}

document.addEventListener("DOMContentLoaded", function () {
  getWeather();
  setInterval(getWeather, 900000);
});

function navigateToNewPage() {
  window.location.href = "developers.html"; // Replace with the URL of your new page
}
