var googleAPIKey = 'AIzaSyDiPtzBkpdiRbstWywr5Vo2NPg1AiGUYVY';
var placesAPIKey = 'AIzaSyCNX_nJxlGhR195hMYMjgGLMchLGN_jv30';

var placeRadius = 600; // in meters

function directionsURL(inputs) {
  var origin = inputs.origin;
  var destination = inputs.destination;
  var departureTime = inputs.departureTime;

  return "https://maps.googleapis.com/maps/api/directions/json?mode=bicycling&origin=" + origin + "&destination=" + destination + "&departure_time=" + departureTime + "1399995076&key=" + googleAPIKey;
}

var directionsService;
var directionsDisplay;
var placesService;

var map;

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var mapOptions = {
    zoom:7,
    center: chicago
  };

  map = new google.maps.Map($('#bikemap')[0], mapOptions);
  placesService = new google.maps.places.PlacesService(map);
  directionsDisplay.setMap(map);

  calcRoute({
    start: "1310 chicago ave evanston, il",
    end: "ravinia park highland park, il"
  });
}

function calcRoute(inputs) {
  var start = inputs.start;
  var end = inputs.end;
  var request = {
    origin: start,
    destination: end,
    travelMode: 'BICYCLING'
  };

  var interestingIds = [];

  directionsService.route(request, function(result, status) {
    if (status !== 'OK') {
      return;
    }

    directionsDisplay.setDirections(result);

    var center = map.getCenter();
    var centerLat = center.lat();
    var centerLong = center.lng();

    var routes = result.routes;

    if (routes.length === 0) {
        // report error somehow and bail
      return;
    }

    var totalDistance = 0; // in meters
    var totalTime = 0; // in seconds

    var legs = routes[0].legs;

    var startLocation = legs[0].start_location;
    var endLocation = legs[legs.length - 1].end_location;

    var infoWindow = new google.maps.InfoWindow();

    var addInterestingPlace = function(place) {
      var id = place.id;

      if (!interestingIds.includes(id)) {
        interestingIds.push(id);

        let marker = new google.maps.Marker({
          map: map,
          title: place.name,
          position: place.geometry.location
        });

        marker.addListener('click', function() {
          infoWindow.open(map, marker);
          infoWindow.setContent(infoForPlace(place));
        });
      }
    };

    var lastQueryDistance = 0;

    $.each(legs, function(_, eachLeg) {
      var distance = eachLeg.distance.value;
      totalDistance += distance;

      var time = eachLeg.duration.value;
      totalTime += time;

      $.each(eachLeg.steps, function(_, eachStep) {
        lastQueryDistance += eachStep.distance.value;
        
        if (lastQueryDistance > placeRadius) {
          findInterestingPlaces(eachStep.start_location, addInterestingPlace);
          lastQueryDistance = 0;
        }
      });
    });

    findInterestingPlaces(endLocation, addInterestingPlace);

    console.log('total distance: ' + totalDistance + ' meters');
    console.log('total time: ' + totalTime + ' seconds');
  });
}

function findInterestingPlaces(loc, closure) {
  const types = ['convenience_store'];

  $.each(types, (_, eachType) => {
    let query = {
      location: loc,
      radius: placeRadius,
      type: eachType
    };

    doPlacesSearch(query, eachType, closure);
  });
}

function doPlacesSearch(query, type, closure) {
  placesService.nearbySearch(query, (data, status, pagination) => {
    if (status === 'OK' && data) {
      console.log('found a ' + type + ', count ' + data.length);
      $.each(data, function(_, eachPlace) {
        closure(eachPlace);
      });
    } else if (status === 'OVER_QUERY_LIMIT') {
      setTimeout(() => { doPlacesSearch(query, type, closure) }, 1000);
    }
  });
}

function infoForPlace(place) {
  console.log(place);
  return '<div class="map-info-window"><h1 class="place-name">' + place.name + '</h1><h2 class="place-address">' + place.vicinity + '</h2></div>';
}
