(function($)
{
    var methods = {};
    var onBlur = function()
    {
        var $this = $(this);

        if ($this.val() == '')
        {
            var placeHolderVal = $this.attr('placeholder');
            if (this.type != undefined && this.type == 'password')
            {
                try
                {
                    this.type = 'text';
                }
                catch (e)
                {
                    // IN IE, lets replace password field with text
                    var display = $this.css('display');
                    $this.css('display', 'none');
                    var after = $this.find('+ input[type=text]');
                    if (!(after.length >= 1 && after
                            .hasClass('placeHolderText')))
                    {
                        var div = $('<input type="text" class="auto-hint placeHolderText" />');
                        div.val(placeHolderVal);
                        div.focus(function()
                        {
                            div.remove();
                            $this.css('display', display);
                            $this.focus();
                        });

                        $this.after(div);
                    }
                    placeHolderVal = "";
                }

                $this.data('old_type', 'password');
            }

            $this.addClass('auto-hint').val(placeHolderVal);
        }
    };

    var onFocus = function()
    {
        var $this = $(this);
        if ($this.hasClass('auto-hint'))
        {
            $this.removeClass('auto-hint').val('');

            if ($this.data('old_type') == 'password')
            {
                this.type = 'password';
            }
        }
    };

    methods.init = function(options)
    {
        return this.each(function()
        {
            var $this = $(this);
            $this.bind('blur', onBlur);
            $this.bind('focus', onFocus);

            onBlur.apply(this);
        });
    };

    methods.removeHint = function()
    {
        return this.each(function()
        {
            onFocus.apply(this);
        });
    };

    methods.showHint = function()
    {
        return this.each(function()
        {
            onBlur.apply(this);
        });
    };

    $.fn.hint = function(method)
    {
        // Method calling logic
        if (methods[method])
        {
            return methods[method].apply(this, Array.prototype.slice.call(
                    arguments, 1));
        }
        else
        {
            if (typeof method === 'object' || !method)
            {
                return methods.init.apply(this, arguments);
            }
            else
            {
                $.error('Method ' + method
                        + ' does not exist on jQuery.ajaxForm');
            }
        }
    };
})(jQuery);
