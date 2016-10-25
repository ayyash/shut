// ajax submit via xhr2 (xmlhttprequest level 2)

(function($) {
    if (!$.Sh) {
        $.Sh = {};
    };

    $.Sh.Upload = function(options) {


        var _options = {

            onupload: $.getFunction(this, "onupload"),
            onprogress: $.getFunction(this, "onprogress"),
            onprepost: $.getFunction(this, "onprepost")
        };


        this.ShUpload($.extend(_options, options));
        return this.data("sh.upload");
    };

    // expose default options
    $.Sh.Upload.defaults = {

    };
    // constructor, not exposed
    var Upload = function(el, options) {

        // extend options
        this.options = $.extend({}, $.Sh.Upload.defaults, options);

        this.element = el;

        this.Ajax = null;
        // initialize
        this.init();
    };

    Upload.prototype = {

        init: function() {


            var base = this;
            // prepare ajax, onchange fire ajax, prepost data

            base.Ajax = $.Sh.Ajax.call(this.element, {
                contentType: false,
                processData: false,
                cache: false,
                silent: true,
                onprepost: function() {
                    // call external preost first
                    if (base.options.onprepost && !base.options.onprepost.call(base)) return false;
                    // add params
                    var obase = this;
                    var _element = obase.element.get(0);

                    if (_element.files && _element.files[0]) {

                        var formData = new FormData();

                        // get all files in case "multiple" i assigned to field

                        var i, length = _element.files.length;

                        for (i = 0; i < length; i++) {
                            formData.append(_element.name, _element.files[i]);
                        }
                        //TODO: allow this later (append options.data to this)
                        // if we have post data too
                        //if (typeof data == "object") {
                        //	for (var i in data) {
                        //		formData.append(i, data[i]);
                        //	}
                        //}

                        obase.options.data = formData; // what about data-params?

                        return true;
                    }
                    return false;
                },
                onprogress: function(prog) {
                    if (prog.lengthComputable) {
                        var value = ~~((prog.loaded / prog.total) * 100);

                        base.options.onprogress && base.options.onprogress.call(this, value);
                        // assign value somewhere
                    }
                },
                onfinish: function(data) {
                    if (data.result) {
                        base.options.onupload && base.options.onupload.call(this, data);

                    } else {
                        $.BodyLabel(data.errorCode, { css: "gerrorbox", sticky: true });
                    }
                }
            });
            base.Ajax.options.error = function(xhr, status) {
                if (!status) {
                    //need to handle error here
                    $.BodyLabel("Unknown", { css: "gerrorbox", sticky: true });
                }
                // if aborted, do nothing for now
            };

            base.element.on('change', function() {

                base.Ajax.ajax();
            });



        }

    };

    // plugin
    $.fn.ShUpload = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.upload")) {
                $(this).data("sh.upload", new Upload($(this), options));
            }

        });
    };




})(jQuery);