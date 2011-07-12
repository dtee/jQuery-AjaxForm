(function($) {
    var methods = {};
    var onBlur = function() {
        var $this = $(this);
        
        if ($this.val() == '') {
            if (this.type == 'password') {
                this.type = 'text';
                $this.data('old_type', 'password');
            }
            
            $this.addClass('auto-hint').val($this.attr('placeholder'));
        }
    };
    
    var onFocus = function() {
        var $this = $(this);
        if ($this.hasClass('auto-hint')) {
            $this.removeClass('auto-hint').val('');
            
            if ($this.data('old_type') == 'password') {
                this.type = 'password';
            }
        }
    };
    
    methods.init = function(options) {
        return this.each(function() {
            var $this = $(this);
            $this.bind('blur', onBlur);
            $this.bind('focus', onFocus);
            
            onBlur.apply(this);
        });
    };
    
    methods.removeHint = function() {
        return this.each(function() {
            onFocus.apply(this);
        });
    };
    
    methods.showHint = function() {
        return this.each(function() {
            onBlur.apply(this);
        });
    };
    
    $.fn.hint = function(method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else {
            if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            }
            else {
                $.error('Method ' + method + ' does not exist on jQuery.ajaxForm');
            }
        }
    };
})(jQuery);
