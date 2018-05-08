var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.881832, lng: -87.623177},
    zoom: 8
  });
}
   var apiKey = "UgjDrOD0YPtuYzmTZnZTCFcjO";
   var queryURL = "https://data.cityofchicago.org/resource/aavc-b2wj.json?$$app_token=" + apiKey;
  // Retrieve our data and plot it

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(data, textstatus) {
      console.log(data);
      console.log(data[498].location)
      console.log(data[498].station_name);
      console.log(data[498].status)
      $.each(data, function(i, entry) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(entry.location_1.latitude, 
                                             entry.location_1.longitude),
            map: map,
            title: location.name
          });
        });
  });
