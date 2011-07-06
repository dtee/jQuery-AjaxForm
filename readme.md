jQuery AjaxForm
===============

This jQuery helps with form submission via ajax. It will help render 
server side errors and takes cares of blocking the submit button to 
prevent the user from submitting more than once. 

## Usage

### Simple usage

    $.ajaxForm('#form-id').init();

The code will do the following: 

1. listen on form's onsubmit event
2. look for url
    1. extract url to submit to from form's "action" attribute
    2. if the 'action' attribute have no url, it will use window.location.href
3. serilize the form data, and submit to url via ajax
4. trigger session start (lock all button, and submit input type)
5. on server response, map error data to form input element, and render error
6. If server does not response with error
    1. if server return href then redirect user to href
    