(function($) {
    $.fn.validate = function(newConfig) {
        'use strict';

        var $roots = $('html', 'body'),
            config = {
            disableOnSubmit: true,
            rules: {
                required: {
                    msg: 'This is a required Field.',
                    regex: /./
                },
                email: {
                    msg: 'Please enter an Email.',
                    rule: {
                        msg: 'This is not an Email',
                        regex: /^([\w-+]+(?:\.[\w-+]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
                    }
                },
                select: {
                    msg: 'You have to select something'
                },
                checkbox: {
                    msg: 'This Checkbox must be checked.'
                },
                radio: {
                    msg: 'One Option must be chosed.'
                },
                'compare-password': {
                    msg: 'The Passwords must match.'
                }
            }
        };

        if (newConfig !== 'undefined')
            $.extend(true, config, newConfig);

        return this.each(function() {

            var $form   = $(this),
                isValid = true,
                $inputs = $form.find(':input[data-validate]');

            $form.attr('novalidate', '');

            $form.submit(function() {

                $inputs.each(function() {
                    validateInput($(this));
                });

                isValid = (!$form.find('.validation-error').length);

                if (config.disableOnSubmit && isValid)
                    $form.find('button, input[type="submit"]').attr('disabled', 'disabled');

                return isValid;
            });

            function validateInput($input) {

                var rule    = $input.data('validate'),
                    compare = $input.data('compare'),
                    event   = 'change';

                if ($input.is('[type="checkbox"]')) {
                    validateCheckbox($input, rule, event);
                } else if ($input.is('[type="radio"]')) {
                    validateRadio($input, rule, event);
                } else {
                    if ($input.is(':visible')) {
                        if (!$input.is('select')) event = 'input';
                        validateTextInput($input, rule, event);
                    }
                }

                if (compare)
                    compareInputs($input, compare, event);
            }

            function validateTextInput($input, rule, event) {

                var value = $input.val(),
                    rules = rule.split(' ');

                for (var i in rules) {
                    var rule = rules[i],
                        msg  = '';

                    if (rule === '') rule = 'required';

                    if (!config.rules.required.regex.test(value)) {
                        msg = (config.rules[rule].msg) ? config.rules[rule].msg : config.rules.required.msg;
                        createError($input, msg, event);
                        break;
                    } else if (config.rules[rule].rule && !config.rules[rule].rule.regex.test(value)) {
                        msg = config.rules[rule].rule.msg;
                        createError($input, msg, event);
                        break;
                    } else {
                        removeError($input, event);
                    }
                }
            }

            function validateCheckbox($input, rule, event) {

                if (rule === '') rule = 'checkbox';

                if (!$input.is(':checked')) {
                    var msg = config.rules[rule].msg;
                    createError($input, msg, 'change');
                } else {
                    removeError($input, 'change');
                }
            }

            function validateRadio($input, rule, event) {

                if (rule === '') rule = 'radio';

                var isChecked = false,
                    name      = $input.attr('name');

                $form.find('input[name="'+name+'"]').each(function() {
                    if ($(this).is(':checked')) {
                        isChecked = true;
                        return false;
                    }
                });

                if (!isChecked) {
                    var msg = config.rules[rule].msg;
                    createError($input, msg, event);
                } else {
                    removeError($input, event);
                }
            }

            function compareInputs($input, compareWith, event) {

                var orginalVal = $input.val(),
                    compareVal = $form.find('input[data-compare="'+compareWith+'"]').val();

                if (orginalVal !== compareVal) {
                    var msg = config.rules[compareWith].msg;
                    createError($input, msg, event)
                }
            }

            function createError($input, msg, event) {

                removeError($input, event);

                var $container = getContainer($input);

                var $errorCloseBtn = $('<span>',{
                    class: 'remove-error-btn'
                }).text('✖');

                var $error = $('<div>', {
                    class: 'error-msg'
                })
                    .append($errorCloseBtn)
                    .append(msg)
                    .appendTo($container);

                $container.addClass('validation-error');

                /*$roots.animate({
                    scrollTop: $input.offset().top
                }, 999);*/

                $errorCloseBtn.click(function() {
                    removeError($input);
                });

                bindChange($input, event);
            }

            function removeError($input, event) {

                var $container = getContainer($input);

                $container
                    .removeClass('validation-error')
                    .find('.error-msg').remove();

                unbindChange($input, event);
            }

            function getContainer($input) {
                return ($input.is('[type="radio"]')) ? $input.closest('.radiobtns') : $input.parent();
            }

            function bindChange($input, event) {

                $input.on(event + '.validate', function() {
                    validateInput($input);
                });
            }

            function unbindChange($input, event) {
                $input.unbind(event + '.validate');
            }
        });
    }
}(jQuery));