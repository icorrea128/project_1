$(document).ready(function(){
    $('#home').height($(window).height());

  
    $('#addrinput').addClass('animated fadeInUp');

   
    $(".navbar a").click(function(){
        $("body,html").animate({
            scrollTop:$("#" + $(this).data('value')).offset().top
        },1000)
        $("#" + $(this).data('value')).height($(window).height());
    })
   
    $('#AddrSubmit').on('click', function(){
        console.log($(".navbar").height());
        $("body,html").animate({
        scrollTop:$("#" + $(this).data('value')).offset().top
        },1000)
        
        $("#" + $(this).data('value')).height($(window).height());
        console.log($('#startaddr').val());
    })

    $("#addrinput").on( "keydown", function( event ) {  
        $(event.delegateTarget ).css( "background-color", "transparent");
        $("#startaddr").css({"background-color": "blue", "color":"white"} );
        $("#endaddr").css({"background-color": "blue", "color":"white"} );
        // $('document.body').css("background-image","url('../images/bike2.jpg')");
        // $('document.body').css("background-color","white");
      
 
      });
    
})


