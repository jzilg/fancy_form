(function($) {
    $.fn.validate = function(newConfig) {
        'use strict';

        var $roots = $('html, body');
        var config = {
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
        if (newConfig != 'undefined') $.extend(true, config, newConfig);

        return this.each(function(idx) {

            var $form   = $(this);
            var $inputs = $();
            var isValid = true;

            var init = function() {
                bindSubmit();
                addInputs();
                $form
                    .data('isValid', false)
                    .attr('novalidate', 'novalidate');
            };

            var addInputs = function() {

                $inputs = $inputs.add($form.find(':input[data-validate]'));

                for (var ruleName in config.rules) {
                    var rule = config.rules[ruleName];
                    if (rule.selector) {
                        var $input = $form.find(rule.selector);

                        $input.attr('data-validate', ruleName);
                        $inputs = $inputs.add($input);
                    }
                }
            };

            var bindSubmit = function() {
                $form.submit(validateForm);
            };

            var validateForm = function() {
                $inputs.each(function() {
                    validateInput($(this));
                });

                isValid = (!$form.find('.validation-error').length);
                $form.data('isValid', isValid);

                if (config.disableOnSubmit && isValid)
                    $form.find('button, input[type="submit"]').attr('disabled', 'disabled');

                if (isValid) {
                    if (typeof config.onSuccess == 'function') config.onSuccess();
                } else {
                    if (typeof config.onFail == 'function') config.onFail();
                    scrollToFirstError();
                }

                return isValid;
            };

            var validateInput = function($input) {

                var ruleNames = $input.attr('data-validate');
                var compare   = $input.attr('data-validate-compare');
                var event     = 'change';

                if ($input.is('[type="checkbox"]')) {
                    validateCheckbox($input, ruleNames, event);
                } else if ($input.is('[type="radio"]')) {
                    validateRadio($input, ruleNames, event);
                } else {
                    if ($input.is(':visible')) {
                        if (!$input.is('select')) event = 'input';
                        validateTextInput($input, ruleNames, event);
                    }
                }

                if (compare) compareInputs($input, compare, event);
            };

            var validateTextInput = function($input, ruleNames, event) {

                var value = $input.val();
                ruleNames = ruleNames.split(' ');

                for (var i = 0, ruleNamesLength = ruleNames.length; i < ruleNamesLength; i++) {
                    var ruleName = ruleNames[i];
                    var msg      = '';

                    if (ruleName === '') ruleName = 'required';

                    var rule = config.rules[ruleName];

                    if (!config.rules.required.regex.test(value)) {
                        msg = (rule.msg) ? rule.msg : config.rules.required.msg;
                        createError($input, msg, event);
                        break;
                    } else if (rule.rule) {
                        if (
                            (rule.rule.regex && !rule.rule.regex.test(value)
                        ) || (rule.rule.method && !rule.rule.method())
                        ) {
                            msg = rule.rule.msg;
                            createError($input, msg, event);
                            break;
                        }
                    } else {
                        removeError($input, event);
                    }
                }
            };

            var validateCheckbox = function($input, ruleName, event) {

                if (ruleName === '') ruleName = 'checkbox';

                if (!$input.is(':checked')) {
                    var msg = config.rules[ruleName].msg;
                    createError($input, msg, event);
                } else {
                    removeError($input, event);
                }
            };

            var validateRadio = function($input, ruleName, event) {

                if (ruleName === '') ruleName = 'radio';

                var isChecked = false;
                var name      = $input.attr('name');

                $form.find('input[name="'+name+'"]').each(function() {
                    if ($(this).is(':checked')) {
                        isChecked = true;
                        return false;
                    }
                });

                if (!isChecked) {
                    var msg = config.rules[ruleName].msg;
                    createError($input, msg, event);
                } else {
                    removeError($input, event);
                }
            };

            var compareInputs = function($input, compareWith, event) {

                var orginalVal = $input.val();
                var compareVal = $form.find('input[data-validate-compare="'+ compareWith +'"]').val();

                if (orginalVal !== compareVal) {
                    var msg = config.rules[compareWith].msg;
                    createError($input, msg, event);
                }
            };

            var createError = function($input, msg, event) {

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

                $errorCloseBtn.click(function() {
                    removeError($input);
                });

                bindChange($input, event);
            };

            var removeError = function($input, event) {

                var $container = getContainer($input);

                $container
                    .removeClass('validation-error')
                    .find('.error-msg').remove();

                unbindChange($input, event);
            };

            var getContainer = function($input) {
                return ($input.is('[type="radio"]')) ? $input.closest('.radiobtns') : $input.parent();
            };

            var bindChange = function($input, event) {
                $input.on(event + '.validate', function() {
                    validateInput($input);
                });
            };

            var unbindChange = function($input, event) {
                $input.off(event + '.validate');
            };

            var scrollToFirstError = function() {

                var $target = $form.find('.validation-error').first();

                $roots.animate({
                    scrollTop: $target.offset().top - 10
                }, 999);
            };

            init();
        });
    };
}(jQuery));