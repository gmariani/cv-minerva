var NumberView = function() {
    /////////////////
    // Constructor //
    /////////////////
    function init(
        el /*:Element */,
        node /*:Object */,
        input /*:Number */,
        callBack /*:Function */
    ) /*:void */ {
        // Generate HTML
        var strHTML =
            '<h1>Number / Integer</h1>' +
            '<p class="description">The Number (Double) data type represents an 8 byte IEEE-754 double precision floating point value in network byte order (sign bit in low memory). The range of values represented is a Number or an integer of value greater than or equal to 2<sup>28</sup> or an unsigned value greater than or equal to 2<sup>29</sup>.</p>' +
            '<p class="description">An Integer data type represents a 32-bit signed number. The range of values represented by an Integer is -2,147,483,648 (-2^31) to 2,147,483,647 (2^31-1).</p>' +
            '<div class="field">' +
            '<input type="text" id="NumberValue">' +
            '<span class="right-circled-icon icon"></span>' +
            '</div>';
        el.html(strHTML);

        // Add view class for styling
        el.addClass('NumberType');

        // Generate details
        var elTitle = el.find('h1');
        var elValue = el.find('input');
        elTitle.html(node.data.__traits.type);

        // Restrict key input
        elValue.on('keydown', function(
            event /*:KeyboardEvent */
        ) /*:Boolean */ {
            var c = event.which ? event.which : event.keyCode;
            // Keypad
            if (c >= 96 && c <= 105) return true;
            // Number row
            if (c >= 48 && c <= 57) return true;
            // Arrow/Home/End Keys
            if (c >= 35 && c <= 40) return true;
            // Delete/Backspace/Negative Keys
            if (c == 46 || c == 8 || c == 109) return true;
            // Decimal/Period Keys
            if (c == 110 || c == 190) return true;
            return false;
        });

        // Save the value when the input changes
        elValue.on('input propertychange', function() {
            if (validate(elValue.val())) {
                elValue.removeClass('error');
                var cleanVal = sanitize(elValue.val());
                var outOfBounds =
                    cleanVal < -2147483648 || cleanVal > 2147483647;
                // If value switched to int/number
                if (String(cleanVal).indexOf('.') > -1 || outOfBounds) {
                    node.data.__traits.type = 'Number';
                    elTitle.html('Number');
                } else {
                    node.data.__traits.type = 'Integer';
                    elTitle.html('Integer');
                }

                callBack(cleanVal, node);
            } else {
                elValue.addClass('error');
            }
        });

        elValue.val(sanitize(input));
    }

    function sanitize(input) {
        // Return value back to Number
        input = parseFloat(input);
        if (isNaN(input)) input = 0;
        return input;
    }

    // Return true on valid
    function validate(input /*:Number/String */) /*:Boolean */ {
        var minVal = Number.MAX_VALUE * -1;
        var outOfBounds =
            parseFloat(input) < minVal || parseFloat(input) > Number.MAX_VALUE;
        var negativeMatch = String(input).match(/-/g);
        var decimalMatch = String(input).match(/\./g);
        // Input starts from raw as a number, but jQuery returns a string
        return (
            !isNaN(parseFloat(input)) &&
            !outOfBounds &&
            (decimalMatch === null || decimalMatch.length === 1) &&
            (negativeMatch === null || negativeMatch.length === 1)
        );
    }

    // Clear values and clear elements
    function reset() /*:void */ {}

    ////////////
    // Public //
    ////////////
    this.init = init;
    this.validate = validate;
    this.reset = reset;
};
