$('document').ready(function() {
	$('.view-btn').click(function() {

		// <li class="active"><a href="#lA" data-toggle="tab">Section 1</a></li>
  //       <li class=""><a href="#lB" data-toggle="tab">Section 2</a></li>
  //       <li class=""><a href="#lC" data-toggle="tab">Section 3</a></li>

			// <div class="tab-pane active" id="lA">
    		//  <p>I'm in Section A.</p>
   //          </div>

		$.ajax({
  			url: $('#username').text() + '/' + $(this).attr('id') + '/resources',
  			type: "GET",
  			success: function(data) {
  				for (var i = 0; i < data.resources.length; i++) {
    				console.log(data.resources[i]);
    			}
  			},
		});
	});
});