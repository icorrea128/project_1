/* eslint-env browser, jquery */
/* global addMarker */

var apiKey = "UgjDrOD0YPtuYzmTZnZTCFcjO";
var queryURL = "https://data.cityofchicago.org/resource/aavc-b2wj.json?$$app_token=" + apiKey;

function loadDivvyStations(radius, callback) { // eslint-disable-line no-unused-vars
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(data) {
    var divvyMarkers = [];

    $.each(data, function(i, eachDivvy) {
      console.log(eachDivvy.station_name + ' ' + eachDivvy.location.coordinates[1] + ' ' + eachDivvy.location.coordinates[0]);
      var marker = addMarker({
        name: eachDivvy.station_name,
        lat: eachDivvy.location.coordinates[1],
        long: eachDivvy.location.coordinates[0],
        radiusFromPath: radius
      });

      divvyMarkers.push(marker);
    });

    callback(divvyMarkers);
  });
}
