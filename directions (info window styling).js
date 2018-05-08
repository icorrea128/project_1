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

    var infoWindow = new google.maps.InfoWindow({
      maxWidth: 350
    });


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

        google.maps.event.addListener(map, 'click', function() {
          infowindow.close();
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
  return '<div class="map-info-window"><h1 class="place-name">' + place.name + '</h1><h2 class="place-address">' + place.vicinity + '</h2>' + '</div>';
}

//alex code
google.maps.event.addListener(infowindow, 'domready', function() {

  // Reference to the DIV that wraps the bottom of infowindow
  var iwOuter = $('.gm-style-iw');

  /* Since this div is in a position prior to .gm-div style-iw.
   * We use jQuery and create a iwBackground variable,
   * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
  */
  var iwBackground = iwOuter.prev();

  // Removes background shadow DIV
  iwBackground.children(':nth-child(2)').css({'display' : 'none'});

  // Removes white background DIV
  iwBackground.children(':nth-child(4)').css({'display' : 'none'});

  // Moves the infowindow 115px to the right.
  iwOuter.parent().parent().css({left: '115px'});

  // Moves the shadow of the arrow 76px to the left margin.
  iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

  // Moves the arrow 76px to the left margin.
  iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

  // Changes the desired tail shadow color.
  iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

  // Reference to the div that groups the close button elements.
  var iwCloseBtn = iwOuter.next();

  // Apply the desired effect to the close button
  iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});


  // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
  iwCloseBtn.mouseout(function(){
    $(this).css({opacity: '1'});
  });
});