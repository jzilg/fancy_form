(function($form) {

    var $inputs = $form.find(':input');

    $inputs.each(function() {

        var $input = $(this),
            $label = $input.parent('label');

        if ($input.val())
            $label.addClass('active');

        $input.focusin(function() {
            $label.addClass('focus');
        });

        $input.change(function() {
            $label.addClass('active');
        });

        $input.focusout(function() {
            $label.removeClass('focus');

            if (!$input.val())
                $label.removeClass('active');
        });
    });
})($('form'));