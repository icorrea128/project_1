// Building URL with API Key
var apiKey = "UgjDrOD0YPtuYzmTZnZTCFcjO";
var queryURL = "https://data.cityofchicago.org/resource/aavc-b2wj.json?$$app_token=" + apiKey;


// Retrieve Divvy data and plot it
$.ajax({
url: queryURL,
method: "GET"
}).then(function(data, textstatus) {
  console.log(data);

//JQUERY For Loop  
  $.each(data, function(i, entry) {
    var infowindow = new google.maps.InfoWindow({
    });

    //Name of Divy Bike Station
    console.log("What station is this? " + entry.station_name);
    //Whether the Divvy station is in service or not
    console.log("What is the status? " + entry.status);
    //The number of docks reported as containing available bicycles or available to receive a returned bicycle
    console.log("How many docks available? " + entry.docks_in_service);
    //The longitude of the Divvy Bike Station
    console.log("What is the longitude? " + entry.location.coordinates[0]);
    //The latiitude of the Divvy Bike Station
    console.log("What is the latitude? " + entry.location.coordinates[1]);
    console.log("......")

    //Add marker on map
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(entry.location.coordinates[1], entry.location.coordinates[0]),
        map: map,
        title: location.name         
      });
      //Infowindow popup displaying station name, status of the station, and # of docks available, 
      marker.addListener('click', function() {
        infowindow.open(map, marker);
        maxWidth: 200       
        infowindow.setContent(entry.station_name + "</br>" + "Status: " + entry.status + "</br>" + "Docks available: " + entry.docks_in_service);          
      });
    });
    
    
});
