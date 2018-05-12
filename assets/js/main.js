var startLocation;
var endLocation;

$(document).ready(function(){
    $('#home').height($(window).height());


    $('#addrinput').addClass('animated fadeInUp');
    $('#AddrSubmit').addClass('animated infinite pulse');


    $(".navbar a").click(function(){
        $("body,html").animate({
            scrollTop:$("#" + $(this).data('value')).offset().top
        },1000)
        $("#" + $(this).data('value')).height($(window).height());
    })

    /* autopopulate the address logic*/
    $("#startaddr").geocomplete({
        details: ".geo-details",
        detailsAttribute: "data-geo"
    }).bind("geocode:result", function(event, result) {
        startLocation = {
            lat: result.geometry.location.lat(),
            long: result.geometry.location.lng()
        };
    });
    /* End of autopopulate the address logic*/

    /* autopopulate the End address logic*/
    $("#endaddr").geocomplete({
        details: ".geo-details",
        detailsAttribute: "data-geo"
    }).bind("geocode:result", function(event, result) {
        endLocation = {
            lat: result.geometry.location.lat(),
            long: result.geometry.location.lng()
        };
    });
    /* End of autopopulate the End address logic*/

    $('#AddrSubmit').click(function(event){
        event.preventDefault();
      
      if (!startLocation) {
        $('#startaddr').css({ "background-color": 'red' });
      }
      
      if (!endLocation) {
        $('#endaddr').css({ "background-color": 'red' });
      }
      
      if (!startLocation || !endLocation) {
        return;
      }

        window.location.href = 'MapsWeather.html?' + 'startLat=' + startLocation.lat + '&startLong=' + startLocation.long + '&endLat=' + endLocation.lat + '&endLong=' + endLocation.long + '&time=' + $('#time').val();
        return false;
    });
  
    $("#addrinput").on( "keydown", function( event ) {
            // $(event.delegateTarget ).css( "background-color", "transparent");
            // $("#startaddr").css({"background-color": "blue", "color":"white"} );
            // $("#endaddr").css({"background-color": "blue", "color":"white"} );
            // $("#AddrSubmit").css({"background-color": "blue", "color":"white", "border-color":"white", "border-width":"4px"} );
            // // $('document.body').css("background-image","url('../images/bike2.jpg')");
            // // $('document.body').css("background-color","white");

        });
    
    var utcDate = new Date();
    var date = new Date(utcDate.getTime() - utcDate.getTimezoneOffset()*60*1000);
    $('#time').val(date.toJSON().slice(0,19));
});
