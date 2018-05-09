//Integrate Inputs as Latitude and Longitude


//Version 1 Open Weather Map
var input = {
    city:"Chicago",
    lat:41.85,
    lon:-87.65
}
function weatherData (params){
    // var lat = params.latitude;
    // var lon = params.longitude;
    // var time = params.time;
    
    
    var api_key = "8ed3b9d51c85a6de3c56df1582820966";
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + input.lat + "&lon=" + input.lon + "&APPID=" + api_key; 
    console.log(queryURL);
    $.ajax({
            url:queryURL,
            method:"GET"
    }).then(function(response){
            //Significant Figures
            function precise(x) {
                    return Number.parseFloat(x).toPrecision(3);
            }
            //Weather Forecast 39 h+1, h=0
               var weather = response.list
            console.log(weather);
            for(i=0;i<weather.length;i++){
                    console.log(weather[i]);
            }
            //Current Time
          
           var currentTime = moment()
           var timeOfWeather = response.list[0].dt_txt
           
            //Icon
            var icon0 = response.list[0].weather[0].icon;
            console.log(icon);
            imageIcon0 = "http://openweathermap.org/img/w/"+icon0+".png" 
            imageIcon1 =  $("<img>")
            imageIcon1.attr("src",imageIcon0);
            
            //Description
            var description0 = response.list[0].weather[0].description;
            
            //First Period Forecast
            var forecast0 = $("<div>") 
            var unitWeatherDefault = [[response.list[0].main.temp * (9/5)]- 459.67]
            console.log(precise(unitWeatherDefault));
            forecast0.text(precise(unitWeatherDefault));
            //Wind Direction
            console.log("Wind Direction" + response.list[0].wind.deg);
            var windDirection = response.list[0].wind.deg
            var quad1a = 0
            var quad1b = 90
            var quad2a = 91
            var quad2b = 180
            var quad3a = 181
            var quad3b = 270
            var quad4a = 271
            var quad4b = 360
         
            if( windDirection >= quad1a && windDirection <= quad1b){
                    $("#windDirection").append("WD: Northeast at " + precise(windDirection) + "degrees");
            }
            else if( windDirection >= quad2a && windDirection <= quad2b){
                    $("#windDirection").append("WD: Northwest at " + precise(windDirection) + "degrees");
            }
            else if( windDirection >= quad3a && windDirection <= quad3b){
                    $("#windDirection").append("WD: Southwest at " + precise(windDirection) + "degrees");
            }
            else if( windDirection >= quad4a && windDirection <= quad4b){
                    $("#windDirection").append("WD: Southeast at " + precise(windDirection) + "degrees");
            }
            
           
            console.log(windDirection);
            //Humidity
            console.log(response.list[0].main.humidity);
            
            // Sea Level
            console.log(response.list[0].main.sea_level); 
            $("#time").append(timeOfWeather);
            $("#icon").append(imageIcon1);
            $("#description").append(description0);
            $("#temp").append("Current Temperature " + forecast0.text() + "F")
            console.log(forecast0);
            $("#windSpeed").append("Wind Speed at " + response.list[0].wind.speed + "M/S")
           
            //Second Period Forecast
            //Current Time
          
           var currentTime = moment()
           var timeOfWeather = response.list[1].dt_txt
           
            //Icon
            var icon1 = response.list[1].weather[0].icon;
            console.log(icon);
            imageIcon2 = "http://openweathermap.org/img/w/"+icon1+".png" 
            imageIcon3 =  $("<img>")
            imageIcon3.attr("src",imageIcon2);
            
            //Description
            var description1 = response.list[1].weather[0].description;
            
            //First Period Forecast
            var forecast1 = $("<div>") 
            var unitWeatherDefault = [[response.list[1].main.temp * (9/5)]- 459.67]
            console.log(precise(unitWeatherDefault));
            forecast1.text(precise(unitWeatherDefault));
            //Wind Direction
            console.log("Wind Direction" + response.list[1].wind.deg);
            var windDirection1 = response.list[1].wind.deg
            var quad1a = 0
            var quad1b = 90
            var quad2a = 91
            var quad2b = 180
            var quad3a = 181
            var quad3b = 270
            var quad4a = 271
            var quad4b = 360
         
            if( windDirection1 >= quad1a && windDirection1 <= quad1b){
                    $("#windDirection1").append("WD: Northeast at " + precise(windDirection1) + "degrees");
            }
            else if( windDirection1 >= quad2a && windDirection1 <= quad2b){
                    $("#windDirection1").append("WD: Northwest at " + precise(windDirection1) + "degrees");
            }
            else if( windDirection1 >= quad3a && windDirection1 <= quad3b){
                    $("#windDirection1").append("WD: Southwest at " + precise(windDirection1) + "degrees");
            }
            else if( windDirection1 >= quad4a && windDirection1 <= quad4b){
                    $("#windDirection1").append("WD: Southeast at " + precise(windDirection1) + "degrees");
            }
            
           
            console.log(windDirection1);
            //Humidity
            console.log(response.list[1].main.humidity);
            
            // Sea Level
            console.log(response.list[1].main.sea_level); 
            
            $("#time1").append(timeOfWeather);
            $("#icon1").append(imageIcon3);
            $("#description1").append(description1);
            $("#temp1").append("Current Temperature " + forecast1.text() + "F")
            console.log(forecast1);
            $("#windSpeed1").append("Wind Speed at " + response.list[1].wind.speed + "M/S")
    });
}
weatherData();
//Hourly Forecast Information
//lat,lon,time of day
//Will it be raining at this time of day? 
//Find Parameters to describe hourly information and description