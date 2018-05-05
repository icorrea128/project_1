$(document).ready(function(){
    $('#home').height($(window).height());

   
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
     
    })
})


