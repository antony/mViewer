$(document).ready(function(){
  var vid = document.getElementById("mViewerRecorder"); 

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
                'box-shadow': '2px 2px 2px #888888',
                '-moz-box-shadow' : '2px 2px 2px #888888',
                '-webkit-box-shadow' : '2px 2px 2px #888888' });
    	}
	});
  $('.fa-play-circle-o').click(function(){
    vid.currentTime = 0;
    vid.play();
    $('.fa-play-circle-o').hide();
  });
  
  vid.onended = function() {
    vid.currentTime = 13;
    $('.fa-play-circle-o').show();
  };

});


