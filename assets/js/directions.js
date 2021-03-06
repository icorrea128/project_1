/* eslint-env browser, jquery */
/* global google, InfoBubble */

/* Requires the following JS libraries:
 * jQuery - http://code.jquery.com/jquery-3.3.1.min.js
 * Google Maps & Places - https://maps.googleapis.com/maps/api/js?key=AIzaSyDiPtzBkpdiRbstWywr5Vo2NPg1AiGUYVY&callback=initMap&libraries=places
 * InfoBubble - assets/js/infobubble.js (local)
 */

var googleAPIKey = 'AIzaSyDiPtzBkpdiRbstWywr5Vo2NPg1AiGUYVY';
var placesAPIKey = 'AIzaSyCNX_nJxlGhR195hMYMjgGLMchLGN_jv30';

var directionsService;
var directionsDisplay;
var placesService;

var map;

var startTime;
var routes;

var savedSearches = {};
var nextID = 1;

// BEGIN PUBLIC API

/*
 * CSS Classes:
 *
 * map-info-bubble - InfoBubble when marker is clicked
 * map-info-content - main div for info bubble content
 * info-place-name - place name header in info bubble
 * info-place-address - place address header in info bubble
 * info-place-icon - icon div in info bubble
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
 * @param {Object} inputs
 * @param {number} inputs.startLat - latitude of starting position
 * @param {number} inputs.startLong - longitude of starting position
 * @param {number} inputs.endLat - latitude of ending position
 * @param {number} inputs.endLong - longitude of ending position
 * @param {Date}   inputs.time - start time of trip
 * @param {setPathCallback} inputs.callback - Callback. Don't use more functions until this returns
 */
function setPath(inputs) { // eslint-disable-line no-unused-vars
  $.each(['startLat', 'startLong', 'endLat', 'endLong', 'time'], function(_, eachName) {
    if (!inputs[eachName]) {
      logError("error: no value for " + eachName);
      return;
    }
  });

  startTime = inputs.time;

  calcRoute({
    start: new google.maps.LatLng(inputs.startLat, inputs.startLong),
    end: new google.maps.LatLng(inputs.endLat, inputs.endLong),
    time: inputs.time,
    callback: inputs.callback
  });
}

/**
 * @typedef {Object} Point
 * @param {number} x
 * @param {number} y
 */

/**
 * @typedef {Object} Size
 * @param {number} width
 * @param {number} height
 */

/**
 * Manually add a marker, specified by latitude and longitude.
 * @param {Object} inputs
 * @param {string} inputs.name - The name of the place.
 * @param {number} inputs.lat - Latitude of the place.
 * @param {number} inputs.long - Longitude of the place.
 * @param {string} [inputs.address] - Address of the place. Optional.
 * @param {string} [inputs.status] - status of the place. Optional.
 * @param {string} [inputs.docks] - docks of the place. Optional.
 * @param {string} [inputs.markerImageURL] - Marker image URL. Optional.
 * @param {Size} [inputs.markerImageSize] - Original size of marker image. Optional.
 * @param {Size} [inputs.markerImageScaledSize] - Size of marker image as it should appear on the map. Optional.
 * @param {string} [inputs.infoIcon] - Icon for Info window. Optional.
 * @param {string} [inputs.infoIconClass] - CSS class for icons in info window. Optional.
 * @param {number} [inputs.radiusFromPath] - if this is set, the marker will only be added if it's at least this close to the path.
 * @return {number} Returns a number identifying this marker, which can be used later on to hide or show it.
 */
function addMarker(inputs) { // eslint-disable-line no-unused-vars
  var id = nextID++;

  if (inputs.radiusFromPath && routes[0] && !isNearPath(inputs)) {
    return null;
  }

  makeMarker({
    name: inputs.name,
    location: new google.maps.LatLng({ lat: inputs.lat, lng: inputs.long }),
    address: inputs.address,
    status: inputs.status,
    docks: inputs.docks_in_service,
    markerImageURL: 'https://maps.google.com/mapfiles/kml/shapes/cycling.png',
    markerImageSize: inputs.markerImageSize,
    markerImageScaledSize: new google.maps.Size(25, 25),
    infoIcon: inputs.infoIcon,
    infoIconClass: inputs.infoIconClass,
    id: id
  });

  return id;
}

/**
 * @callback addMarkersCallback
 * @param {string} name
 * @param {Array} types
 * @param {string} address
 * @param {number} lat
 * @param {number} long
 */

/**
 * Add markers for places, searching either by name or by type.
 * Supports types listed here:
 * https://developers.google.com/places/supported_types
 * @param {Object} inputs
 * @param {string} [inputs.name] - Search for places by a name.
 * @param {string} [inputs.type] - Search for places of a certain type. Ignored if a name is specified.
 * @param {number} inputs.radius - Search at this distance from the route (in meters)
 * @param {string} [inputs.markerImageURL] - Marker image. Optional.
 * @param {Size} [inputs.markerImageSize] - Original size of marker image. Optional.
 * @param {Size} [inputs.markerImageScaledSize] - Size of marker image as it should appear on the map. Optional.
 * @param {string} [inputs.infoIcon] - Icon for Info window. Optional.
 * @param {string} [inputs.infoIconClass] - CSS class for icons in info window. Optional.
 * @param {addMarkersCallback} [inputs.callback] - called for each search result. Optional.
 * @return {number} Returns a number identifying this search query, which can be used later on to quickly hide or show the results.
 */
function addMarkers(inputs) { // eslint-disable-line no-unused-vars
  var route = routes[0];
  var searchID = nextID++;

  if (!route) {
    logError('addMarkers called before any routes have been mapped');
    return undefined;
  }

  var interestingIds = [];

  var addInterestingPlace = function(place) {
    var id = place.id;

    if (!interestingIds.includes(id)) {
      interestingIds.push(id);

      makeMarkerForPlace(place, inputs, searchID);
    }
  };

  var totalDistance = totalTimeAndDistance(route).totalDistance;

  function addAtDistance(dist) {
    var pos = getPositionAtDistance(dist);
    var latLng = new google.maps.LatLng(pos.lat, pos.long);

    findInterestingPlaces(latLng, inputs, addInterestingPlace);
  }

  for (var distance = 0; distance < totalDistance; distance += inputs.radius) {
    addAtDistance(distance);
  }

  var endLocation = route.legs[route.legs.length - 1].end_location;
  findInterestingPlaces(endLocation, inputs, addInterestingPlace);

  return searchID;
}

/**
 * Return type for getPositionAtTime()
 * @typedef {Object} Position
 * @param {number} lat - latitude
 * @param {number} long - longitude
 */

/**
 * Get the estimated latitude and longitude at a particular time along the route.
 * @param {Date} time - the time to search for, as a JavaScript Date
 * @return {Position}
 */
function getPositionAtTime(time) { // eslint-disable-line no-unused-vars
  var route = routes[0];

  if (!route || !startTime) {
    logError('getPositionAtTime() called without route being charted!');
    return null;
  }

  if (!route.legs || (route.legs.length === 0)) {
    logError('empty route!');
    return null;
  }

  var routeStart = route.legs[0].start_location;
  var routeEnd = route.legs[route.legs.length - 1].end_location;

  if (time < startTime) {
    return { lat: routeStart.lat(), long: routeStart.lng() };
  }

  var legEndTime = startTime;
  var position;

  $.each(route.legs, function(_, eachLeg) {
    var duration = eachLeg.duration.value;
    var legStartTime = legEndTime;
    legEndTime = new Date(legStartTime.getTime() + duration * 1000);

    if (time <= legEndTime) {
      var stepEndTime = legStartTime;

      $.each(eachLeg.steps, function(__, eachStep) {
        var stepDuration = eachStep.duration.value;
        var stepStartTime = stepEndTime;
        stepEndTime = new Date(stepStartTime.getTime() + stepDuration * 1000);

        if (time <= stepEndTime) {
          var seconds = (time.getTime() - stepStartTime.getTime()) / 1000;
          var fraction = seconds / stepDuration;

          var stepStart = eachStep.start_location;
          var stepEnd = eachStep.end_location;

          var dLat = (stepEnd.lat() - stepStart.lat()) * fraction;
          var dLng = (stepEnd.lng() - stepStart.lng()) * fraction;

          position = { lat: stepStart.lat() + dLat, long: stepStart.lng() + dLng };
        }
      });

      if (!position) {
        var loc = eachLeg.end_location;
        position = { lat: loc.lat(), long: loc.lng() };
      }

      return false;
    }

    return true;
  });

  if (!position) {
    position = { lat: routeEnd.lat(), long: routeEnd.lng() };
  }

  return position;
}

/**
 * Get the estimated latitude and longitude after a specified distance has been travelled.
 * @param {number} distance - Distance travelled in meters
 * @return {Position}
 */
function getPositionAtDistance(distance) { // eslint-disable-line no-unused-vars
  var route = routes[0];

  if (!route || !startTime) {
    logError('getPositionAtDistance() called without route being charted!');
    return null;
  }

  if (!route.legs || (route.legs.length === 0)) {
    logError('empty route!');
    return null;
  }

  var legEndDistance = 0;
  var position;

  $.each(route.legs, function(_, eachLeg) {
    var legLength = eachLeg.distance.value;

    var legStartDistance = legEndDistance;
    legEndDistance = legStartDistance + legLength;

    if (distance <= legEndDistance) {
      var stepEndDistance = legStartDistance;

      $.each(eachLeg.steps, function(__, eachStep) {
        var stepLength = eachStep.distance.value;
        var stepStartDistance = stepEndDistance;
        stepEndDistance = stepStartDistance + stepLength;

        if (distance <= stepEndDistance) {
          var length = distance - stepStartDistance;
          var fraction = length / stepLength;

          var stepStart = eachStep.start_location;
          var stepEnd = eachStep.end_location;

          var dLat = (stepEnd.lat() - stepStart.lat()) * fraction;
          var dLng = (stepEnd.lng() - stepStart.lng()) * fraction;

          position = { lat: stepStart.lat() + dLat, long: stepStart.lng() + dLng };

          return false;
        }

        return true;
      });

      if (!position) {
        var loc = eachLeg.end_location;
        position = { lat: loc.lat(), long: loc.lng() };
      }

      return false;
    }

    return true;
  });

  if (!position) {
    var loc = route.legs[route.legs.length - 1].end_location;
    position = { lat: loc.lat(), long: loc.lng() };
  }

  return position;
}

/*
 * Show markers previously added via addMarker() or addMarkers().
 * @param {number} id - The id returned by addMarker() or addMarkers().
 */
function showMarkers(id) { // eslint-disable-line no-unused-vars
  var search = savedSearches[id];

  if (!search) {
    return;
  }

  search.shown = true;

  $.each(search.markers, function(_, eachMarker) {
    eachMarker.setMap(map);
  });
}

/*
 * Hide markers previously added via addMarker() or addMarkers().
 * @param {number} id - The id returned by addMarker() or addMarkers().
 */
function hideMarkers(id) { // eslint-disable-line no-unused-vars
  var search = savedSearches[id];

  if (!search) {
    return;
  }

  search.shown = false;

  $.each(search.markers, function(_, eachMarker) {
    eachMarker.setMap(null);
  });
}

// END PUBLIC API

function isNearPath(inputs) {
  var route = routes[0];

  var totalDistance = totalTimeAndDistance(route).totalDistance;

  var lat = inputs.lat;
  var long = inputs.long;
  var radius = inputs.radiusFromPath;

  for (var distance = 0; distance < totalDistance; distance += inputs.radiusFromPath) {
    var pos = getPositionAtDistance(distance);

    var dLat = pos.lat - lat;
    var dLng = (pos.long - long);
    var dX = dLng * 111320 * Math.cos(lat);
    var dY = dLat * 110574;

    var dist = Math.sqrt(dX * dX + dY * dY);

    if (dist <= radius) {
      return true;
    }
  }

  return false;
}

function makeMarkerForPlace(place, inputs, id) {
  makeMarker({
    name: place.name,
    location: place.geometry.location,
    markerImageURL: "http://maps.google.com/mapfiles/kml/shapes/convenience.png",
    markerImageSize: inputs.markerImageSize,
    markerImageScaledSize: new google.maps.Size(25, 25),
    infoIcon: inputs.infoIcon,
    infoIconClass: inputs.infoIconClass,
    id: id
  });

  if (inputs.callback) {
    inputs.callback({
      name: place.name,
      types: place.types,
      address: place.vicinity,
      lat: place.geometry.location.lat(),
      long: place.geometry.location.lng()
    });
  }
}

function makeMarker(inputs) {
  var currentSearch = savedSearches[inputs.id];

  if (!currentSearch) {
    currentSearch = { shown: true, markers: [] };
    savedSearches[inputs.id] = currentSearch;
  }

  var marker = new google.maps.Marker({
    map: currentSearch.shown ? map : null,
    title: inputs.name,
    position: inputs.location
  });

  currentSearch.markers.push(marker);

  if (inputs.markerImageURL) {
    var icon = { origin: new google.maps.Point(0, 0), anchor: new google.maps.Point(0, 0), url: inputs.markerImageURL };

    if (inputs.markerImageSize) {
      var size = inputs.markerImageSize;
      icon.size = new google.maps.Size(size.width, size.height);
    }

    if (inputs.markerImageScaledSize) {
      var sSize = inputs.markerImageScaledSize;
      icon.scaledSize = new google.maps.Size(sSize.width, sSize.height);
    }

    marker.setIcon(icon);
  }

  marker.addListener('click', function() {
    var content = $('<div class="map-info-content">');

    if (inputs.infoIcon) {
      var infoIcon = $('<img>').attr('src', inputs.infoIcon).attr('alt', inputs.name).addClass('info-place-icon');

      if (inputs.infoIconClass) {
        infoIcon.addClass(inputs.infoIconClass);
      }

      content.append(infoIcon);
    } else if (inputs.infoIconClass) {
      content.append($('<i>').addClass(inputs.infoIconClass));
    }

    content.append($('<h1 class="info-place-name">').text(inputs.name));

    if (inputs.address) {
      content.append($('<h2 class="info-place-address">').text(inputs.address));
    }

    var infoBubble = new InfoBubble({
      map: map,
      content: content[0],
      position: inputs.location,
      maxWidth: 200,
      maxHeight: 200,
      shadowStyle: 1,
      padding: 10,
      backgroundColor: ' #e6ecff',
      borderRadius: 20,
      arrowSize: 10,
      borderWidth: 1,
      borderColor: '#2c2c2c',
      disableAutoPan: true,
      arrowPosition: 30,
      backgroundClassName: 'transparent',
      arrowStyle: 2
    });

    $(infoBubble.e).addClass('map-info-bubble');

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

    if (inputs.callback) {
      inputs.callback(totalTimeAndDistance(routes[0]));
    }
  });
}

function totalTimeAndDistance(route) {
  var totalDistance = 0; // in meters
  var totalTime = 0; // in seconds

  $.each(route.legs, function(_, eachLeg) {
    totalDistance += eachLeg.distance.value;
    totalTime += eachLeg.duration.value;
  });

  return { totalTime: totalTime, totalDistance: totalDistance };
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
