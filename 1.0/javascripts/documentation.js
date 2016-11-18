$(document).ready(function () {

  $('#sidebar > li').on('click',function(){
    $('#sidebar > li').removeClass('active');
    $(this).addClass('active');
    $("html, body").animate({ scrollTop: 0 }, "slow");

  });

  $('#sidebar > li > ul > li').on('click',function(){
    $('#sidebar > li > ul > li').removeClass('active');
    $(this).addClass('active');
  });


  $('iframe').iFrameResize({ log : false, inPageLinks : true}) ;


  $('[data-toggle=popover]').popover({
      content: $('#downloads').html(),
      html: true
  }).click(function() {
      $(this).popover('show');
  });

  $(window).scroll(function() {
    if ($(this).scrollTop() == 0) {
        $('header').css({
                'box-shadow': 'none',
                '-moz-box-shadow' : 'none',
                '-webkit-box-shadow' : 'none' });
    }
    else {
        $('header').css({
                'box-shadow': '0px 4px 6px #888888',
                '-moz-box-shadow' : '0px 4px 6px #888888',
                '-webkit-box-shadow' : '0px 4px 6px #888888' });
    }
  });


  $(document).scroll(function () {
  	var navWrap = $('#navWrap'),
    nav = $('.bs-docs-sidebar>ul'),
    startPosition = navWrap.offset().top - 70,
    stopPosition = $('#stopHere').offset().top - nav.outerHeight();
    var y = $(this).scrollTop();
    if (y > startPosition) {
        nav.addClass('sticky');
  	if (y > (stopPosition - 125 )) {
            nav.css('top', stopPosition  - 125 - y);
        } else {
            nav.css('top', 70);
        }

    } else {
        nav.removeClass('sticky');
    } 
  });

});




