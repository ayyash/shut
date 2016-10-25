(function($) {


    $.fn.ShCounter = function(method) {

        var settings = {
            allowed: 140,
            warning: 25,
            error: 0,
            cssWarning: 'warning',
            cssExceeded: 'exceeded',
            bindObjectSelectors: null,
            onLoad: null,
            onError: null,
            onSuccess: null,
            onWarning: null,
            onFull: null,
            enabled: true
        };


        var methods = {
            init: function(options) {

                if (options) {
                    $.extend(settings, options);
                }


                return this.each(function() {

                    // this is a counter object
                    var $this = $(this),
                        data = $this.data('sh.counter');

                    // If the plugin hasn't been initialized yet
                    if (!data) {
                        // bind to all objects

                        var $bindObjects = $(settings.bindObjectSelectors);

                        $this.data('sh.counter', {
                            target: $this,
                            bindObjects: $bindObjects,
                            settings: settings
                        });
                        $.each($bindObjects, function() {
                            var $bindObject = $(this);
                            methods.calculate.call($this, $bindObject, false);
                            $bindObject.keyup(function() { methods.calculate.call($this, $bindObject, true) });
                            $bindObject.change(function() { methods.calculate.call($this, $bindObject, true) });
                            $bindObject.bind("upatelimit", function() { methods.calculate.call($this, $bindObject, true) });
                        });

                        (settings.onLoad) ? settings.onLoad($this.data('sh.counter')): null;

                    }
                });

                //TODO: keep an eye, text of a hidden textarea should not be programatically changed
            },
            calculate: function(obj, bupdatecontrol) {
                var count = obj.val().length;
                methods.update.call(this, count);
                // save main control in settings, this is the control that currently represents the counter 
                if (bupdatecontrol) {
                    this.data('sh.counter').settings.control = obj;
                }
                return this;
            },
            changelimit: function(newlimit) {
                // unfortunately settings could not be changed by reference so we will rely on data.allowed
                // TODO: change architecture or save all settings in data
                //console.log(this.data('sh.counter').settings.allowed);

                var curAllowed = this.data('sh.counter').settings.allowed;
                this.data('sh.counter').settings.allowed = newlimit;

                var count = curAllowed - parseInt(this.text());

                methods.update.call(this, count);
                return this;
            },
            update: function(count) {

                var s = this.data('sh.counter').settings;
                if (s.enabled == false) return this;

                var allowed = s.allowed;
                // update upper limit of object then recalculate based on text content
                var available = allowed - count;

                if (available == allowed) {
                    (s.onFull) ? s.onFull(this): null;
                }
                if (available <= s.warning && available >= s.error) {
                    this.addClass(s.cssWarning);
                    (s.onWarning) ? s.onWarning(this): null;
                } else {
                    this.removeClass(s.cssWarning);
                }

                if (available < s.error) {
                    this.addClass(s.cssExceeded);
                    (s.onError) ? s.onError(this): null;
                } else {
                    this.removeClass(s.cssExceeded);
                    (s.onSuccess) ? s.onSuccess(this): null;
                }
                this.text(available);

                return this;
            },
            enabled: function(benabled) {
                var s = this.data('sh.counter').settings;
                s.enabled = benabled;
                // if it disabled, remove something and fire success, if enabled, calcuate again
                if (benabled == false) {

                    this.removeClass(s.cssWarning).removeClass(s.cssExceeded);
                    (s.onSuccess) ? s.onSuccess(this): null;
                } else {
                    // call updatea again, if there is no default control shoo a3mol
                    methods.calculate.call(this, this.data('sh.counter').settings.control, true);

                }

            }

        };

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist');
        }



    };


})(jQuery);