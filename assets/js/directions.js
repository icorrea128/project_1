var googleAPIKey = 'AIzaSyDiPtzBkpdiRbstWywr5Vo2NPg1AiGUYVY';

function directionsURL(inputs) {
  var origin = inputs.origin;
  var destination = inputs.destination;
  var departureTime = inputs.departureTime;
  
  return "https://maps.googleapis.com/maps/api/directions/json?mode=bicycling&origin=" + origin + "&destination=" + destination + "&departure_time=" + departureTime + "1399995076&key=" + googleAPIKey;
}

var directionsService;
var directionsDisplay;

var map;

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var mapOptions = {
    zoom:7,
    center: chicago
  }
  map = new google.maps.Map($('#bikemap')[0], mapOptions);
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
  
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
      console.log(result);
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
      
      $.each(legs, function (_, eachLeg) {
        var distance = eachLeg.distance.value;
        totalDistance += distance;
        
        var time = eachLeg.duration.value;
        totalTime += time;
      });
      
      console.log('total distance: ' + totalDistance + ' meters');
      console.log('total time: ' + totalTime + ' seconds');
    }
  });
}