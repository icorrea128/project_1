/* eslint-env browser, jquery */
/* global initMap, setPath, addMarkers, hideMarkers, showMarkers, sunriseAndSunset, loadDivvyStations, getPositionAtTime, weatherAtTime, generateWeatherListItem */

var searchRadius = 600;     // meters
var weatherInterval = 3600; // seconds

var savedMarkers = {};

var queryStringVars = {};
var time;
var totalTime;

function initResultsPage() { // eslint-disable-line no-unused-vars
  var queryString = window.location.href;
  var argStart = queryString.indexOf('?');
  var argString = queryString.substring(argStart + 1);
  var args = argString.split('&');

  $.each(args, function(_, eachArg) {
    var sep = eachArg.indexOf('=');
    var key = eachArg.substring(0, sep);
    var value = eachArg.substring(sep + 1);

    queryStringVars[key]=value;
  });

  time = new Date(queryStringVars.time);

  initMap();

  setPath({
    startLat: queryStringVars.startLat,
    startLong: queryStringVars.startLong,
    endLat: queryStringVars.endLat,
    endLong: queryStringVars.endLong,
    time: time,
    callback: function(response) {
      totalTime = response.totalTime;
      populateWeatherField();
      setUpCheckBoxes();
    }
  });

  sunriseAndSunset({
    lat: queryStringVars.startLat,
    long: queryStringVars.startLong,
    callback: function(response) {
      $('#sunrise').text('Sunrise: ' + response.sunrise.toLocaleTimeString());
      $('#sunset').text('Sunset: ' + response.sunset.toLocaleTimeString());
    }
  });
}

function populateWeatherField() {
  var times = [];
  var weathers = [];

  for (var t = 0; t < totalTime; t += weatherInterval) {
    times.push(new Date(time.getTime() + t * 1000));
  }

  times.push(new Date(time.getTime() + totalTime * 1000));

  $.each(times, function() {
    weathers.push(null);
  });

  $.each(times, function(i, eachTime) {
    var pos = getPositionAtTime(eachTime);

    weatherAtTime({
      lat: pos.lat,
      long: pos.long,
      time: eachTime,
      callback: function(weather) {
        weathers[i] = generateWeatherListItem(weather);

        if (!weathers.includes(null)) {
          $('#weather-list').append(weathers);
        }
      }
    });
  });
}

function setUpCheckBoxes() {
  $('#convenience-stores:checkbox').change(function() {
    if (this.checked) {
      showConvenienceStores();
    } else {
      hideConvenienceStores();
    }
  });

  $('#divvy-stations:checkbox').change(function() {
    if (this.checked) {
      showDivvies();
    } else {
      hideDivvies();
    }
  });
}

function showConvenienceStores() {
  if (!savedMarkers.convenienceStores) {
    savedMarkers.convenienceStores = addMarkers({
      type: "convenience_store",
      radius: searchRadius
    });
  }

  showMarkers(savedMarkers.convenienceStores);
}

function hideConvenienceStores() {
  if (savedMarkers.convenienceStores) {
    hideMarkers(savedMarkers.convenienceStores);
  }
}

function showDivvies() {
  if (!savedMarkers.divvies) {
    loadDivvyStations(searchRadius, function(response) {
      savedMarkers.divvies = response;
    });
  } else {
    $.each(savedMarkers.divvies, function(_, eachDivvy) {
      showMarkers(eachDivvy);
    });
  }
}

function hideDivvies() {
  $.each(savedMarkers.divvies, function(_, eachDivvy) {
    hideMarkers(eachDivvy);
  });
}
