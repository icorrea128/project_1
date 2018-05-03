$(document).ready(function(){
    $('#home').height($(window).height());

   
    $(".navbar a").click(function(){
        $("body,html").animate({
            scrollTop:$("#" + $(this).data('value')).offset().top
        },1000)
     
    })
   
})