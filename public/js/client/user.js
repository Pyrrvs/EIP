$('document').ready(function() {
	$('.view-btn').click(function() {

		$.ajax({
  			url: $('#username').text() + '/' + $(this).attr('id') + '/resources',
  			type: "GET",
  			success: function(data) {

  				for (var i = 0; i < data.resources.length; i++) {
  					if (i == 0) {
  						$('#file-tab').append('<li class="active"><a href="#tab-' + i + '" data-toggle="tab">' + data.resources[i].name + '</a></li>');
  						$('#file-content').append('<div class="tab-pane active" id="tab-' + i + '">' + data.resources[i].type + '</div>');
  					}
  					else {
  						$('#file-tab').append('<li class=""><a href="#tab-' + i + '" data-toggle="tab">' + data.resources[i].name + '</a></li>');
  						$('#file-content').append('<div class="tab-pane" id="tab-' + i + '">' + data.resources[i].type + '</div>');
  					}

    				console.log(data.resources[i]);
    			}
  			},
		});
	});
});