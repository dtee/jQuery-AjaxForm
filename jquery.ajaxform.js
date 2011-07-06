log = function(value) {
    if (console && console.log) {
        console.log(value);
    }
};

(function($) {
    
    /****************** Helper functions ********************/
    
    /**
     * @params $container jQuery object of possible container (div, span, etc)
     * @params errors array of error for the container
     */
   var renderError = function($container, errors) {
        var errorElement = $container.find('> .error');
        if (errorElement.length == 0) {
            errorElement = $('<div class="error" />');
            $container.append(errorElement);
        }

        if (errors != null) {
            $container.addClass(settings.class_bad).removeClass(settings.class_good);
            errorElement.css('display', 'block').html(errors.join('<br/>'));
        }
        else {
            $container.addClass(settings.class_good).removeClass(settings.class_bad);
            errorElement.css('display', 'none').html('');
        }
    };

    /**
     * Serialize form data + any custom data
     * 
     * @param data
     * @returns
     */
    var serialize = function(form, data) {
        var serializedData = form.serializeArray();
        for ( var key in data) {
            value = $.toJSON(data[key]);
            serializedData.push({
                name : key,
                value : value
            });
        }

        return $.param(serializedData, false);
    };

    /****************** Class starts here functions ********************/
    
    /**
     * @param $form jQuery Form element
     * @options options {} - see AjaxForm.options and jQuery.ajax for supported options
     */
    var AjaxForm = function($form, options) {
        this.$form = $form;
        var ajaxForm = this;
        
        if (!options) {
            options = {};
        }

        // Guess which buttons we should disable when submit is triggered
        if (!options.buttons) {
            options.buttons = $form.find(':button, :submit');
        }

        // Try to guess url to submit to
        if (!options.url) {
            options.url = $form.attr('action');
            if (! options.url) {
                options.url = window.location.href;
            }
        }

        // Hi-jack form Submit
        $form.bind('submit', function(event) {
            // Prevents quick double submit
            setTimeout(function() {
                ajaxForm.submit()
            }, 100);

            return false;
        });

        this.options = $.extend({}, AjaxForm.options, options);
    };
    
    AjaxForm.options = {
        disable_session_lock : false, // Allow only one submit at a time

        class_bad : 'bad',
        class_good : 'good',
        url : null,
        data : {},                  // Additional data to upload
        timeout : 10000,            // 10 seconds time out
        ajax_upload : false,        // enable file upload?
        dataType : 'text',          // Always text
        type : 'POST',              // Always post
        buttons : [],               // Array of clickable jquery elements in the form

        // Define functions
        error_renderer: renderError,      // format error 
        custom_success : null,            // call back after ajax is done
        custom_failure : null,            // call on failure
    };

    /**
     * See jQuery.ajax.success(data, textStatus, jqXHR)
     */
    AjaxForm.prototype.success = function(data, status, xhr) {
        var returnedJson = $.parseJSON(data);
        var errorList = returnedJson.error;

        var isErrorFree = true;
        for ( var index in errorList) {
            var errors = errorList[index];
            var container = this.$form.find('#' + index + '-container');
            if (container.length == 0) {
                container = this.$form.find('#' + index).parent();
            }
            
            if (errors && errors.length > 0) {
                isErrorFree = false;
            }

            this.options.error_renderer(container, errors);
        }
        
        // Only call custom sucess function if it free form error
        if (this.custom_success && isErrorFree) {
            this.custom_success(returnedJson);
        }

        // Window redirect, we should keep buttons disabled
        if (returnedJson.href) {
            window.location.href = returnedJson.href;
            this.endSession(true);
        }
        else {
            this.endSession();       // Enable user to submit again
        }
    };

    /**
     * See jQuery.ajax.error(data, textStatus, jqXHR)
     */
    AjaxForm.prototype.error = function(jqXHR, textStatus, errorThrown) {
        if (this.options.custom_failure) {
            this.options.custom_failure(jqXHR, textStatus, errorThrown);
        }
        else {
            alert('error...');
        }

        this.endSession();
    };

    /**
     * Takes standard jQuery.ajax() options. Does the following:
     * 
     * 1. Submit using jQuery for jQuery Form Upload
     * 2. On success, trigger this.success() function
     * 3. On timeout, trigger this.error() function
     * 
     * @param options {} additional this.options override
     */
    AjaxForm.prototype.submit = function(options) {
        if (this.sessionTimeoutHandle) {      // do nothing - prevents double submit
            return;
        }

        if (options) {
            options = $.extend({}, this, this.options, options);
        }
        else {
            options = $.extend({}, this, this.options);
        }

        this.startSession(); // Start up a session
        data = {};      // Allow customd data
        
        options.data = serialize(this.$form, data);      // Re-init data
        options.dataType = 'text';                  // Lets submit text, jquery silently sollow parse error
        options.type = 'POST';                      // Post is best
        options.success = this.success;     // Can't let user override this function
        options.error = this.error;         // Can't let user override this function

        // If we have ajaxSubmit library installed
        if ($.fn.ajaxSubmit) {
            this.$form.ajaxSubmit(options);
        }
        else {
            $.ajax(options);
        }
        
        return false;
    };
    
    /**
     * Handles start of session
     * 
     * 1. set timeout timmer to end session if ajax call takes longer than expected
     * 2. diable input buttons so that user can not submit another
     * 3. todo: show progress bar
     * 4. Set input fields to readonly
     */
    AjaxForm.prototype.startSession = function() {
        if (this.options.disable_session_lock) {
            // Let session time out after specified timeout
            this.sessionTimeoutHandle = setTimeout(function() {
                this.sessionTimeoutHandle = null;
                this.endSession();
            }, this.options.timeout);
        }

        // Reset all errors
        this.$form.find('.error').html('').css('display', 'none');

        // We can be fancy here... disable all buttons, add spinner, make input fields readonly
        if (this.options.buttons) {
            this.options.buttons.attr('disabled', true);
        }
        
        // Set all input to readonly
        this.$form.find('input').attr('readonly', true)
    };

    /**
     * Handles start of session
     * 
     * 1. kill timeout timmer
     * 2. undo all the disable/readonly by startSession()
     * 
     * @params keepSessionAlive sometime, it's useful to keep buttons and fields disabled, like
     *  setting window.location.href (It takes a while to load next page, and we want user to see
     *  progress bar)
     */
    AjaxForm.prototype.endSession = function(keepSessionAlive) {
        // Request finished before our session end
        if (this.sessionTimeoutHandle) {
            clearTimeout(this.sessionTimeoutHandle);
        }
        this.sessionTimeoutHandle = null;
        
        if (keepSessionAlive)
        {
            return;
        }
        
        // Time to undo our fancyness
        if (this.options.buttons) {
            this.options.buttons.attr('disabled', false);
        }
        
        // Un-set all input to readonly
        this.$form.find('input').attr('readonly', false)
    };
    
    /****************** jQuery Plugin starts here functions ******************/
    var methods = {};

    /**
     * jQuery wrapper
     * 
     * @param options
     * @returns
     */
    methods.init = function(options) {
        return this.each(function() {
            $this = $(this);

            // If the element is not form element, continue on
            if (this.tagName != 'FORM') {
                return;
            }

            var ajaxForm = $this.data('ajaxform');
            if (ajaxForm) {
                return; // Already initailized
            }
            
            ajaxForm  = new AjaxForm($this, options);
            $this.data('ajaxform', ajaxForm);
        });
    };
    
    methods.submit = function(options) {
        return this.each(function() {
            $this = $(this);
            
            // If the element is not form element, continue on
            if (this.tagName != 'FORM') {
                return;
            }

            var ajaxForm = $this.data('ajaxform');
            if (!ajaxForm) {
                ajaxForm  = new AjaxForm($this, options);
                $this.data('ajaxform', ajaxForm);
            }
            
            ajaxForm.submit(options);
        });
    };

    $.fn.ajaxForm = function(method) {
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
