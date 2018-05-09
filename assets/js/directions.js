/* eslint-env browser, jquery */
/* global google, InfoBubble */

/* Requires the following JS libraries:
 * jQuery - http://code.jquery.com/jquery-3.3.1.min.js
 * Google Maps & Places - https://maps.googleapis.com/maps/api/js?key=AIzaSyDiPtzBkpdiRbstWywr5Vo2NPg1AiGUYVY&callback=initMap&libraries=places
 * InfoBubble - assets/js/infobubble.js (local)
 */

//var googleAPIKey = 'AIzaSyDiPtzBkpdiRbstWywr5Vo2NPg1AiGUYVY';
//var placesAPIKey = 'AIzaSyCNX_nJxlGhR195hMYMjgGLMchLGN_jv30';

var directionsService;
var directionsDisplay;
var placesService;

var map;

var routes;

// BEGIN PUBLIC API

/*
 * CSS Classes:
 *
 * map-info-bubble - InfoBubble when marker is clicked
 * map-info-content - main div for info bubble content
 * info-place-name - place name header in info bubble
 * info-place-address - place address header in info bubble
 *
 */

/**
 * Call this on page load to initialize internal data structures.
 */
function initMap() { // eslint-disable-line no-unused-vars
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(41.8735707,-87.650842);
  var mapOptions = {
    zoom:7,
    center: chicago
  };

  map = new google.maps.Map($('#bikemap')[0], mapOptions);
  placesService = new google.maps.places.PlacesService(map);
  directionsDisplay.setMap(map);
}

/**
 * @callback setPathCallback
 * @property {number} totalTime - total time of trip (in seconds)
 * @property {number} totalDistance - total distance travelled (in meters)
 */

/**
 * Calculate a route, and display it on the map.
 * @param {number} startLat - latitude of starting position
 * @param {number} startLong - longitude of starting position
 * @param {number} endLat - latitude of ending position
 * @param {number} endLong - longitude of ending position
 * @param {Date} time - start time of trip
 * @param {setPathCallback} - Callback. Don't use more functions until this returns
 */
function setPath(inputs) { // eslint-disable-line no-unused-vars
  $.each(['startLat', 'startLong', 'endLat', 'endLong', 'time'], function(_, eachName) {
    if (!inputs[eachName]) {
      logError("error: no value for " + eachName);
      return;
    }
  });

  calcRoute({
    start: new google.maps.LatLng(inputs.startLat, inputs.startLong),
    end: new google.maps.LatLng(inputs.endLat, inputs.endLong),
    time: inputs.time,
    callback: inputs.callback
  });
}

/**
 * @callback addMarkersCallback
 */

/**
 * Manually add a marker, specified by latitude and longitude.
 * @param {string} name - The name of the place.
 * @param {number} lat - Latitude of the place.
 * @param {number} long - Longitude of the place.
 * @param {string} [address] - Address of the place. Optional.
 */
function addMarker(inputs) { // eslint-disable-line no-unused-vars
  makeMarker({
    name: inputs.name,
    location: new google.maps.LatLng({ lat: inputs.lat, lng: inputs.long }),
    address: inputs.address
  });
}

/**
 * Add markers for places, searching either by name or by type.
 * Supports types listed here:
 * https://developers.google.com/places/supported_types
 * @param {string} [name] - Search for places by a name.
 * @param {string} [type] - Search for places of a certain type. Ignored if a name is specified.
 * @param {number} radius - Search at this distance from the route (in meters)
 */
function addMarkers(inputs) { // eslint-disable-line no-unused-vars
  var route = routes[0];

  if (!route) {
    logError('addMarkers called before any routes have been mapped');
    return;
  }

  var interestingIds = [];

  var addInterestingPlace = function(place) {
    var id = place.id;

    if (!interestingIds.includes(id)) {
      interestingIds.push(id);

      makeMarkerForPlace(place);
    }
  };

  var lastQueryDistance = 0;

  $.each(route.legs, function(_, eachLeg) {
    $.each(eachLeg.steps, function(__, eachStep) {
      lastQueryDistance += eachStep.distance.value;

      if (lastQueryDistance > inputs.radius) {
        findInterestingPlaces(eachStep.start_location, inputs, addInterestingPlace);
        lastQueryDistance = 0;
      }
    });
  });

  var endLocation = route.legs[route.legs.length - 1].end_location;
  findInterestingPlaces(endLocation, inputs, addInterestingPlace);
}

// END PUBLIC API

function makeMarkerForPlace(place) {
  makeMarker({
    name: place.name,
    location: place.geometry.location,
  });
}

function makeMarker(inputs) {
  var marker = new google.maps.Marker({
    map: map,
    title: inputs.name,
    position: inputs.location
  });

  marker.addListener('click', function() {
    var content = $('<div class="map-info-content">');

    content.append($('<h1 class="info-place-name">').text(inputs.name));

    if (inputs.address) {
      content.append($('<h2 class="info-place-address">').text(inputs.address));
    }

    var infoBubble = new InfoBubble({
      map: map,
      content: content[0],
      position: inputs.location
    });

    $(infoBubble.c).addClass('map-info-bubble');

    infoBubble.open();
  });
}

function logError(error) {
  console.log(error); // eslint-disable-line no-console
}

function calcRoute(inputs) {
  var request = {
    origin: inputs.start,
    destination: inputs.end,
    travelMode: 'BICYCLING'
  };

  directionsService.route(request, function(result, status) {
    if (status !== 'OK') {
      return;
    }

    directionsDisplay.setDirections(result);

    routes = result.routes;

    if (routes.length === 0) {
      logError('Zero-length route');
      return;
    }

    var totalDistance = 0; // in meters
    var totalTime = 0; // in seconds

    var legs = routes[0].legs;

    $.each(legs, function(_, eachLeg) {
      var distance = eachLeg.distance.value;
      totalDistance += distance;

      var time = eachLeg.duration.value;
      totalTime += time;
    });

    inputs.callback({ totalTime: totalTime, totalDistance: totalDistance });
  });
}

function findInterestingPlaces(loc, inputs, closure) {
  var query = {
    location: loc,
    radius: inputs.radius,
  };

  if (inputs.name) {
    query.name = inputs.name;
  } else if (inputs.type) {
    query.type = inputs.type;
  } else {
    logError('Must provide either name or type for addMarkers!');
    return;
  }

  doPlacesSearch(query, closure);
}

function doPlacesSearch(query, closure) {
  placesService.nearbySearch(query, function(data, status) {
    if (status === 'OK' && data) {
      $.each(data, function(_, eachPlace) {
        closure(eachPlace);
      });
    } else if (status === 'OVER_QUERY_LIMIT') {
      setTimeout(function() { doPlacesSearch(query, closure); }, 1000);
    }
  });
}
