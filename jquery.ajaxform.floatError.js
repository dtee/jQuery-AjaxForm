(function($) {
	this.settings = {
		error_div_css: {
			width: '75px',
			height: '75px',
			position: 'absolute',
			display: 'block',
			right: 0,
			bottom: 0,
			'background-color': '#bcd5e6',
			'text-align': 'center'
		},
		error_position: {
			my: "left top",
			at: "right top",
			offset: "20 0",
			using: null,
			collision: "none none"
		}
	};
		
	this.settings.error_formatter = function(container, errors) {
		var errorElement = container.find(settings.selector_error);

		if (errors != null)
		{
			container
				.addClass(settings.class_bad)
				.removeClass(settings.class_good);
			errorElement.html(errors[0]);
			
/*			errorElement.css(settings.error_div_css);
			var options = {of: container};
			$.extend(options, settings.error_position);
			
			errorElement.position(options);*/
		}
		else
		{
			container
				.addClass(settings.class_good)
				.removeClass(settings.class_bad);
			
			errorElement.html('');
		}
	};
	
	if ($.fn.ajaxForm)
	{
		// Do a deep copy - dunno how to do plugin
		// $.extend(true, $.fn.ajaxForm, this);
	}
})(jQuery);