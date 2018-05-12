var apiKey = "UgjDrOD0YPtuYzmTZnZTCFcjO";
var queryURL = "https://data.cityofchicago.org/resource/aavc-b2wj.json?$$app_token=" + apiKey;

function loadDivvyStations(callback) {
    $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(data, textstatus) {
          console.log(data);
          
          var divvyMarkers = [];

          $.each(data, function(i, eachDivvy) {
            var marker = addMarker({
                name: eachDivvy.station_name,
                lat: eachDivvy.location.coordinates[0],
                long: eachDivvy.location.coordinates[1]
            });

            divvyMarkers.push(marker);
        });
    });
}
