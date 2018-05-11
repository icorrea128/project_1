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

    $('#AddrSubmit').on('click', function(){

        window.location.href = 'MapsWeather.html';
    return false;
/**
 * Calculate a route, and display it on the map.
 * @param {number} startLat - latitude of starting position
 * @param {number} startLong - longitude of starting position
 * @param {number} endLat - latitude of ending position
 * @param {number} endLong - longitude of ending position
 * @param {Date} time - start time of trip
 * @param {setPathCallback} - Callback. Don't use more functions until this returns
 */
    
        
    })
/* autopopulate the address logic*/
    $("#startaddr").geocomplete({
        details: ".geo-details",
        detailsAttribute: "data-geo"
    }).bind("geocode:result", function(event, result) {
        console.log(event);
        console.log(result);
    });
/* End of autopopulate the address logic*/

/* autopopulate the End address logic*/
$("#endaddr").geocomplete({
    details: ".geo-details",
    detailsAttribute: "data-geo"
}).bind("geocode:result", function(event, result) {
    console.log(event);
    console.log(result);
});
/* End of autopopulate the End address logic*/


    $("#addrinput").on( "keydown", function( event ) {
        $(event.delegateTarget ).css( "background-color", "transparent");
        $("#startaddr").css({"background-color": "blue", "color":"white"} );
        $("#endaddr").css({"background-color": "blue", "color":"white"} );
        $("#AddrSubmit").css({"background-color": "blue", "color":"white", "border-color":"white", "border-width":"4px"} );
        // $('document.body').css("background-image","url('../images/bike2.jpg')");
        // $('document.body').css("background-color","white");

      });

})


