/**
 * Handles ajaxform's session start and end events:
 * 
 *  1. Add and remove hint text
 *  2. If the options is given, it will replace the input with spinner
 *  3. if the spinner container is given, will toggle spinner
 *  
 * Usage: 
 *  defaultSpinner = '<img src="/img/progress.gif" />'
    $.ajaxForm({spinner_default: defaultSpinner, spinner_auto_append: true});
 */
(function($) {
    // Session start handler
    var onSessionStart = function(event) {
        var options = this.options;
        $form = this.$form;
        
        $form.find('input:text, input:password, textarea').hint('removeHint');
        if (!options.spinner) {
            var $inlineSpinner = $form.find('.busy-spinner');
            if ($inlineSpinner.length > 0) {
                options.spinner = $inlineSpinner;
            }
            else if (options.spinner_default)
            {
                options.spinner = $(options.spinner_default);
                $form.append(options.spinner);
            }
        }
        
        if (options.spinner) {
            options.spinner.toggle(true);
        }
        
        // Disable submit button
        if (options.buttons) {
            options.buttons.attr('disabled', true);
        }
        
        // Set all input to readonly
        $form.find('input').attr('readonly', true);
    };

    // Session end handler
    var onSessionEnd = function(event) {
        var options = this.options;
        $form = this.$form;
        
        // Keep the form busy
        if (event.keep_busy_on_success || 
            (options.keep_busy_on_success && event.success)) {
            return;
        }
        
        $form.find('input:text, input:password, textarea').hint('showHint');
        if (options.buttons) {
            options.buttons.attr('disabled', false);
        }
        $form.find('input').attr('readonly', false);
        
        if (options.spinner) {
            options.spinner.toggle(false);
        }
    };
    
    // Set up global config
    var override = {
        onSessionStart: onSessionStart,
        onSessionEnd :  onSessionEnd, 
        spinner: null,
        spinner_default: null,                // html for default spinner
        spinner_auto_append: true,            // Auto append spinner to container
        keep_busy_on_success: false           // keeps spinner going even on success 
    };
    
    $.ajaxForm(override);
})(jQuery);