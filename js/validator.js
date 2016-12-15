(function($) {
    $.fn.validate = function(newConfig) {
        'use strict';

        var $roots = $('html, body');
        var config = {
            disableOnSubmit: true,
            scrollToFirstError: true,
            errorClass: 'validation-error',
            errorMsgClass: 'validation-error-msg',
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

            var $form       = $(this);
            var $inputs     = null;
            var isValid     = true;
            var isSubmitted = false;

            var init = function() {
                if (!$form.hasClass('validate-submit-binded')) {
                    bindSubmit();
                    addInputs();
                    $form
                        .addClass('validate-submit-binded')
                        .data('isValid', false)
                        .attr('novalidate', 'novalidate');
                }
            };

            var addInputs = function() {

                $inputs = $form.find(':input[data-validate]');

                for (var ruleName in config.rules) {
                    var rule = config.rules[ruleName];
                    if (rule.selector) {
                        var $input = $form.find(rule.selector);

                        if ($input.attr('data-validate')) {
                            ruleName = ruleName + ' ' + $input.attr('data-validate');
                        }

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

                if (config.disableOnSubmit && isSubmitted) {
                    return false;
                }

                isValid = (!$form.find('.' + config.errorClass).length);
                $form.data('isValid', isValid);

                if ($form.data('isValid')) {
                    if (typeof config.onSuccess == 'function') config.onSuccess();
                    isSubmitted = true;
                } else {
                    if (typeof config.onFail == 'function') config.onFail();
                    if (config.scrollToFirstError) scrollToFirstError();
                }

                return $form.data('isValid');
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

                if (compare) {
                    compareInputs($input, compare, event);
                }
            };

            var validateTextInput = function($input, ruleNames, event) {

                var value = $input.val();
                ruleNames = ruleNames.split(' ');

                for (var i = 0, ruleNamesLength = ruleNames.length; i < ruleNamesLength; i++) {
                    var ruleName = ruleNames[i];
                    var msg      = '';

                    if (ruleName === '') ruleName = 'required';

                    var rule = config.rules[ruleName];

                    // check required
                    if (!config.rules.required.regex.test(value) || $input.find('option:selected').is(':disabled')) {
                        msg = (rule.msg) ? rule.msg : config.rules.required.msg;
                        createError($input, msg, event);
                        break;
                    }

                    // check special rule
                    if (rule.rule) {
                        if (
                            (rule.rule.regex && !rule.rule.regex.test(value)) ||
                            (rule.rule.method && !rule.rule.method($input))
                        ) {
                            msg = rule.rule.msg;
                            createError($input, msg, event);
                            break;
                        }
                    }

                    removeError($input, event);
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
                    class: 'remove-error-btn',
                    role: 'button'
                }).text('✖');

                var $error = $('<div>', {
                    class: config.errorMsgClass
                })
                    .append($errorCloseBtn)
                    .append(msg)
                    .appendTo($container);

                $container.addClass(config.errorClass);

                $errorCloseBtn.click(function() {
                    removeError($input);
                });

                bindChange($input, event);
            };

            var removeError = function($input, event) {

                var $container = getContainer($input);

                $container
                    .removeClass(config.errorClass)
                    .find('.' + config.errorMsgClass).remove();

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

                var $target = $form.find('.' + config.errorClass).first();

                $roots.animate({
                    scrollTop: $target.offset().top - 10
                }, 999);
            };

            init();
        });
    };
}(jQuery));