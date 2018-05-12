/* eslint-env browser, jquery */

//Integrate Inputs as Latitude and Longitude


//Version 1 Open Weather Map

var apiKey = "8ed3b9d51c85a6de3c56df1582820966";

// BEGIN PUBLIC API

function sunriseAndSunset(params) { // eslint-disable-line no-unused-vars
  currentWeather({
    lat: params.lat,
    long: params.long,
    callback: function(response) {
      params.callback({
        sunrise: new Date(response.sys.sunrise * 1000),
        sunset: new Date(response.sys.sunset * 1000)
      });
    }
  });
}

function currentWeather(params) {
  var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + params.lat + "&lon=" + params.long + "&APPID=" + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    params.callback(response);
  });
}

function weatherAtTime(params) { // eslint-disable-line no-unused-vars
  currentWeather({
    lat: params.lat,
    long: params.long,
    callback: function(currentResponse) {
      var queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + params.lat + "&lon=" + params.long + "&APPID=" + apiKey;

      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(forecastResponse) {
        params.callback(getWeatherAtTime(params.time, currentResponse, forecastResponse));
      });
    }
  });
}

function generateWeatherListItem(weather) { // eslint-disable-line no-unused-vars
  //Significant Figures
  function precise(x) {
    if (x === 0) {
      return 0;
    } else {
      return Number.parseFloat(x).toPrecision(4);
    }
  }

  var fahrenheit = precise(weather.temp * 9 / 5 - 459.67) + '°F';
  var windMPH = precise(weather.windSpeed / 1609.344 * 3600) + ' mph';
  var windDirection = weather.windDir;
  var windDirName = function() {
    if (windDirection <= 22.5) {
      return "N";
    } else if (windDirection <= 67.5) {
      return "NE";
    } else if (windDirection <= 112.5) {
      return "E";
    } else if (windDirection <= 157.5) {
      return "SE";
    } else if (windDirection <= 202.5) {
      return "S";
    } else if (windDirection <= 247.5) {
      return "SW";
    } else if (windDirection <= 292.5) {
      return "W";
    } else if (windDirection <= 337.5) {
      return "NW";
    } else {
      return "N";
    }
  }();

  var windDirString = windDirName + ' at ' + precise(weather.windDir) + '°';

  var precip = precise(weather.precip / 25.4) + ' inches over 3-hour period';

  var li = $('<li>');

  li.append($('<div>').addClass('weather-time').text(weather.time.toLocaleTimeString()));
  li.append($('<img>').addClass('weather-icon').attr('src', weather.icon));
  li.append($('<div>').addClass('weather-description').text(weather.description));
  li.append($('<div>').addClass('weather-temp').text(fahrenheit));
  li.append($('<div>').addClass('weather-wind-speed').text(windMPH));
  li.append($('<div>').addClass('weather-wind-direction').text(windDirString));
  li.append($('<div>').addClass('weather-precip').text(precip));

  return li;
}

// END PUBLIC API

function getWeatherAtTime(time, currentResponse, forecastResponse) {
  var rawTime = time.getTime();

  var forecast = forecastResponse.list;

  for (var i = 0; i < forecast.length; i++) {
    var eachWeather = forecast[i];
    var nextTime = parseFloat(eachWeather.dt) * 1000;

    if (nextTime > rawTime) {
      if (i == 0) {
        var currentTime = parseFloat(currentResponse.dt);

        if (rawTime < currentTime * 1000) {
          return extrapolate(currentResponse, currentResponse, currentTime);
        } else {
          return extrapolate(currentResponse, eachWeather, rawTime);
        }
      }

      return extrapolate(forecast[i - 1], eachWeather, rawTime);
    }
  }

  return null;
}

function extrapolate(prevWeather, nextWeather, time) {
  var prevTime = parseFloat(prevWeather.dt) * 1000;
  var nextTime = parseFloat(nextWeather.dt) * 1000;

  if (time < prevTime) {
    return extrapolate(prevWeather, prevWeather, prevTime);
  }

  if (time > nextTime) {
    return extrapolate(nextWeather,  nextWeather, nextTime);
  }

  var closestWeather = (time - prevTime > nextTime - time) ? nextWeather : prevWeather;
  var fraction = (nextWeather.dt === prevWeather.dt) ? 0 : ((time - prevTime) / (nextTime - prevTime));

  function estimate(closure) {
    var prevValue = parseFloat(closure(prevWeather));
    var nextValue = parseFloat(closure(nextWeather));

    return prevValue + (fraction * (nextValue - prevValue));
  }

  var iconURL = 'http://openweathermap.org/img/w/' + closestWeather.weather[0].icon + '.png';
  var description = closestWeather.weather[0].description;
  var temp = estimate(function(w) { return w.main.temp; });
  var windSpeed = estimate(function(w) { return w.wind.speed; });
  var windDir = estimate(function(w) { return w.wind.deg; });
  var humidity = estimate(function(w) { return w.main.humidity; });
  var seaLevel = estimate(function(w) { return w.main.sea_level; });

  function parsePrecip(precip) {
    if (!precip || !precip['3h']) {
      return 0;
    } else {
      return parseFloat(precip['3h']);
    }
  }

  return {
    time: new Date(time),
    icon: iconURL,
    description: description,
    temp: temp,
    windSpeed: windSpeed,
    windDir: windDir,
    humidity: humidity,
    seaLevel: seaLevel,
    precip: parsePrecip(nextWeather.rain) + parsePrecip(nextWeather.snow)
  };
}

//Hourly Forecast Information
//lat,lon,time of day
//Will it be raining at this time of day?
//Find Parameters to describe hourly information and description
//Version 2 Google Weather API
