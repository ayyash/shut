(function($) {

    if (!$.Res) {
        $.Res = {};

    }
    $.Res = {
        Required: "Required",
        SomeError: "An error occurred",
        Error: "An error occurred",
        Done: "Done",
        Dismiss: "Dismiss",
        NoResults: "None found",
        More: "more",
        Less: "less",
        AddAnother: "Add another"
    };

    $.Res.Localization = { DateFormat: "dd MM, yy" };
    // error codes
    // find new price rule here


    $.Res.Tiny = {
        "Unknown": "An error occurred!",
        "DONE": "Done",
        "NO_RESULTS": "None found!",
        "UNAUTHORIZED": "Unauthorized",
        "INVALID_RANGE": "Invalid range",
        "EMAIL_EXISTS": "Email already exists",
        "USER_EXISTS": "User already exists",
        "RESET_PASSWORD": "Password reset",
        "SAVED": "Saved",
        "DELETED": "Deleted",
        "FILE_LARGE": "File too large",
        "INVALID_VALUE": "Invalid value",
        "INVALID_LENGTH": "Too long",
        "INVALID_FORMAT": "Invalid format",
        "INVALID_email_FORMAT": "Invalid email format",
        "INVALID_url_FORMAT": "Invalid URL format",
        "INVALID_integer_FORMAT": "Not an integer",
        "INVALID_number_FORMAT": "Invalid number format",
        "INVALID_digits_FORMAT": "Invalid number format",
        "INVALID_phone_FORMAT": "Invalid phone format",
        "INVALID_date_FORMAT": "Invalid date format",
        "TOO_LONG": "Too long",
        "TOO_SHORT": "Too short",
        "INVALID_DATE_RANGE": "Invalid date range",
        "INVALID_time_FORMAT": "Invalid time format",
        "INVALID_price_FORMAT": "Not a price",
        "AT_LEAST_ONE": "Choose one option"
    };


    $.Res.Detailed = {
        "Unknown": "Oops! We could not perform the required action for some reason. We are looking into it right now.",
        "DONE": "Done",
        "NO_RESULTS": "No results found!",
        "UNAUTHORIZED": "You do not have authization to perform this action",
        "INVALID_RANGE": "Range supplied is not valid",
        "EMAIL_EXISTS": "Email already exists",
        "USER_EXISTS": "User already exists",
        "RESET_PASSWORD": "An email with instructions to reset password has been sent to user.",
        "SAVED": "Saved successfully",
        "DELETED": "Deleted",
        "FILE_LARGE": "The size of the file is larger than the specified limit",
        "INVALID_VALUE": "Value entered is not within the range allowed",
        "INVALID_LENGTH": "The length of the value entered is not within range allowed",
        "INVALID_FORMAT": "Invalid format",
        "INVALID_email_FORMAT": "Invalid email format",
        "INVALID_url_FORMAT": "Invalid URL format",
        "INVALID_integer_FORMAT": "Not an integer",
        "INVALID_number_FORMAT": "Invalid number format",
        "INVALID_digits_FORMAT": "Invalid number format",
        "INVALID_phone_FORMAT": "Invalid phone format",
        "INVALID_date_FORMAT": "Invalid date format",
        "TOO_LONG": "Value entered is longer than maximum allowed",
        "TOO_SHORT": "Value entered is shorter than minimum allowed",
        "INVALID_DATE_RANGE": "The start date must be sooner than the end or due date",
        "INVALID_time_FORMAT": "Invalid time format",
        "INVALID_price_FORMAT": "Invalid price format",
        "NICE_LOOKING_ERROR": "Something this and that, this is a nice looking error",
        "NICE_LOOKING_WARNING": "This is a nice looking warning",
        "AT_LEAST_ONE": "Please, choose one service option to continue"
    };

    $(function() {



        $.Sh.Modals.defaults = {
            ajaxDialog: '#ajaxDialog',
            frameDialog: '#frameDialog',
            contentDialog: '#contentDialog',
            loadingcss: ".loading",
            modal: true
        };

        $.extend($.Sh.Validate.defaults, {
            customlabelcss: "gerrorbox",
            errlabelcss: "errlabel",
            inputcss: "error",
            reqcss: "req"

        });

    });

})(jQuery);