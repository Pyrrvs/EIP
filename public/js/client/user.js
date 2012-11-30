$('document').ready(function() {
	$('.view-btn').click(function() {
		$.ajax({
  			url: $(this).attr('id') + '/resources',
  			type: "GET",
  			success: function(data) {
    			console.log(data);
  			}
		});
	});
});