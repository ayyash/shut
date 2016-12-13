
Array.prototype.remove = function (from, to) {
	this.splice(from, !to || 1 + to - from + (!(to < 0 ^ from >= 0) && (to < 0 || -1) * this.length));
	return this.length;
};
String.prototype.toSentenceCase = function () {
	return this.substring(0, 1).toUpperCase() + this.substring(1);
};

String.prototype.format = function () {

	if (arguments.length == 0)
		return this;
	var params, str = this;

	if (arguments.length > 1) {
		params = $.makeArray(arguments);
	} else {
		params = arguments;
	}
	$.each(params, function (i, n) {
		str = str.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});

	return str;
};
String.prototype.isNullOrEmpty = function () {
	if (this == null || this == "undefined" || $.trim(this).length == 0) return true;
	return false;
};
String.prototype.toBoolean = function () {

	if (this.toString() === "true" || this.toString() === "True") return true;
	return false;
};
// CHANGED to string instead of Number, beacuase it is rare that I use Number
String.prototype.toPrettyPrice = function () {
	var ret = Number(this.replace(/,/gi, ""));	
	if (isNaN(ret)) return this;
	// read number, tofixed of 2 digits, insert "," in every three digits, if its already fixed, unfix first

	ret = ret.toFixed(2),
		x = ret.toString().split('.'),
		x1 = x[0],
		x2 = x.length > 1 ? '.' + x[1] : '',
		rgx = /(\d+)(\d{3})/;

	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

String.prototype.toNormalNumber = function () {
	// read string with "," unace
	return this.replace(/,/gi, "");

};
// CHANGED to string instead of Number
String.prototype.toPrettyNumber = function () {
	// read number, insert "," in every three digits
	var ret = Number(this.toString().replace(/,/gi, ""));
	if (isNaN(ret)) return this;

	var x = ret.toString().split('.'),
		x1 = x[0],
		x2 = x.length > 1 ? '.' + x[1] : '',
		rgx = /(\d+)(\d{3})/;

	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};


function _debug(o, message, type) {
	if (window._mdebug) {
		if (window.console) {
			type == "e" ? window.console.error(message, o) : window.console.info("%c " + message, "background: #222; color: #bada55", o);
		}
	}
}
//gone: var $body;

(function ($) {

	// initialize window
	$.props = { width: 0, height: 0, $window: $(window), $body: $(document.body), doctitle: document.title, isFixed: false};
	if (!$.Res) {
		$.Res = {};
	}
	$body = $(document.body); // to remove
	$.setContentWidth = function() {
		// determine width of viewport, and resize upon window resize
		$.props.width = $(window).width();
		$.props.height = $(window).height();
	}


	$(window).ready(function () {

		$.props.$body = $(document.body); // double checking

		jQuery.support.placeholder = (function () {
			var i = document.createElement('input');
			return 'placeholder' in i;
		})();

		jQuery.support.touch = (function () {
			return 'ontouchstart' in window || navigator.msMaxTouchPoints;
		})();

		$.setContentWidth();
		if (!$.props.isFixed) $(window).resize($.setContentWidth);


	});



})(jQuery);

(function ($) {
	
	// main definitions first

	$.props._BehaviorsReady = false;

	var getBehavior = function (o) {
		try {
			if ($.Sh[o] && typeof ($.Sh[o]) == "function") {
				// shplugin
				return $.Sh[o];

			} else if (window[o] && typeof (window[o]) == "function") {
				// temporarily. find function
				return window[o];

			}
			_debug(o, "Behavior is missing", "e");
			return null;
		} catch (e) {
			// faill silently
			_debug(o, "Behavior", "e");
			_debug(e, "Error", "e");
			return null;
		}
	};
	$.getFunction = function ($context, fn) {
		var fn = $context.data(fn);
		if (!fn || fn == null) return undefined;
		//if (window[fn] && typeof (window[fn]) == "function") {
		//	return window[fn];
		//}
		

		if ($.UiSh[fn] && typeof ($.UiSh[fn]) == "function") {
			return $.UiSh[fn];
		}
		return fn;
	};
	// document clicks
	$.popbasket = [];

	$.Behaviors = function (context, nonGreedy) {
		// group data-behavior, and run functions with prepare-name of behavior
		// if nonGreedy do not include context
		var $allbehaviors;
		if (context == null)
			$allbehaviors = $("[data-behavior]");
		else
			$allbehaviors = nonGreedy ? $("[data-behavior]", context) : jQuery.merge(context.filter("[data-behavior]"), $("[data-behavior]", context));


		$.each($allbehaviors, function (i, o) {
			var $t = $(this);
			// make multiple
			var fns = $t.attr("data-behavior").split(",");

			$.each(fns, function (i, o) {
				var b = getBehavior(o);

				b ? b.call($t) : null;
			});
		});

		// also fire onbehaviors ready
		$.props.$body.trigger("BehaviorsReady", [context]);

	};


	$.fn.ApplyBehavior = function (behaviors) {
		var fns = behaviors.split(",");
		var $t = $(this);
		$.each(fns, function (index, o) {
			var b = getBehavior(o);
			b ? b.call($t) : null;
		});
		return this;
	}



	$.ShRewire = function (context, nonGreedy) {

		$.Behaviors(context, nonGreedy);
		// try in timeout for onload events

		if ($.Sh.Modals) {

			$.Sh.Modals.rewire(context);
		}

		if ($.rewireload != null && typeof $.rewireload == "function") {
			$.rewireload(context);
		}
	}

	$.OnDocumentClick = function (element, fn) {
		element.data("ondocumentclick", fn);
		$.popbasket.push(element);

	};

	// create a loop to extend $.fn with Sh functions?! am i an idiot?
	$(function () {
		// initialize behaviors
		$.Behaviors();
		$.props._BehaviorsReady = true;

		$(window.document).on("click", function (e) {
			// fire attached events
			$.each($.popbasket, function (i, o) {
				var fn = $.getFunction(o,"ondocumentclick");//o.data("ondocumentclick");
				fn && fn.call(o, e);
				
			});
		});

	});



})(jQuery);

(function ($) {
	if (!$.Sh) {
		$.Sh = {};
	}

	$.Sh.toJson = function (s) {
		if (s === "" || s == null) return {};
		var arr = s.split("&"),
			stack = {};

		for (var i = 0; i < arr.length; i++) {
			var a = arr[i].split("="),
				key = a[0], value = a[1];
			if (stack[key] != null) {
				// create an array
				if (!(stack[key] instanceof Array)) {
					var v = stack[key];
					stack[key] = [];
					stack[key].push(v);
				}
				stack[key].push(value);
			} else {
				stack[key] = value;
			}
		}
		return stack;
	};

	$.Sh.Ajax = function (options) {
		// a bridge, set up options from data-

		var src = this.data("src") || this.attr("href");
		var style = this.data("style") || (this.attr("data-params") ? "qs" : "o");
		var _options = {
			url: src,
			style: style,
			type: this.data("method"),
			data: this.data("params"),
			dataType: this.data("datatype"),
			contentType: this.data("contentype"),
			onload: $.getFunction(this, "onload"),
			onloading: $.getFunction(this,"onloading"),
			onprepost: $.getFunction(this, "onprepost"),
			onprogress: $.getFunction(this, "onprogress"),
			onfinish: $.getFunction(this, "onfinish"),
			onfinally: $.getFunction(this, "onfinally"),
			onpost: $.getFunction(this,"onpost"),
			loadingcss: this.data("loadingcss"),
			trigger: this.data("trigger"),
			silent: this.data("silent") // if true, do not fire on click of trigger
		};
		
		this.ShAjax($.extend(_options, options));
		
		return this.data("sh.ajax");
	};

	// expose default options
	$.Sh.Ajax.defaults = {
		style: "o",
		type: "POST",
		dataType: "json",
		data: {},
		//contentType: // default instead of application/x-www-form-urlencoded; charset=UTF-8, send "application/json; charset=utf-8",  otherwise (multipart/form-data)
		onload: null,
		onloading: function (bloading,srcelement) {
			bloading ? this.addClass($.Sh.Ajax.defaults.loadingcss) : this.removeClass($.Sh.Ajax.defaults.loadingcss);
		},
		onprepost: null,
		onprogress: null,
		onfinish: null,
		onfinally: null,
		onpost: function(xhr){
			_debug(xhr,"xhr");
		},
		loadingcss: "loadings",
		silent: false
	};

	// constructor, not exposed
	var Ajax = function (el, options) {

	
		this.options = $.extend({}, $.Sh.Ajax.defaults, options);	

		this.element = el;
		this._IsLoading = false;
		
		// initialize
		this.init();
	};

	Ajax.prototype = {
		
		init: function () {
					
			// TODOL internal object
			//this.options.dataobject = {};

			
			var base = this;
			// fire onload
			if (base.options.onload) base.options.onload.call(base.element);

			// turn data to json to make it easier to addparams
			// TODO: whatever jquery is doing to detect style, do it here, isArray, isPlainObject, else qs
			if (base.options.style == "qs") {
				base.options.data = $.Sh.toJson(base.options.data);
			} else if (base.options.style == "array") {
				base.options.data = $.Sh.toJson($.param(base.options.data));
			}
			//} else if ($.isEmptyObject(base.options.data)) {
			//	//base.options.data = {}; // this is to fix a stupid glitch, where another extend changes $.Sh.Ajax.defaults
			//}

			// ... TODO: delegate needs a selector, but what if I want to pass an object?
			if (!base.options.silent) {
			
				if (base.options.trigger) {
				
					// if not self, delegate within self, i have a problem, "this" doesnt belong to the trigger!
					base.element.on("click", base.options.trigger, function (e) {
						// what if base.options.trigger never exists? this should never happen right?
						//if (!$(e.target).is(base.options.trigger)) return false;
						
						return base._click(this, e);

					});
				} else {
					base.element.on("click", function (e) {
						return base._click(this, e);

					});
				}
				
			}
			// return instance
			return base;
		},
		_click: function (element, e) {
			var base = this;
			if (e.isDefaultPrevented() || base._IsLoading) {
				return false;
			}

			var $srcelement = $(element);
			e.preventDefault();

			return base.ajax($srcelement);
		},
		addparams: function (params, style) {
			switch (style) {
				case "qs":
					params = $.Sh.toJson(params);
					break;
				case "array":
					params = $.Sh.toJson($.param(params));
					break;
			}
			// changed
			this.options.data = $.extend({}, this.options.data, params); // extend. alla yostor
			
		},
		addtrigger: function (trigger) {
			var base = this;

			trigger.on("click", function (e) {
				return base._click(this, e);
			});
		},
		ajax: function(srcelement){
			// call ajax directly when this is called without trigger

			if (!srcelement) srcelement = this.element;
			var base = this;

			// call prepost, this is where data options can be extended
			if (base.options.onprepost) {
				if (!base.options.onprepost.call(base, srcelement)) return false;
			}

			// pass true for before loading
			base.options.onloading.call(base.element, true, srcelement);

			// TODO: if i am sending contenttype "application/json; charset=utf-8", then i need to stingify data
			//if (base.options.contentType.indexOf("json") > -1) base.options.data = JSON.stringify(d);

			// sheklo im turning qs params into json always 

			_debug(base.options.data, "data sent");
			_debug(base.options.url, "source");

			base._IsLoading = true;

			var ajaxops = {
				success: function (data, textStatus) {
					
					if (base.options.dataType != "html") _debug(data, "data received");
					else _debug({ content: data }, "content received");

					if (base.options.onfinish) base.options.onfinish.call(base.element, data, srcelement);

				},
				error: function (data, status) {
				
					if (!status){
						_debug(data.responseJSON || data.responseText, "error");
						if (base.options.onfinish) base.options.onfinish.call(base.element, base.options.dataType == "json" ? data.responseJSON : data.responseText, srcelement);
					}
					// let plugin handle different statuses
				},
				xhr: function () {
					myXhr = $.ajaxSettings.xhr();

					if (myXhr.upload) {
						myXhr.upload.addEventListener('progress', base.options.onprogress, false, srcelement);
					}
					return myXhr;
				},
				complete: function (xhr, status) {
					base.options.onloading.call(base.element, false, srcelement);
					base._IsLoading = false;

					if (base.options.onfinally) base.options.onfinally.call(base.element, base.options.dataType == "json" ? xhr.responseJSON : xhr.responseText, status,srcelement);
				}
			};	
			
			var xhr = $.ajax($.extend(ajaxops, base.options));
			
			base.options.onpost.call(base, xhr); // let developer call done, fail, and always

			return base; // instace of this object
		}
		
		
	};

	// plugin
	$.fn.ShAjax = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.ajax")) {
				$(this).data("sh.ajax", new Ajax($(this), options));
			}

		});
	};


})(jQuery);

(function($) {
    if (!$.Sh) {
        $.Sh = {};
    };

    $.Sh.Autocomplete = function(options) {
        // a bridge, set up options from data-
        var _options = {
            source: this.data("source"),
            method: this.data("method"),
            target: this.data("target"),
            context: this.data("context"),
            isInline: this.data("inline"),
            minLength: this.data("min-chars"),
            noCache: this.data("nocache"),
            onchange: $.getFunction(this, "onchange"),
            onresponse: $.getFunction(this, "onresponse"),
            onselect: $.getFunction(this, "onselect"),
            onblur: $.getFunction(this, "onblur")
        };

        this.ShAutocomplete($.extend(_options, options));
        return $(this).data("sh.autocomplete");
    };

    // expose default options
    $.Sh.Autocomplete.defaults = {
        minLength: 0,
        context: $.props.$body,
        method: "GET"
    };
    // constructor, not exposed
    var Autocomplete = function(el, options) {

        // extend options
        this.options = $.extend({}, $.Sh.Autocomplete.defaults, options);

        this.element = el;

        this.target = $(this.options.target, this.options.context); // there must be one unique

        this.cache = {};
        // initialize
        this.init();
    };

    Autocomplete.prototype = {

        init: function() {

            var base = this,
                source;

            // ajax if not inline
            if (base.options.isInline) {
                source = this.options.source;
            } else {
                var ajax = $.Sh.Ajax.call(base.element, {
                    method: base.options.method, // TODO: expose
                    silent: true,
                    url: base.options.source

                });
                source = function(request, response) {
                    // call ajax after adding param
                    if (!base.options.noCache && request.term in base.cache) {
                        response(base.cache[request.term]);
                        return;

                    }
                    ajax.addparams({ kw: request.term });
                    ajax.options.onfinish = function(data) {
                        base.cache[request.term] = data.d;
                        response(data.d);
                    };
                    ajax.ajax();

                };
            }

            this.element.autocomplete({
                    source: source,
                    minLength: base.options.minLength,
                    select: function(event, ui) {
                        // add value to hidden field
                        _debug(ui.item, "item");

                        if (ui.item) {
                            base.element.val(ui.item.value);
                            base.target.ShVal(ui.item.dbid);
                            if (base.options.onselect) base.options.onselect.call(base.element, ui.item);
                            return false;
                        }

                    },
                    change: function(event, ui) {
                        // if none selected, reset to none
                        // changed

                        if (ui.item == null) {
                            ui.item = { currentValue: base.element.val() };
                            base.element.val('');
                            base.target.ShVal(null);
                        }
                        if (base.options.onchange) base.options.onchange.call(base.element, ui.item);
                    },
                    response: function(event, ui) {
                        if (base.options.onresponse) base.options.onresponse.call(base.element, ui.content);
                    }
                })
                .blur(function() {
                    // on blur but no change and empty field, empty field
                    if (base.element.ShTrim() == "") {
                        base.target.ShVal(null);
                    }
                    if (base.options.onblur) base.options.onblur.call(base.element);

                });

            // fix ie bug, this no longer works! it bugs on chrome
            //this.element.one("input", function (e) {

            //	var $that = $(this);
            //	var val = $that.val();
            //	$that.val("");
            //	setTimeout(function () {
            //		$that.val(val);
            //	}, 500);


            //});

            //this.element.trigger("input");


            // return instance
            return this;
        },
        changeTarget: function(target, context) {
            this.options.target = target;
            if (context) this.options.context = context;
            this.target = $(target, this.options.context);
        }

    };

    // plugin
    $.fn.ShAutocomplete = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.autocomplete")) {
                $(this).data("sh.autocomplete", new Autocomplete($(this), options));
            }

        });
    };


})(jQuery);/*!
Chosen, a Select Box Enhancer for jQuery and Prototype
by Patrick Filler for Harvest, http://getharvest.com

Version 1.6.2
Full source at https://github.com/harvesthq/chosen
Copyright (c) 2011-2016 Harvest http://getharvest.com

MIT License, https://github.com/harvesthq/chosen/blob/master/LICENSE.md
This file is generated by `grunt build`, do not edit it by hand.
*/

(function () {
	var $, AbstractChosen, Chosen, SelectParser, _ref,
	  __hasProp = {}.hasOwnProperty,
	  __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

	SelectParser = (function () {
		function SelectParser() {
			this.options_index = 0;
			this.parsed = [];
		}

		SelectParser.prototype.add_node = function (child) {
			if (child.nodeName.toUpperCase() === "OPTGROUP") {
				return this.add_group(child);
			} else {
				return this.add_option(child);
			}
		};

		SelectParser.prototype.add_group = function (group) {
			var group_position, option, _i, _len, _ref, _results;
			group_position = this.parsed.length;
			this.parsed.push({
				array_index: group_position,
				group: true,
				label: this.escapeExpression(group.label),
				title: group.title ? group.title : void 0,
				children: 0,
				disabled: group.disabled,
				classes: group.className
			});
			_ref = group.childNodes;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				option = _ref[_i];
				_results.push(this.add_option(option, group_position, group.disabled));
			}
			return _results;
		};

		SelectParser.prototype.add_option = function (option, group_position, group_disabled) {
			if (option.nodeName.toUpperCase() === "OPTION") {
				if (option.text !== "") {
					if (group_position != null) {
						this.parsed[group_position].children += 1;
					}
					this.parsed.push({
						array_index: this.parsed.length,
						options_index: this.options_index,
						value: option.value,
						text: option.text,
						html: option.innerHTML,
						title: option.title ? option.title : void 0,
						selected: option.selected,
						disabled: group_disabled === true ? group_disabled : option.disabled,
						group_array_index: group_position,
						group_label: group_position != null ? this.parsed[group_position].label : null,
						classes: option.className,
						style: option.style.cssText
					});
				} else {
					this.parsed.push({
						array_index: this.parsed.length,
						options_index: this.options_index,
						empty: true
					});
				}
				return this.options_index += 1;
			}
		};

		SelectParser.prototype.escapeExpression = function (text) {
			var map, unsafe_chars;
			if ((text == null) || text === false) {
				return "";
			}
			if (!/[\&\<\>\"\'\`]/.test(text)) {
				return text;
			}
			map = {
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#x27;",
				"`": "&#x60;"
			};
			unsafe_chars = /&(?!\w+;)|[\<\>\"\'\`]/g;
			return text.replace(unsafe_chars, function (chr) {
				return map[chr] || "&amp;";
			});
		};

		return SelectParser;

	})();

	SelectParser.select_to_array = function (select) {
		var child, parser, _i, _len, _ref;
		parser = new SelectParser();
		_ref = select.childNodes;
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			child = _ref[_i];
			parser.add_node(child);
		}
		return parser.parsed;
	};

	AbstractChosen = (function () {
		function AbstractChosen(form_field, options) {
			this.form_field = form_field;
			this.options = options != null ? options : {};
			if (!AbstractChosen.browser_is_supported()) {
				return;
			}
			this.is_multiple = this.form_field.multiple;
			this.set_default_text();
			this.set_default_values();
			this.setup();
			this.set_up_html();
			this.register_observers();
			this.on_ready();
		}

		AbstractChosen.prototype.set_default_values = function () {
			var _this = this;
			this.click_test_action = function (evt) {
				return _this.test_active_click(evt);
			};
			this.activate_action = function (evt) {
				return _this.activate_field(evt);
			};
			this.active_field = false;
			this.mouse_on_container = false;
			this.results_showing = false;
			this.result_highlighted = null;
			this.allow_single_deselect = (this.options.allow_single_deselect != null) && (this.form_field.options[0] != null) && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
			this.disable_search_threshold = this.options.disable_search_threshold || 0;
			this.disable_search = this.options.disable_search || false;
			this.enable_split_word_search = this.options.enable_split_word_search != null ? this.options.enable_split_word_search : true;
			this.group_search = this.options.group_search != null ? this.options.group_search : true;
			this.search_contains = this.options.search_contains || false;
			this.single_backstroke_delete = this.options.single_backstroke_delete != null ? this.options.single_backstroke_delete : true;
			this.max_selected_options = this.options.max_selected_options || Infinity;
			this.inherit_select_classes = this.options.inherit_select_classes || false;
			this.display_selected_options = this.options.display_selected_options != null ? this.options.display_selected_options : true;
			this.display_disabled_options = this.options.display_disabled_options != null ? this.options.display_disabled_options : true;
			this.include_group_label_in_selected = this.options.include_group_label_in_selected || false;
			this.max_shown_results = this.options.max_shown_results || Number.POSITIVE_INFINITY;
			return this.case_sensitive_search = this.options.case_sensitive_search || false;
		};

		AbstractChosen.prototype.set_default_text = function () {
			if (this.form_field.getAttribute("data-placeholder")) {
				this.default_text = this.form_field.getAttribute("data-placeholder");
			} else if (this.is_multiple) {
				this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || AbstractChosen.default_multiple_text;
			} else {
				this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || AbstractChosen.default_single_text;
			}
			return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || AbstractChosen.default_no_result_text;
		};

		AbstractChosen.prototype.choice_label = function (item) {
			if (this.include_group_label_in_selected && (item.group_label != null)) {
				return "<b class='group-name'>" + item.group_label + "</b>" + item.html;
			} else {
				return item.html;
			}
		};

		AbstractChosen.prototype.mouse_enter = function () {
			return this.mouse_on_container = true;
		};

		AbstractChosen.prototype.mouse_leave = function () {
			return this.mouse_on_container = false;
		};

		AbstractChosen.prototype.input_focus = function (evt) {
			var _this = this;
			if (this.is_multiple) {
				if (!this.active_field) {
					return setTimeout((function () {
						return _this.container_mousedown();
					}), 50);
				}
			} else {
				if (!this.active_field) {
					return this.activate_field();
				}
			}
		};

		AbstractChosen.prototype.input_blur = function (evt) {
			var _this = this;
			if (!this.mouse_on_container) {
				this.active_field = false;
				return setTimeout((function () {
					return _this.blur_test();
				}), 100);
			}
		};

		AbstractChosen.prototype.results_option_build = function (options) {
			var content, data, data_content, shown_results, _i, _len, _ref;
			content = '';
			shown_results = 0;
			_ref = this.results_data;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				data = _ref[_i];
				data_content = '';
				if (data.group) {
					data_content = this.result_add_group(data);
				} else {
					data_content = this.result_add_option(data);
				}
				if (data_content !== '') {
					shown_results++;
					content += data_content;
				}
				if (options != null ? options.first : void 0) {
					if (data.selected && this.is_multiple) {
						this.choice_build(data);
					} else if (data.selected && !this.is_multiple) {
						this.single_set_selected_text(this.choice_label(data));
					}
				}
				if (shown_results >= this.max_shown_results) {
					break;
				}
			}
			return content;
		};

		AbstractChosen.prototype.result_add_option = function (option) {
			var classes, option_el;
			if (!option.search_match) {
				return '';
			}
			if (!this.include_option_in_results(option)) {
				return '';
			}
			classes = [];
			if (!option.disabled && !(option.selected && this.is_multiple)) {
				classes.push("active-result");
			}
			if (option.disabled && !(option.selected && this.is_multiple)) {
				classes.push("disabled-result");
			}
			if (option.selected) {
				classes.push("result-selected");
			}
			if (option.group_array_index != null) {
				classes.push("group-option");
			}
			if (option.classes !== "") {
				classes.push(option.classes);
			}
			option_el = document.createElement("li");
			option_el.className = classes.join(" ");
			option_el.style.cssText = option.style;
			option_el.setAttribute("data-option-array-index", option.array_index);
			option_el.innerHTML = option.search_text;
			if (option.title) {
				option_el.title = option.title;
			}
			return this.outerHTML(option_el);
		};

		AbstractChosen.prototype.result_add_group = function (group) {
			var classes, group_el;
			if (!(group.search_match || group.group_match)) {
				return '';
			}
			if (!(group.active_options > 0)) {
				return '';
			}
			classes = [];
			classes.push("group-result");
			if (group.classes) {
				classes.push(group.classes);
			}
			group_el = document.createElement("li");
			group_el.className = classes.join(" ");
			group_el.innerHTML = group.search_text;
			if (group.title) {
				group_el.title = group.title;
			}
			return this.outerHTML(group_el);
		};

		AbstractChosen.prototype.results_update_field = function () {
			this.set_default_text();
			if (!this.is_multiple) {
				this.results_reset_cleanup();
			}
			this.result_clear_highlight();
			this.results_build();
			if (this.results_showing) {
				return this.winnow_results();
			}
		};

		AbstractChosen.prototype.reset_single_select_options = function () {
			var result, _i, _len, _ref, _results;
			_ref = this.results_data;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				result = _ref[_i];
				if (result.selected) {
					_results.push(result.selected = false);
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		};

		AbstractChosen.prototype.results_toggle = function () {
			if (this.results_showing) {
				return this.results_hide();
			} else {
				return this.results_show();
			}
		};

		AbstractChosen.prototype.results_search = function (evt) {
			if (this.results_showing) {
				return this.winnow_results();
			} else {
				return this.results_show();
			}
		};

		AbstractChosen.prototype.winnow_results = function () {
			var escapedSearchText, option, regex, results, results_group, searchText, startpos, text, zregex, _i, _len, _ref;
			this.no_results_clear();
			results = 0;
			searchText = this.get_search_text();
			escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			zregex = new RegExp(escapedSearchText, 'i');
			regex = this.get_search_regex(escapedSearchText);
			_ref = this.results_data;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				option = _ref[_i];
				option.search_match = false;
				results_group = null;
				if (this.include_option_in_results(option)) {
					if (option.group) {
						option.group_match = false;
						option.active_options = 0;
					}
					if ((option.group_array_index != null) && this.results_data[option.group_array_index]) {
						results_group = this.results_data[option.group_array_index];
						if (results_group.active_options === 0 && results_group.search_match) {
							results += 1;
						}
						results_group.active_options += 1;
					}
					option.search_text = option.group ? option.label : option.html;
					if (!(option.group && !this.group_search)) {
						option.search_match = this.search_string_match(option.search_text, regex);
						if (option.search_match && !option.group) {
							results += 1;
						}
						if (option.search_match) {
							if (searchText.length) {
								startpos = option.search_text.search(zregex);
								text = option.search_text.substr(0, startpos + searchText.length) + '</em>' + option.search_text.substr(startpos + searchText.length);
								option.search_text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
							}
							if (results_group != null) {
								results_group.group_match = true;
							}
						} else if ((option.group_array_index != null) && this.results_data[option.group_array_index].search_match) {
							option.search_match = true;
						}
					}
				}
			}
			this.result_clear_highlight();
			if (results < 1 && searchText.length) {
				this.update_results_content("");
				return this.no_results(searchText);
			} else {
				this.update_results_content(this.results_option_build());
				return this.winnow_results_set_highlight();
			}
		};

		AbstractChosen.prototype.get_search_regex = function (escaped_search_string) {
			var regex_anchor, regex_flag;
			regex_anchor = this.search_contains ? "" : "^";
			regex_flag = this.case_sensitive_search ? "" : "i";
			return new RegExp(regex_anchor + escaped_search_string, regex_flag);
		};

		AbstractChosen.prototype.search_string_match = function (search_string, regex) {
			var part, parts, _i, _len;
			if (regex.test(search_string)) {
				return true;
			} else if (this.enable_split_word_search && (search_string.indexOf(" ") >= 0 || search_string.indexOf("[") === 0)) {
				parts = search_string.replace(/\[|\]/g, "").split(" ");
				if (parts.length) {
					for (_i = 0, _len = parts.length; _i < _len; _i++) {
						part = parts[_i];
						if (regex.test(part)) {
							return true;
						}
					}
				}
			}
		};

		AbstractChosen.prototype.choices_count = function () {
			var option, _i, _len, _ref;
			if (this.selected_option_count != null) {
				return this.selected_option_count;
			}
			this.selected_option_count = 0;
			_ref = this.form_field.options;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				option = _ref[_i];
				if (option.selected) {
					this.selected_option_count += 1;
				}
			}
			return this.selected_option_count;
		};

		AbstractChosen.prototype.choices_click = function (evt) {
			evt.preventDefault();
			if (!(this.results_showing || this.is_disabled)) {
				return this.results_show();
			}
		};

		AbstractChosen.prototype.keyup_checker = function (evt) {
			var stroke, _ref;
			stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
			this.search_field_scale();
			switch (stroke) {
				case 8:
					if (this.is_multiple && this.backstroke_length < 1 && this.choices_count() > 0) {
						return this.keydown_backstroke();
					} else if (!this.pending_backstroke) {
						this.result_clear_highlight();
						return this.results_search();
					}
					break;
				case 13:
					evt.preventDefault();
					if (this.results_showing) {
						return this.result_select(evt);
					}
					break;
				case 27:
					if (this.results_showing) {
						this.results_hide();
					}
					return true;
				case 9:
				case 38:
				case 40:
				case 16:
				case 91:
				case 17:
				case 18:
					break;
				default:
					return this.results_search();
			}
		};

		AbstractChosen.prototype.clipboard_event_checker = function (evt) {
			var _this = this;
			return setTimeout((function () {
				return _this.results_search();
			}), 50);
		};

		AbstractChosen.prototype.container_width = function () {
			if (this.options.width != null) {
				return this.options.width;
			} else {
				//AYYASH CHANGED THIS
				//return "" + this.form_field.offsetWidth + "px";
				
				return "" + $(this.form_field).outerWidth() + "px";
			}
		};

		AbstractChosen.prototype.include_option_in_results = function (option) {
			if (this.is_multiple && (!this.display_selected_options && option.selected)) {
				return false;
			}
			if (!this.display_disabled_options && option.disabled) {
				return false;
			}
			if (option.empty) {
				return false;
			}
			return true;
		};

		AbstractChosen.prototype.search_results_touchstart = function (evt) {
			this.touch_started = true;
			return this.search_results_mouseover(evt);
		};

		AbstractChosen.prototype.search_results_touchmove = function (evt) {
			this.touch_started = false;
			return this.search_results_mouseout(evt);
		};

		AbstractChosen.prototype.search_results_touchend = function (evt) {
			if (this.touch_started) {
				return this.search_results_mouseup(evt);
			}
		};

		AbstractChosen.prototype.outerHTML = function (element) {
			var tmp;
			if (element.outerHTML) {
				return element.outerHTML;
			}
			tmp = document.createElement("div");
			tmp.appendChild(element);
			return tmp.innerHTML;
		};

		AbstractChosen.browser_is_supported = function () {
			if ("Microsoft Internet Explorer" === window.navigator.appName) {
				return document.documentMode >= 8;
			}
			if (/iP(od|hone)/i.test(window.navigator.userAgent) || /IEMobile/i.test(window.navigator.userAgent) || /Windows Phone/i.test(window.navigator.userAgent) || /BlackBerry/i.test(window.navigator.userAgent) || /BB10/i.test(window.navigator.userAgent) || /Android.*Mobile/i.test(window.navigator.userAgent)) {
				return false;
			}
			return true;
		};

		AbstractChosen.default_multiple_text = "Select Some Options";

		AbstractChosen.default_single_text = "Select an Option";

		AbstractChosen.default_no_result_text = "No results match";

		return AbstractChosen;

	})();

	$ = jQuery;

	$.fn.extend({
		chosen: function (options) {
			if (!AbstractChosen.browser_is_supported()) {
				return this;
			}
			return this.each(function (input_field) {
				var $this, chosen;
				$this = $(this);
				chosen = $this.data('chosen');
				if (options === 'destroy') {
					if (chosen instanceof Chosen) {
						chosen.destroy();
					}
					return;
				}
				if (!(chosen instanceof Chosen)) {
					$this.data('chosen', new Chosen(this, options));
				}
			});
		}
	});

	Chosen = (function (_super) {
		__extends(Chosen, _super);

		function Chosen() {
			_ref = Chosen.__super__.constructor.apply(this, arguments);
			return _ref;
		}

		Chosen.prototype.setup = function () {
			this.form_field_jq = $(this.form_field);
			this.current_selectedIndex = this.form_field.selectedIndex;
			return this.is_rtl = this.form_field_jq.hasClass("chosen-rtl");
		};

		Chosen.prototype.set_up_html = function () {
			var container_classes, container_props;
			container_classes = ["chosen-container"];
			container_classes.push("chosen-container-" + (this.is_multiple ? "multi" : "single"));
			if (this.inherit_select_classes && this.form_field.className) {
				container_classes.push(this.form_field.className);
			}
			if (this.is_rtl) {
				container_classes.push("chosen-rtl");
			}
			container_props = {
				'class': container_classes.join(' '),
				'style': "width: " + (this.container_width()) + ";",
				'title': this.form_field.title
			};
			if (this.form_field.id.length) {
				container_props.id = this.form_field.id.replace(/[^\w]/g, '_') + "_chosen";
			}
			this.container = $("<div />", container_props);
			if (this.is_multiple) {
				this.container.html('<ul class="chosen-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chosen-drop"><ul class="chosen-results"></ul></div>');
			} else {
				this.container.html('<a class="chosen-single chosen-default"><span>' + this.default_text + '</span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off" /></div><ul class="chosen-results"></ul></div>');
			}
			this.form_field_jq.hide().after(this.container);
			this.dropdown = this.container.find('div.chosen-drop').first();
			this.search_field = this.container.find('input').first();
			this.search_results = this.container.find('ul.chosen-results').first();
			this.search_field_scale();
			this.search_no_results = this.container.find('li.no-results').first();
			if (this.is_multiple) {
				this.search_choices = this.container.find('ul.chosen-choices').first();
				this.search_container = this.container.find('li.search-field').first();
			} else {
				this.search_container = this.container.find('div.chosen-search').first();
				this.selected_item = this.container.find('.chosen-single').first();
			}
			this.results_build();
			this.set_tab_index();
			return this.set_label_behavior();
		};

		Chosen.prototype.on_ready = function () {
			return this.form_field_jq.trigger("chosen:ready", {
				chosen: this
			});
		};

		Chosen.prototype.register_observers = function () {
			var _this = this;
			this.container.bind('touchstart.chosen', function (evt) {
				_this.container_mousedown(evt);
				return evt.preventDefault();
			});
			this.container.bind('touchend.chosen', function (evt) {
				_this.container_mouseup(evt);
				return evt.preventDefault();
			});
			this.container.bind('mousedown.chosen', function (evt) {
				_this.container_mousedown(evt);
			});
			this.container.bind('mouseup.chosen', function (evt) {
				_this.container_mouseup(evt);
			});
			this.container.bind('mouseenter.chosen', function (evt) {
				_this.mouse_enter(evt);
			});
			this.container.bind('mouseleave.chosen', function (evt) {
				_this.mouse_leave(evt);
			});
			this.search_results.bind('mouseup.chosen', function (evt) {
				_this.search_results_mouseup(evt);
			});
			this.search_results.bind('mouseover.chosen', function (evt) {
				_this.search_results_mouseover(evt);
			});
			this.search_results.bind('mouseout.chosen', function (evt) {
				_this.search_results_mouseout(evt);
			});
			this.search_results.bind('mousewheel.chosen DOMMouseScroll.chosen', function (evt) {
				_this.search_results_mousewheel(evt);
			});
			this.search_results.bind('touchstart.chosen', function (evt) {
				_this.search_results_touchstart(evt);
			});
			this.search_results.bind('touchmove.chosen', function (evt) {
				_this.search_results_touchmove(evt);
			});
			this.search_results.bind('touchend.chosen', function (evt) {
				_this.search_results_touchend(evt);
			});
			this.form_field_jq.bind("chosen:updated.chosen", function (evt) {
				_this.results_update_field(evt);
			});
			this.form_field_jq.bind("chosen:activate.chosen", function (evt) {
				_this.activate_field(evt);
			});
			this.form_field_jq.bind("chosen:open.chosen", function (evt) {
				_this.container_mousedown(evt);
			});
			this.form_field_jq.bind("chosen:close.chosen", function (evt) {
				_this.input_blur(evt);
			});
			this.search_field.bind('blur.chosen', function (evt) {
				_this.input_blur(evt);
			});
			this.search_field.bind('keyup.chosen', function (evt) {
				_this.keyup_checker(evt);
			});
			this.search_field.bind('keydown.chosen', function (evt) {
				_this.keydown_checker(evt);
			});
			this.search_field.bind('focus.chosen', function (evt) {
				_this.input_focus(evt);
			});
			this.search_field.bind('cut.chosen', function (evt) {
				_this.clipboard_event_checker(evt);
			});
			this.search_field.bind('paste.chosen', function (evt) {
				_this.clipboard_event_checker(evt);
			});
			if (this.is_multiple) {
				return this.search_choices.bind('click.chosen', function (evt) {
					_this.choices_click(evt);
				});
			} else {
				return this.container.bind('click.chosen', function (evt) {
					evt.preventDefault();
				});
			}
		};

		Chosen.prototype.destroy = function () {
			$(this.container[0].ownerDocument).unbind("click.chosen", this.click_test_action);
			if (this.search_field[0].tabIndex) {
				this.form_field_jq[0].tabIndex = this.search_field[0].tabIndex;
			}
			this.container.remove();
			this.form_field_jq.removeData('chosen');
			return this.form_field_jq.show();
		};

		Chosen.prototype.search_field_disabled = function () {
			this.is_disabled = this.form_field_jq[0].disabled;
			if (this.is_disabled) {
				this.container.addClass('chosen-disabled');
				this.search_field[0].disabled = true;
				if (!this.is_multiple) {
					this.selected_item.unbind("focus.chosen", this.activate_action);
				}
				return this.close_field();
			} else {
				this.container.removeClass('chosen-disabled');
				this.search_field[0].disabled = false;
				if (!this.is_multiple) {
					return this.selected_item.bind("focus.chosen", this.activate_action);
				}
			}
		};

		Chosen.prototype.container_mousedown = function (evt) {
			if (!this.is_disabled) {
				if (evt && evt.type === "mousedown" && !this.results_showing) {
					evt.preventDefault();
				}
				if (!((evt != null) && ($(evt.target)).hasClass("search-choice-close"))) {
					if (!this.active_field) {
						if (this.is_multiple) {
							this.search_field.val("");
						}
						$(this.container[0].ownerDocument).bind('click.chosen', this.click_test_action);
						this.results_show();
					} else if (!this.is_multiple && evt && (($(evt.target)[0] === this.selected_item[0]) || $(evt.target).parents("a.chosen-single").length)) {
						evt.preventDefault();
						this.results_toggle();
					}
					return this.activate_field();
				}
			}
		};

		Chosen.prototype.container_mouseup = function (evt) {
			if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
				return this.results_reset(evt);
			}
		};

		Chosen.prototype.search_results_mousewheel = function (evt) {
			var delta;
			if (evt.originalEvent) {
				delta = evt.originalEvent.deltaY || -evt.originalEvent.wheelDelta || evt.originalEvent.detail;
			}
			if (delta != null) {
				evt.preventDefault();
				if (evt.type === 'DOMMouseScroll') {
					delta = delta * 40;
				}
				return this.search_results.scrollTop(delta + this.search_results.scrollTop());
			}
		};

		Chosen.prototype.blur_test = function (evt) {
			if (!this.active_field && this.container.hasClass("chosen-container-active")) {
				return this.close_field();
			}
		};

		Chosen.prototype.close_field = function () {
			$(this.container[0].ownerDocument).unbind("click.chosen", this.click_test_action);
			this.active_field = false;
			this.results_hide();
			this.container.removeClass("chosen-container-active");
			this.clear_backstroke();
			this.show_search_field_default();
			return this.search_field_scale();
		};

		Chosen.prototype.activate_field = function () {
			this.container.addClass("chosen-container-active");
			this.active_field = true;
			this.search_field.val(this.search_field.val());
			return this.search_field.focus();
		};

		Chosen.prototype.test_active_click = function (evt) {
			var active_container;
			active_container = $(evt.target).closest('.chosen-container');
			if (active_container.length && this.container[0] === active_container[0]) {
				return this.active_field = true;
			} else {
				return this.close_field();
			}
		};

		Chosen.prototype.results_build = function () {
			this.parsing = true;
			this.selected_option_count = null;
			this.results_data = SelectParser.select_to_array(this.form_field);
			if (this.is_multiple) {
				this.search_choices.find("li.search-choice").remove();
			} else if (!this.is_multiple) {
				this.single_set_selected_text();
				if (this.disable_search || this.form_field.options.length <= this.disable_search_threshold) {
					this.search_field[0].readOnly = true;
					this.container.addClass("chosen-container-single-nosearch");
				} else {
					this.search_field[0].readOnly = false;
					this.container.removeClass("chosen-container-single-nosearch");
				}
			}
			this.update_results_content(this.results_option_build({
				first: true
			}));
			this.search_field_disabled();
			this.show_search_field_default();
			this.search_field_scale();
			return this.parsing = false;
		};

		Chosen.prototype.result_do_highlight = function (el) {
			var high_bottom, high_top, maxHeight, visible_bottom, visible_top;
			if (el.length) {
				this.result_clear_highlight();
				this.result_highlight = el;
				this.result_highlight.addClass("highlighted");
				maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
				visible_top = this.search_results.scrollTop();
				visible_bottom = maxHeight + visible_top;
				high_top = this.result_highlight.position().top + this.search_results.scrollTop();
				high_bottom = high_top + this.result_highlight.outerHeight();
				if (high_bottom >= visible_bottom) {
					return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
				} else if (high_top < visible_top) {
					return this.search_results.scrollTop(high_top);
				}
			}
		};

		Chosen.prototype.result_clear_highlight = function () {
			if (this.result_highlight) {
				this.result_highlight.removeClass("highlighted");
			}
			return this.result_highlight = null;
		};

		Chosen.prototype.results_show = function () {
			if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
				this.form_field_jq.trigger("chosen:maxselected", {
					chosen: this
				});
				return false;
			}
			this.container.addClass("chosen-with-drop");
			this.results_showing = true;
			this.search_field.focus();
			this.search_field.val(this.search_field.val());
			this.winnow_results();
			return this.form_field_jq.trigger("chosen:showing_dropdown", {
				chosen: this
			});
		};

		Chosen.prototype.update_results_content = function (content) {
			return this.search_results.html(content);
		};

		Chosen.prototype.results_hide = function () {
			if (this.results_showing) {
				this.result_clear_highlight();
				this.container.removeClass("chosen-with-drop");
				this.form_field_jq.trigger("chosen:hiding_dropdown", {
					chosen: this
				});
			}
			return this.results_showing = false;
		};

		Chosen.prototype.set_tab_index = function (el) {
			var ti;
			if (this.form_field.tabIndex) {
				ti = this.form_field.tabIndex;
				this.form_field.tabIndex = -1;
				return this.search_field[0].tabIndex = ti;
			}
		};

		Chosen.prototype.set_label_behavior = function () {
			var _this = this;
			this.form_field_label = this.form_field_jq.parents("label");
			if (!this.form_field_label.length && this.form_field.id.length) {
				this.form_field_label = $("label[for='" + this.form_field.id + "']");
			}
			if (this.form_field_label.length > 0) {
				return this.form_field_label.bind('click.chosen', function (evt) {
					if (_this.is_multiple) {
						return _this.container_mousedown(evt);
					} else {
						return _this.activate_field();
					}
				});
			}
		};

		Chosen.prototype.show_search_field_default = function () {
			if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
				this.search_field.val(this.default_text);
				return this.search_field.addClass("default");
			} else {
				this.search_field.val("");
				return this.search_field.removeClass("default");
			}
		};

		Chosen.prototype.search_results_mouseup = function (evt) {
			var target;
			target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
			if (target.length) {
				this.result_highlight = target;
				this.result_select(evt);
				return this.search_field.focus();
			}
		};

		Chosen.prototype.search_results_mouseover = function (evt) {
			var target;
			target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
			if (target) {
				return this.result_do_highlight(target);
			}
		};

		Chosen.prototype.search_results_mouseout = function (evt) {
			if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
				return this.result_clear_highlight();
			}
		};

		Chosen.prototype.choice_build = function (item) {
			var choice, close_link,
			  _this = this;
			choice = $('<li />', {
				"class": "search-choice"
			}).html("<span>" + (this.choice_label(item)) + "</span>");
			if (item.disabled) {
				choice.addClass('search-choice-disabled');
			} else {
				close_link = $('<a />', {
					"class": 'search-choice-close',
					'data-option-array-index': item.array_index
				});
				close_link.bind('click.chosen', function (evt) {
					return _this.choice_destroy_link_click(evt);
				});
				choice.append(close_link);
			}
			return this.search_container.before(choice);
		};

		Chosen.prototype.choice_destroy_link_click = function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if (!this.is_disabled) {
				return this.choice_destroy($(evt.target));
			}
		};

		Chosen.prototype.choice_destroy = function (link) {
			if (this.result_deselect(link[0].getAttribute("data-option-array-index"))) {
				this.show_search_field_default();
				if (this.is_multiple && this.choices_count() > 0 && this.search_field.val().length < 1) {
					this.results_hide();
				}
				link.parents('li').first().remove();
				return this.search_field_scale();
			}
		};

		Chosen.prototype.results_reset = function () {
			this.reset_single_select_options();
			this.form_field.options[0].selected = true;
			this.single_set_selected_text();
			this.show_search_field_default();
			this.results_reset_cleanup();
			this.form_field_jq.trigger("change");
			if (this.active_field) {
				return this.results_hide();
			}
		};

		Chosen.prototype.results_reset_cleanup = function () {
			this.current_selectedIndex = this.form_field.selectedIndex;
			return this.selected_item.find("abbr").remove();
		};

		Chosen.prototype.result_select = function (evt) {
			var high, item;
			if (this.result_highlight) {
				high = this.result_highlight;
				this.result_clear_highlight();
				if (this.is_multiple && this.max_selected_options <= this.choices_count()) {
					this.form_field_jq.trigger("chosen:maxselected", {
						chosen: this
					});
					return false;
				}
				if (this.is_multiple) {
					high.removeClass("active-result");
				} else {
					this.reset_single_select_options();
				}
				high.addClass("result-selected");
				item = this.results_data[high[0].getAttribute("data-option-array-index")];
				item.selected = true;
				this.form_field.options[item.options_index].selected = true;
				this.selected_option_count = null;
				if (this.is_multiple) {
					this.choice_build(item);
				} else {
					this.single_set_selected_text(this.choice_label(item));
				}
				if (!((evt.metaKey || evt.ctrlKey) && this.is_multiple)) {
					this.results_hide();
				}
				this.show_search_field_default();
				if (this.is_multiple || this.form_field.selectedIndex !== this.current_selectedIndex) {
					this.form_field_jq.trigger("change", {
						'selected': this.form_field.options[item.options_index].value
					});
				}
				this.current_selectedIndex = this.form_field.selectedIndex;
				evt.preventDefault();
				return this.search_field_scale();
			}
		};

		Chosen.prototype.single_set_selected_text = function (text) {
			if (text == null) {
				text = this.default_text;
			}
			if (text === this.default_text) {
				this.selected_item.addClass("chosen-default");
			} else {
				this.single_deselect_control_build();
				this.selected_item.removeClass("chosen-default");
			}
			return this.selected_item.find("span").html(text);
		};

		Chosen.prototype.result_deselect = function (pos) {
			var result_data;
			result_data = this.results_data[pos];
			if (!this.form_field.options[result_data.options_index].disabled) {
				result_data.selected = false;
				this.form_field.options[result_data.options_index].selected = false;
				this.selected_option_count = null;
				this.result_clear_highlight();
				if (this.results_showing) {
					this.winnow_results();
				}
				this.form_field_jq.trigger("change", {
					deselected: this.form_field.options[result_data.options_index].value
				});
				this.search_field_scale();
				return true;
			} else {
				return false;
			}
		};

		Chosen.prototype.single_deselect_control_build = function () {
			if (!this.allow_single_deselect) {
				return;
			}
			if (!this.selected_item.find("abbr").length) {
				this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
			}
			return this.selected_item.addClass("chosen-single-with-deselect");
		};

		Chosen.prototype.get_search_text = function () {
			return $('<div/>').text($.trim(this.search_field.val())).html();
		};

		Chosen.prototype.winnow_results_set_highlight = function () {
			var do_high, selected_results;
			selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
			do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
			if (do_high != null) {
				return this.result_do_highlight(do_high);
			}
		};

		Chosen.prototype.no_results = function (terms) {
			var no_results_html;
			no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
			no_results_html.find("span").first().html(terms);
			this.search_results.append(no_results_html);
			return this.form_field_jq.trigger("chosen:no_results", {
				chosen: this
			});
		};

		Chosen.prototype.no_results_clear = function () {
			return this.search_results.find(".no-results").remove();
		};

		Chosen.prototype.keydown_arrow = function () {
			var next_sib;
			if (this.results_showing && this.result_highlight) {
				next_sib = this.result_highlight.nextAll("li.active-result").first();
				if (next_sib) {
					return this.result_do_highlight(next_sib);
				}
			} else {
				return this.results_show();
			}
		};

		Chosen.prototype.keyup_arrow = function () {
			var prev_sibs;
			if (!this.results_showing && !this.is_multiple) {
				return this.results_show();
			} else if (this.result_highlight) {
				prev_sibs = this.result_highlight.prevAll("li.active-result");
				if (prev_sibs.length) {
					return this.result_do_highlight(prev_sibs.first());
				} else {
					if (this.choices_count() > 0) {
						this.results_hide();
					}
					return this.result_clear_highlight();
				}
			}
		};

		Chosen.prototype.keydown_backstroke = function () {
			var next_available_destroy;
			if (this.pending_backstroke) {
				this.choice_destroy(this.pending_backstroke.find("a").first());
				return this.clear_backstroke();
			} else {
				next_available_destroy = this.search_container.siblings("li.search-choice").last();
				if (next_available_destroy.length && !next_available_destroy.hasClass("search-choice-disabled")) {
					this.pending_backstroke = next_available_destroy;
					if (this.single_backstroke_delete) {
						return this.keydown_backstroke();
					} else {
						return this.pending_backstroke.addClass("search-choice-focus");
					}
				}
			}
		};

		Chosen.prototype.clear_backstroke = function () {
			if (this.pending_backstroke) {
				this.pending_backstroke.removeClass("search-choice-focus");
			}
			return this.pending_backstroke = null;
		};

		Chosen.prototype.keydown_checker = function (evt) {
			var stroke, _ref1;
			stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
			this.search_field_scale();
			if (stroke !== 8 && this.pending_backstroke) {
				this.clear_backstroke();
			}
			switch (stroke) {
				case 8:
					this.backstroke_length = this.search_field.val().length;
					break;
				case 9:
					if (this.results_showing && !this.is_multiple) {
						this.result_select(evt);
					}
					this.mouse_on_container = false;
					break;
				case 13:
					if (this.results_showing) {
						evt.preventDefault();
					}
					break;
				case 32:
					if (this.disable_search) {
						evt.preventDefault();
					}
					break;
				case 38:
					evt.preventDefault();
					this.keyup_arrow();
					break;
				case 40:
					evt.preventDefault();
					this.keydown_arrow();
					break;
			}
		};

		Chosen.prototype.search_field_scale = function () {
			var div, f_width, h, style, style_block, styles, w, _i, _len;
			if (this.is_multiple) {
				h = 0;
				w = 0;
				style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
				styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
				for (_i = 0, _len = styles.length; _i < _len; _i++) {
					style = styles[_i];
					style_block += style + ":" + this.search_field.css(style) + ";";
				}
				div = $('<div />', {
					'style': style_block
				});
				div.text(this.search_field.val());
				$('body').append(div);
				w = div.width() + 25;
				div.remove();
				f_width = this.container.outerWidth();
				if (w > f_width - 10) {
					w = f_width - 10;
				}
				return this.search_field.css({
					'width': w + 'px'
				});
			}
		};

		return Chosen;

	})(AbstractChosen);

}).call(this);


// Shut wrapper
//https://harvesthq.github.io/chosen/options.html
(function ($) {
	if (!$.Sh) {
		$.Sh = {};
	};
	if (!$.Res) {
		$.Res = {};
	}

	$.Sh.Chosen = function (options) {

		var _options = {
			deselect: this.data("deselect"),
			
			nosearh: this.data("nosearch"),
			threshold: this.data("threshold"),
			noresults: this.data("noresults"),
			width: this.data("width")
		};
		this.ShChosen( $.extend(_options, options));
	};
	$.Sh.Chosen.defaults = {
		threshold: 1,
		noresults: $.Res.NoResults
	};
	var Chosen = function (el, options) {

		this.element = el;

		this.options = $.extend({}, $.Sh.Chosen.defaults, options);

		if (this.options.deselect) {
			var _select = $('<option></option>').prependTo(this.element);
			if (!this.element.find("option[selected]").length) this.element.get(0).selectedIndex = 0;
		}

		this.element.chosen({
			allow_single_deselect: this.options.deselect,
			disable_search: this.options.nosearch,
			disable_search_threshold: this.options.threshold,
			no_results_text: this.options.noresults,
			width: this.options.width
		});

		//Sept 23, 2016 changed js property dselect to deselect
	};

	
	// plugin
	$.fn.ShChosen = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.chosen")) {
				$(this).data("sh.chosen", new Chosen($(this), options));
			}

		});
	};

})(jQuery);
(function ($) {
	if (!$.Sh) {
		$.Sh = {};
	};
	
	$.Sh.Date = function (options) {
		// a bridge, set up options from data-
		
		var _options = {
			changeMonth: this.data("changemonth"),
			changeYear: this.data("changeyear"),
			dateFormat: this.data("dateformat"),
			maxDate: this.data("maxdate"),
			minDate: this.data("mindate"),
			defaultDate: this.data("default-date")
		};

		this.ShDate($.extend(_options, options));		
		return this.data("sh.date");
	};

	// expose default options
	$.Sh.Date.defaults = {
		dateFormat: $.Res.Localization.DateFormat,
		maxDate: null,
		minDate: null
	};
	// constructor, not exposed
	var DateControl = function (el, options) {

		// extend options
		this.options = $.extend({}, $.Sh.Date.defaults, options);

		this.element = el;

		// initialize
		this.init();
	};

	DateControl.prototype = {

		init: function () {
			
			var base = this;
			// if default value set, pass setDate

			this.element.datepicker({
				dateFormat: base.options.dateFormat,
				changeMonth: base.options.changeMonth,
				changeYear: base.options.changeYear,
				minDate: base.options.minDate,
				maxDate: base.options.maxDate,
				defaultDate: base.options.defaultDate
			});


			// this.element.datepicker()
			this.instance = this.element.data("datepicker");

			

			// return instance
			return this;
		},
		setLimit: function (date, limit) {
			if (!date || date == "") return this;
			date = $.datepicker.parseDate(this.options.dateFormat, date, this.instance.settings);
			this.element.datepicker("option", limit == "min" ? "minDate" : "maxDate", date);

			return this;
		},
		removeLimit: function (limit) {
			this.element.datepicker("option", limit == "min" ? "minDate" : "maxDate", null);
			return this;
		}

	};

	// plugin
	$.fn.ShDate= function (options) {
		return this.each(function () {
			if (!$(this).data("sh.date")) {
				$(this).data("sh.date", new DateControl($(this), options));
			}

		});
	};


	// date range
	$.Sh.DateRange = function () {
		
		this.ShDateRange();
		return this.data("sh.daterange");
	};
	var DateRangeControl = function (el) {

		var dateFrom = el.find("[data-from]"),
			dateTo = el.find("[data-to]"),
			_this = this;

		this.dateFromO = $.Sh.Date.call(dateFrom).setLimit(dateTo.val(), "max");
		this.dateToO = $.Sh.Date.call(dateTo).setLimit(dateFrom.val(), "min");

		
		dateFrom.datepicker("option", "onSelect", function (date) { _this.dateToO.setLimit(date, "min") });
		dateTo.datepicker("option", "onSelect", function (date) { _this.dateFromO.setLimit(date, "max") });
	};

	
	// plugin
	$.fn.ShDateRange = function () {
		return this.each(function () {
			if (!$(this).data("sh.daterange")) {
				$(this).data("sh.daterange", new DateRangeControl($(this)));
			}

		});
	};

})(jQuery);

(function($) {
    if (!$.Sh) {
        $.Sh = {};
    };

    $.Sh.Expands = function(options) {
        // a bridge, set up options from data-
        var _options = {
            onInit: $.getFunction(this, "oninit"),
            onShow: $.getFunction(this, "onshow"),
            onHide: $.getFunction(this, "onhide"),
            onToggle: $.getFunction(this, "ontoggle"),
            onBeforeShow: $.getFunction(this, "onbeforeshow"),
            onBeforeHide: $.getFunction(this, "onbeforehide"),
            guts: this.data("guts"),
            src: this.data("hsrc"),
            state: this.data("state"),
            active: this.data("active"),
            effect: this.data("effect"),
            togglecss: this.data("toggle-css"),
            hidesrc: this.data("hide-src"),
            showsrc: this.data("show-src"),
            keepDefault: this.data("keep-default") // keep default event without prevention
        };

        this.ShExpands($.extend(_options, options));
        return this.data("sh.expands");
    };



    // expose default options
    $.Sh.Expands.defaults = {
        guts: '>.guts',
        src: '>.h',
        active: true,
        effect: "slide",
        togglecss: "toggle",
        keepDefault: false
    };
    // constructor, not exposed
    var Expands = function(el, options) {

        this.element = el;

        // extend options
        this.options = $.extend({}, $.Sh.Expands.defaults, options);


        this.srcElement = el.find(this.options.src);
        this.gutsElement = el.find(this.options.guts);


        // initialize
        this.init();
    };

    Expands.prototype = {
        // TODO: change src and guts on runtime

        init: function() {

            var base = this;


            this.srcElement.length && this.element.on("click", base.options.src, function(e) {
                base._click(e);
            });

            this.options.hidesrc && this.element.on("click", base.options.hidesrc, function(e) {
                base._click(e, "hide");
            });

            this.options.showsrc && this.element.on("click", base.options.showsrc, function(e) {
                base._click(e, "show");
            });

            base.options.onInit && base.options.onInit.call(this);

            // if to show show by default 
            if (base.options.state == "show") {
                base.show();
            } else {
                base.hide();
            }

            // return instance
            return this;
        },
        addtrigger: function(trigger, verb) {
            // add trigger on runtime from anywhere
            var base = this;

            trigger.on("click", function(e) {
                base._click(e, verb);
            });
        },
        addguts: function(element) {
            // add element as a new gut?
            this.gutsElement.add(element);
        },
        _click: function(e, verb) {
            var base = this;
            if (!base.options.keepDefault) e.preventDefault();
            if (!base.options.active) return;

            if (verb == "hide") {
                base.hide();
                return;
            }
            if (verb == "show") {
                base.show();
                return;
            }
            // normally, toggle
            base.toggle();

        },
        show: function() {

            if (!this.options.active) return;

            if (this.options.onBeforeShow && !this.options.onBeforeShow.call(this)) return this.element;
            //if (this.options.onBeforeShow) {
            //	this.options.onBeforeShow();
            //	return this;
            //}

            // show , if onToggle is defined, i should find out whether to call it or not according to what? visible state
            this.options.state = "show";
            if (!this.gutsElement.is(":visible")) {

                this.options.onToggle && this.options.onToggle.call(this); // fire toggle

                switch (this.options.effect) {
                    case "slide":
                        this.gutsElement.slideDown("fast"); // show
                        break;
                    case "fade":
                        this.gutsElement.fadeIn();
                        break;
                    case "none":
                        this.gutsElement.show();
                        break;
                }

            }
            // i think i should return if element is already visibt
            
            this.element.addClass(this.options.togglecss);
            this.options.onShow && this.options.onShow.call(this); // fire onshow anyway // double check
            return this.element;

        },
        toggle: function() {

            if (!this.options.active) return;

            // for effects of slide and fade
            if (this.gutsElement.is(":visible")) {
                this.hide();
            } else {
                this.show();
            }

            return this.element;

        },
        hide: function() {
            if (!this.options.active) return;

            if (this.options.onBeforeHide && !this.options.onBeforeHide.call(this)) return this;
            //if (this.options.onBeforeHide) {
            //	this.options.onBeforeHide.call(this);
            //	return this;
            //}
            this.options.state = null;
            if (this.gutsElement.is(":visible")) {
                this.options.onToggle && this.options.onToggle.call(this); // fire toggle, this shouldnt fire always
                switch (this.options.effect) {
                    case "slide":
                        this.gutsElement.slideUp("fast");
                        break;
                    case "fade":
                        this.gutsElement.fadeOut();
                        break;
                    case "none":
                        this.gutsElement.hide();
                        break;
                }

            }
            
            this.element.removeClass(this.options.togglecss);
            this.options.onHide && this.options.onHide.call(this);
            return this.element;
        },
        setActive: function(bActive) {
            this.options.active = bActive;
        }

    };

    // plugin
    $.fn.ShExpands = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.expands")) {
                $(this).data("sh.expands", new Expands($(this), options));
            }

        });
    };

    $.Sh.AltExpands = function() {
        // on click to show hide src, show guts, on hide, show src

        $.Sh.Expands.call(this, {
            onShow: function() {
                this.srcElement.hide();
            },
            onHide: function() {
                this.srcElement.show();
            }
        });

    };
    $.Sh.ExpandOnce = function() {
        $.Sh.Expands.call(this, {
            effect: "none",
            onShow: function() {
                this.srcElement.remove();
            }
        });
    };

    $.Sh.PopList = function(options) {
        // click element to show hide a well position absolute layer
        var _options = {
            onShow: function() {
                // position
                this.gutsElement.position({
                    of: this.srcElement,
                    my: "center top",
                    at: "center bottom",
                    collision: "fit fit" // watch this
                });
            }
        };


        var o = $.Sh.Expands.call(this, $.extend(_options, options));
        this.data("ondocumentclick", function(e) {

            if (!jQuery.contains(this.get(0), e.target)) {
                o.hide();
            }
        });
        $.popbasket.push(this);

        return o;
    };

    $.Sh.ExpandLabel = function(options) {
        // onshow or hide, change srcelemnet according to passed attributes
        var slabel, hlabel;

        var _thisoptions = {
            mono: this.data("mono"),
            listsize: this.data("list-size"),
            gutscss: this.data("guts-css"),
            selector: this.data("selector"),
            slabel: this.data("show-label"),
            hlabel: this.data("hide-label")
        }
        _thisoptions = $.extend({}, $.Sh.ExpandLabel.defaults, _thisoptions, options);

        if (_thisoptions.mono) {
            this.find(_thisoptions.selector + ":gt(" + (_thisoptions.listsize - 1) + ")").addClass(_thisoptions.gutscss);
        }


        // reset options
        var _options = {
            onInit: function() {
                (this.options.state == "show") ? this.srcElement.html(_thisoptions.hlabel): this.srcElement.html(_thisoptions.slabel);
                if (this.gutsElement.length == 0) this.srcElement.hide();
            },
            onShow: function() {
                this.srcElement.html(_thisoptions.hlabel);
            },
            onHide: function() {
                this.srcElement.html(_thisoptions.slabel);
            }

        };

        var o = $.Sh.Expands.call(this, $.extend(_options, options));
        return o;

    };

    $.Sh.ExpandLabel.defaults = {
        mono: false,
        gutscss: "guts",
        listsize: 3,
        selector: "li",
        slabel: $.Res.More,
        hlabel: $.Res.Less
    };

    $.Sh.FilterList = function(options) {
        // a bridge, set up options from data-
        //attach Expands first then use to gather items


        var o = $.Sh.PopList.call(this, options);
        var _options = {
            itemselector: this.data("itemselector"),
            selected: this.data("selected"), // object
            selectedValue: this.data("selected-value"), // value
            css: this.data("css"),
            onchange: this.data("onchange"),
            html: this.data("html"),
            expands: o
        };

        this.ShFilterList($.extend(_options, options));

    };

    // expose default options
    $.Sh.FilterList.defaults = {
        itemselector: "li",
        css: "selected",
        html: false
    };
    // constructor, not exposed
    var FilterList = function(el, options) {
        // extend options
        this.options = $.extend({}, $.Sh.FilterList.defaults, options);
        this.element = el;

        this.expands = this.options.expands; // inherits expands

        this.items = this.expands.gutsElement.find(this.options.itemselector);

        // if no selected, find selected
        if (!this.options.selected) {
            // find selected by value or by selected css
            this.options.selected = this.options.selectedValue ? this.items.filter("[data-value='{0}']".format(this.options.selectedValue)) : this.items.filter("." + this.options.css).first();

            // still not found, get first
            if (!this.options.selected.length)
                this.options.selected = this.items.first();
        }


        // initialize
        this.init(options);
    };

    FilterList.prototype = {
        init: function(options) {

            var base = this;
            // update src element with selected element
            this.expands.gutsElement.on("click", this.options.itemselector, function(e) {
                base._click(e, $(this));
            });

            // select selected item
            this.select(this.options.selected);

        },
        _click: function(e, src) {
            // change selected
            if (!this.options.selected.is(src)) {
                this.items.removeClass(this.options.css);
                this.select(src);
                this.options.onchange && this.options.onchange.call(this, src);
            }

            //hide
            this.expands.hide();
            //e.preventDefault();

        },
        additem: function(item) {
            $.merge(this.options.items, item);
        },
        select: function(item) {
            item.addClass(this.options.css);
            this.options.html ? this.expands.srcElement.html(item.html()) : this.expands.srcElement.text(item.text()); // watch
            this.options.selected = item;


        }
    };

    // plugin
    $.fn.ShFilterList = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.filterlist")) {
                $(this).data("sh.filterlist", new FilterList($(this), options));
            }

        });
    };


    // TABS: client tabs
    $.Sh.Tabs = function(options) {
        // guts
        // exapnds, after adding group and guts

        var _options = {
            onSelect: $.getFunction(this, "onselect"),
            onLoad: $.getFunction(this, "onload"),
            toggle: this.data("toggle"),
            effect: this.data("effect"),
            tabSelector: this.data("tabs"),
            selectcss: this.data("selected-css")
        };


        this.ShTabs($.extend(_options, options));
        return $(this).data("sh.tabs");
    };

    // expose default options
    $.Sh.Tabs.defaults = {
        delay: false,
        toggle: false,
        effect: "slide",
        selectcss: "selected"
    };

    var Tabs = function(el, options) {

        this.element = el;
        // extend options
        this.options = $.extend({}, $.Sh.Tabs.defaults, options);

        this.collection = [];
        this.group = this.element.find(this.options.tabSelector);


        // initialize
        this.init();
    };

    Tabs.prototype = {

        init: function() {

            var base = this;

            $.each(base.group, function(i, o) {
                var expands = $.Sh.Expands.call($(o), { effect: base.options.effect });
                expands.gutsElement = $($(o).data("guts")); // TODO: context

                base.collection.push(expands);
            });

            // selected or first item
            var selected = base.group.filter("." + base.options.selectcss);
            base.selected = selected.length ? selected.data("sh.expands") : base.group.first().data("sh.expands");

            base.group.on("click", function(e) {
                e.preventDefault();
                // select tab
                base.select($(this).data("sh.expands"));

            });

            // on load may change selected
            base.options.onLoad && base.options.onLoad.call(base);

            // select if one is selected
            base.selected && base.select(base.selected);

            // return instance
            return this;
        },
        select: function(item) {
            // make all unselected and make item selected
            // fire hide all, then show this
            var base = this;
            if (item.options.state == "show" && !base.options.toggle) return;

            $.each(base.collection, function(i, o) {
                o.hide();
                o.element.removeClass(base.options.selectcss);
            });

            item.show();
            item.element.addClass(base.options.selectcss);

            base.selected = item;

            base.options.onSelect && base.options.onSelect.call(base);
        }

    };

    // plugin
    $.fn.ShTabs = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.tabs")) {
                $(this).data("sh.tabs", new Tabs($(this), options));
            }

        });
    };


})(jQuery);

(function ($) {
	if (!$.Sh) {
		$.Sh = {};
	};

	$.Sh.Radio = function (options) {
		// a bridge, set up options from data-
		var _options = {
			container: this.data('container'),
			css: this.data('checked'),
			onCheck: $.getFunction(this, "oncheck"),
			onUncheck: $.getFunction(this, "onuncheck"),
			onChange: $.getFunction(this, "onchange"),
			onDblCheck: $.getFunction(this, "ondblcheck")
		};


		this.ShRadio($.extend(_options, options));
		
		return this.data("sh.radio");
	};

	// expose default options
	$.Sh.Radio.defaults = {
		container: "label",
		css: "checked"
	};
	// constructor, not exposed
	var Radio = function (el, options) {

		this.element = el;

		this.options = $.extend({}, $.Sh.Radio.defaults, options);

		this.control = this.element.find('input[type="radio"]:first');

		this.group = $('input[name="' + this.control.attr("name") + '"]'); // get the whole group

		this.checked = this.control.is(":checked");
		if (this.checked) this.element.addClass(this.options.css);

		// initialize
		this.init();
	};

	Radio.prototype = {

		init: function () {

			var base = this;

			// TODO, disabled and readonly, hover effect


			base.control.on("click", function () {
				// if already checked, fire special event
				if (base.checked) {
					if (base.options.onDblCheck) base.options.onDblCheck.call(base);
				} else {
					// remove checked from group (TODO: may be i should exclude current?)
					base.group.each(function () {
						
						if (!$(this).is(base.control)) {
							
							var shRadio = $(this).closest(base.options.container);
							if (shRadio.data("sh.radio")) {
								//shRadio.removeClass(base.options.css).data("sh.radio").checked = false;
								shRadio.data("sh.radio").uncheck();
							}
						}
					});
					base.element.addClass(base.options.css);
					base.checked = true;
					
					if (base.options.onCheck) base.options.onCheck.call(base);
				}



			});
			base.control.on("change", function () {
				if (base.options.onChange) base.options.onChange.call(base, this.checked);
			});


			return this;

		},
		uncheck: function () {

			var base = this;

			base.control.removeProp('checked');
			base.element.removeClass(base.options.css);
			base.checked = false;
			
			if (base.options.onUncheck) base.options.onUncheck.call(base);
			return base;
		},
		add: function (elememt) {
			// add element to group
			this.group.add(element);
		}

	};

	// plugin
	$.fn.ShRadio = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.radio")) {
				$(this).data("sh.radio", new Radio($(this), options));
			}

		});
	};

	$.Sh.RadioGroup = function (options) {
		var $radiogroup = this,
			container = this.data("container") || "label",
			css = this.data("css"),
			$containers = this.find(container);

		// for each container, Radio
		$containers.each(function () {
			var _label = $.Sh.Radio.call($(this), $.extend({ container: container, css: css }, options));
			if (_label.checked) $radiogroup.data("selected",_label);
		});

		
	};


	// CHECKBOX

	$.Sh.Checkbox = function (options) {
		// a bridge, set up options from data-
		var _options = {
			css: this.data("css"),
			onCheck: $.getFunction(this, "oncheck"),
			onUncheck: $.getFunction(this, "onuncheck")
		};


		this.ShCheckbox($.extend(_options, options));
		return this.data("sh.checkbox");
	};

	// expose default options
	$.Sh.Checkbox.defaults = {
		css: 'checked'
	};
	// constructor, not exposed
	var Checkbox = function (el, options) {

		this.element = el;

		// extend options
		this.options = $.extend({}, $.Sh.Checkbox.defaults, options);

		this.control = this.element.find('input[type="checkbox"]:first');

		this.group = $('input[name="' + this.control.attr("name") + '"]'); // get the whole group

		this.checked = this.control.is(":checked");
		if (this.checked) this.element.addClass(this.options.css);

		// initialize
		this.init();
	};

	Checkbox.prototype = {

		init: function (options) {

			var base = this;

			// TODO, disabled and readonly, hover effect


			base.control.on("click", function () {
				
				// TODO: if already checked, fire special event
				base.toggle(this.checked);

			});
			
			return this;

		},
		check: function(){
			this.toggle(true);
		},
		uncheck: function () {
			this.toggle(false);
		},
		toggle: function (checked) {
			var base = this;
			checked ? base.element.addClass(base.options.css) : base.element.removeClass(base.options.css);
			checked ? base.control.prop('checked', true) : base.control.removeProp('checked');
			base.checked = checked;

			if (checked && base.options.onCheck) base.options.onCheck.call(base);
			if (!checked && base.options.onUncheck) base.options.onUncheck.call(base);

		},
		add: function (elememt) {
			// add element to group
			this.group.add(element);
		}


	};

	// plugin
	$.fn.ShCheckbox = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.checkbox")) {
				$(this).data("sh.checkbox", new Checkbox($(this), options));
			}

		});
	};


	$.Sh.TallField = function () {
		// for tall fields only, hide background image of required if text is larger than 90% of field

		var _currentW = this.width() * 0.9,
			$this = this;
		this.on("blur", function () {
			var s = $("<span />").text($this.ShTrim()).appendTo($.props.$body);
			var _w = s.width();
			s.remove();

			if (_w > _currentW) {
				$this.addClass("clearit");
			} else {
				$this.removeClass("clearit");
			}
		});

		this.trigger("blur");
		
	};

})(jQuery);


/**
* formToArray() gathers form element data into an array of objects that can
* be passed to any of the following ajax functions: $.get, $.post, or load.
* Each object in the array has both a 'name' and 'value' property.  An example of
* an array for a simple login form might be:
*
* [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
*
* Methods copied from jquery form plugin
*/

(function ($) {

	$.fn.fieldValue = function (successful) {
		for (var val = [], i = 0, max = this.length; i < max; i++) {
			var el = this[i];
			var v = $.fieldValue(el, successful);
			if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
				continue;
			}
			if (v.constructor == Array)
				$.merge(val, v);
			else
				val.push(v);
		}
		return val;
	};
	/**
	 * Returns the value of the field element.
	 */
	$.fieldValue = function (el, successful) {
		var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
		if (successful === undefined) {
			successful = true;
		}

		if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
			(t == 'checkbox' || t == 'radio') && !el.checked ||
			(t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
			tag == 'select' && el.selectedIndex == -1)) {
			return null;
		}

		if (tag == 'select') {
			var index = el.selectedIndex;
			if (index < 0) {
				return null;
			}
			var a = [], ops = el.options;
			var one = (t == 'select-one');
			var max = (one ? index + 1 : ops.length);
			for (var i = (one ? index : 0) ; i < max; i++) {
				var op = ops[i];
				if (op.selected) {
					var v = op.value;
					if (!v) { // extra pain for IE...
						v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
					}
					if (one) {
						return v;
					}
					a.push(v);
				}
			}
			return a;
		}
		return $(el).val();
	};

	$.fn.formToArray = function (semantic, elements) {
		var a = [];
		if (this.length === 0) {
			return a;
		}

		var form = this[0];
		var els = semantic ? form.getElementsByTagName('*') : form.elements;
		if (!els) {
			return a;
		}

		var i, j, n, v, el, max, jmax;
		for (i = 0, max = els.length; i < max; i++) {
			el = els[i];
			n = el.name;
			if (!n) {
				continue;
			}


			v = $.fieldValue(el, true);

			if (v && v.constructor == Array) {
				if (elements)
					elements.push(el);
				for (j = 0, jmax = v.length; j < jmax; j++) {
					a.push({ name: n, value: v[j], type: el.type });
				}
			}
			else if (v !== null && typeof v != 'undefined') {
				if (elements)
					elements.push(el);
				a.push({ name: n, value: v, type: el.type }); //type: el.type, required: el.required
			}
		}

		return a;
	};

	$.fn.clearForm = function (includeHidden) {
		return this.each(function () {
			$('input,select,textarea', this).clearFields(includeHidden);
		});
	};
	$.fn.clearFields = $.fn.clearInputs = function (includeHidden) {
		var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list
		return this.each(function () {
			var t = this.type, tag = this.tagName.toLowerCase();
			if (re.test(t) || tag == 'textarea') {
				this.value = '';
			}
			else if (t == 'checkbox' || t == 'radio') {
				this.checked = false;
			}
			else if (tag == 'select') {
				this.selectedIndex = null;
			}
			else if (t == "file") {
				if (/MSIE/.test(navigator.userAgent)) {
					$(this).replaceWith($(this).clone());
				} else {
					$(this).val('');
				}
			}
			else if (includeHidden) {
				// includeHidden can be the value true, or it can be a selector string
				// indicating a special test; for example:
				//  $('#myForm').clearForm('.special:hidden')
				// the above would clean hidden inputs that have the class of 'special'
				if ((includeHidden === true && /hidden/.test(t)) ||
					 (typeof includeHidden == 'string' && $(this).is(includeHidden)))
					this.value = '';
			}
		});
	};
	$.fn.resetForm = function () {
		return this.each(function () {
			$('input,select,textarea', this).resetFields();
		});
	};

	$.fn.resetFields = function () {
		var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week|hidden)$/i; // 'hidden' is not in this list
		return this.each(function () {
			var t = this.type, tag = this.tagName.toLowerCase();
			if (re.test(t) || tag == 'textarea') {
				this.value = this.defaultValue;
			}
			else if (t == 'checkbox' || t == 'radio') {
				this.checked = this.defaultChecked;
			}
			else if (tag == 'select') {
				for (var i = 0; i < this.options; i++) {
					this.options[i].selected = defaultSelected;
				}

			}
		});
	};

	$.fn.formToJson = function () {
		var arr = this.formToArray(true);
		_debug(arr, "input array");

		var values = {};
		$.each(arr, function () {
			// if name appears twice join in an array
			if (values[this.name] != null) {
				// create an array first
				if (!(values[this.name] instanceof Array)) {
					var v = values[this.name];
					values[this.name] = [];
					values[this.name].push(v);

				}
				values[this.name].push(this.value);
			} else {
				values[this.name] = this.value;
			}

		});

		return values;
	};

})(jQuery);(function($) {
    if (!$.Sh) {
        $.Sh = {};
    };

    $.Sh.Label = function(options) {
        var _options = {
            text: this.data("label-text"),
            sticky: this.data("sticky"),
            css: this.data("label-css"),
            closecss: this.data('close-css'),
            closetext: this.data("close-text"),
            showCloseBtn: this.data("show-close"),
            location: this.data("label-location"),
            which: this.data("which"), // added sept 23
            showOnLoad: this.data("show-onload"),
            //valid: true, // mmm
            onShow: $.getFunction(this, "onshow"),
            onLoad: $.getFunction(this, "onload"),
            onHide: $.getFunction(this, "onhide"),
        };

        this.ShLabel($.extend(_options, options));
        return this.data("sh.label");
    };


    $.Sh.Label.defaults = {
        text: $.Res.Error,
        sticky: false,
        css: '',
        closecss: 'closelabel',
        closetext: $.Res.Dismiss,
        showCloseBtn: true,
        location: "afterEnd",
        showOnLoad: false,
        //valid: true,
    };
    var Label = function(el, options) {

        this.options = $.extend({}, $.Sh.Label.defaults, options);

        this.element = el;

        this.$label = $("<span></span>").addClass(this.options.css).html(this.options.text);
        this.$closebtn = $("<span />").text(this.options.closetext).addClass(this.options.closecss);

        // initialize
        this.init(this.options);
    };

    Label.prototype = {

        init: function(options) {

            $.extend(this.options, options);

            if (this.options.showOnLoad) {
                this.show(this.options.text);
            }

            (this.options.onLoad) ? this.options.onLoad.call(this.element): null;

            return this;
        },
        show: function(options) {

            var base = this;
            var s = $.extend({}, this.options, options);
            // things that can be passed on runtime:
            // text, css, which, location, sticky, showclosebtn

            if (!this.options.locked) {
                // show according to settings
                this.options.locked = true;

                // reset opacity
                // reset css as well

                this.$label.removeClass(this.options.newCss); // should i remove orginal css as well? no, where else would i add it back
                this.$label.addClass(s.css);
                this.$label.css("opacity", 1);
                this.$label.html(s.text);

                // save new css
                this.options.newCss = s.css;


                // where to insert, inseertAfter, insertBefore, appendTo, prependTo === afterEnd, beforeStart, beforeEnd, afterStart
                // if which is defined, it becomes the target instead of object
                var $target = s.which ? this.element.closest(s.which) : this.element;
                switch (s.location) {

                    case "beforeStart":
                        this.$label.insertBefore($target);
                        break;
                    case "afterStart":
                        this.$label.prependTo($target);
                        break;
                    case "beforeEnd":
                        this.$label.appendTo($target);
                        break;
                    case "afterEnd":
                    default:

                        this.$label.insertAfter($target);
                        break;
                }


                if (!s.sticky) {
                    base.$label.delay(3000).animate({ opacity: 0 }, "slow", function() {
                        base.$label.remove();
                        base.options.locked = false;
                        (base.options.onHide) ? base.options.onHide.call(base.element): null;
                    });
                } else {
                    //this.options.valid = false; // if not sticky
                    // add close button optionally

                    if (s.showCloseBtn) this.$label.append(this.$closebtn);
                    // make an onclick here

                    this.$closebtn.on("click", function() {
                        base.hide();
                    });
                }

                (this.options.onShow) ? this.options.onShow.call(this.element): null;

            }
            return this.element;

        },
        hide: function() {
            this.$label.remove();
            this.options.locked = false;
            (this.options.onHide) ? this.options.onHide.call(this.element): null;

            //if (this.options.sticky) {
            //	this.options.valid = true;
            //}
            return this.element;
        }
    };

    // plugin
    $.fn.ShLabel = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.label")) {
                $(this).data("sh.label", new Label($(this), options));
            }

        });
    };


})(jQuery);/*
 * jqModal - Minimalist Modaling with jQuery
 *
 * Copyright (c) 2007-2015 Brice Burgess @IceburgBrice
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * $Version: 1.3.0 (2015.04.15 +r24)
 * Requires: jQuery 1.2.3+
 */

(function ($) {

	/**
	 * Initialize a set of elements as "modals". Modals typically are popup dialogs,
	 * notices, modal windows, &c. 
	 * 
	 * @name jqm
	 * @param options user defined options, augments defaults.
	 * @type jQuery
	 * @cat Plugins/jqModal
	 */

	$.fn.jqm = function (options) {
		return this.each(function () {
			var e = $(this),
				jqm = e.data('jqm') || $.extend({ ID: I++ }, $.jqm.params),
				o = $.extend(jqm, options);

			// add/extend options to modal and mark as initialized
			e.data('jqm', o).addClass('jqm-init')[0]._jqmID = o.ID;

			// ... Attach events to trigger showing of this modal
			o.trigger && e.jqmAddTrigger(o.trigger);
		});
	};


	/**
	 * Matching modals will have their jqmShow() method fired by attaching a
	 *   onClick event to elements matching `trigger`.
	 * 
	 * @name jqmAddTrigger
	 * @param trigger a selector String, jQuery collection of elements, or a DOM element.
	 */
	$.fn.jqmAddTrigger = function (trigger) {
		return this.each(function () {
			if (!addTrigger($(this), 'jqmShow', trigger))
				err("jqmAddTrigger must be called on initialized modals")
		});
	};


	/**
	 * Matching modals will have their jqmHide() method fired by attaching an
	 *   onClick event to elements matching `trigger`.
	 * 
	 * @name jqmAddClose
	 * @param trigger a selector String, jQuery collection of elements, or a DOM element.
	 */
	$.fn.jqmAddClose = function (trigger) {
		return this.each(function () {
			if (!addTrigger($(this), 'jqmHide', trigger))
				err("jqmAddClose must be called on initialized modals")
		});
	};


	/**
	 * Open matching modals (if not shown)
	 */
	$.fn.jqmShow = function (trigger) {
		return this.each(function () { !this._jqmShown && show($(this), trigger); });
	};

	/**
	 * Close matching modals
	 */
	$.fn.jqmHide = function (trigger) {
		return this.each(function () { this._jqmShown && hide($(this), trigger); });
	};


	// utility functions

	var
		err = function (msg) {
			if (window.console && window.console.error) window.console.error(msg);


		}, show = function (e, t) {

			/**
			 * e = modal element (as jQuery object)
			 * t = triggering element
			 * 
			 * o = options
			 * z = z-index of modal
			 * v = overlay element (as jQuery object)
			 * h = hash (for jqModal <= r15 compatibility)
			 */

			var o = e.data('jqm'),
				t = t || window.event,
				z = (parseInt(e.css('z-index'))),
				z = (z > 0) ? z : 3000,
				v = $('<div></div>').addClass(o.overlayClass).css({ height: '100%', width: '100%', position: 'fixed', left: 0, top: 0, 'z-index': z - 1, opacity: o.overlay / 100 }),

				// maintain legacy "hash" construct
				h = { w: e, c: o, o: v, t: t };

			e.css('z-index', z);

			if (o.ajax) {
				var target = o.target || e,
					url = o.ajax;

				target = (typeof target == 'string') ? $(target, e) : $(target);
				if (url.substr(0, 1) == '@') url = $(t).attr(url.substring(1));

				// load remote contents
				target.load(url, function () {
					o.onLoad && o.onLoad.call(this, h);
				});

				// show modal
				if (o.ajaxText) {
					target.html(o.ajaxText);
				}
				open(h);
			}
			else { open(h); }

		}, hide = function (e, t) {
			/**
			 * e = modal element (as jQuery object)
			 * t = triggering element
			 * 
			 * o = options
			 * h = hash (for jqModal <= r15 compatibility)
			 */

			var o = e.data('jqm'),
				t = t || window.event,

			// maintain legacy "hash" construct
			h = { w: e, c: o, o: e.data('jqmv'), t: t };

			close(h);

		}, onShow = function (hash) {
			// onShow callback. Responsible for showing a modal and overlay.
			//  return false to stop opening modal. 

			// hash object;
			//  w: (jQuery object) The modal element
			//  c: (object) The modal's options object 
			//  o: (jQuery object) The overlay element
			//  t: (DOM object) The triggering element

			// display the overlay (prepend to body) if not disabled
			if (hash.c.overlay > 0)
				hash.o.prependTo('body');

			// make modal visible
			hash.w.show();

			// call focusFunc (attempts to focus on first input in modal)
			$.jqm.focusFunc(hash.w, true);

			return true;


		}, onHide = function (hash) {
			// onHide callback. Responsible for hiding a modal and overlay.
			//  return false to stop closing modal. 

			// hash object;
			//  w: (jQuery object) The modal element
			//  c: (object) The modal's options object 
			//  o: (jQuery object) The overlay element
			//  t: (DOM object) The triggering element

			// hide modal and if overlay, remove overlay.
			hash.w.hide() && hash.o && hash.o.remove();

			return true;


		}, addTrigger = function (m, key, trigger) {
			// addTrigger: Adds a jqmShow/jqmHide (key) event click on modal (m)
			//  to all elements that match trigger string (trigger)
			
			var jqm = m.data('jqm');
			if (jqm) return $(trigger).each(function () {
				this[key] = this[key] || [];

				// register this modal with this trigger only once
				if ($.inArray(jqm.ID, this[key]) < 0) {
					this[key].push(jqm.ID);

					// register trigger click event for this modal
					//  allows cancellation of show/hide event from
					$(this).click(function (e) {
						if (!e.isDefaultPrevented()) m[key](this);
						return false;
					});
				}

			});

		}, open = function (h) {
			// open: executes the onOpen callback + performs common tasks if successful

			// transform legacy hash into new var shortcuts 
			var e = h.w,
				v = h.o,
				o = h.c;


			// execute onShow callback
			if (o.onShow(h) !== false) {
				// mark modal as shown
				e[0]._jqmShown = true;

				// if modal dialog 
				//
				// Bind the Keep Focus Function [F] if no other Modals are open (!ActiveModals[0]) +
				// 
				// else, close dialog when overlay is clicked
				if (o.modal) { !ActiveModals[0] && F('bind'); ActiveModals.push(e[0]); }
				else e.jqmAddClose(v);

				//  Attach closing events to elements inside the modal matching closingClass
				o.closeClass && e.jqmAddClose($('.' + o.closeClass, e));

				// IF toTop is true and overlay exists;
				//  Add placeholder element <span id="jqmP#ID_of_modal"/> before modal to
				//  remember it's position in the DOM and move it to a child of the body tag (after overlay)
				o.toTop && v && e.before('<span id="jqmP' + o.ID + '"></span>').insertAfter(v);

				// remember overlay (for closing function)
				e.data('jqmv', v);

				// close modal if the esc key is pressed and closeOnEsc is set to true
				e.unbind("keydown", $.jqm.closeOnEscFunc);
				if (o.closeOnEsc) {
					e.attr("tabindex", 0).bind("keydown", $.jqm.closeOnEscFunc).focus();
				}
			}


		}, close = function (h) {
			// close: executes the onHide callback + performs common tasks if successful

			// transform legacy hash into new var shortcuts 
			var e = h.w,
			   v = h.o,
			   o = h.c;

			// execute onShow callback
			if (o.onHide(h) !== false) {
				// mark modal as !shown
				e[0]._jqmShown = false;

				// If modal, remove from modal stack.
				// If no modals in modal stack, unbind the Keep Focus Function
				if (o.modal) { ActiveModals.pop(); !ActiveModals[0] && F('unbind'); }

				// IF toTop was passed and an overlay exists;
				//  Move modal back to its "remembered" position.
				o.toTop && v && $('#jqmP' + o.ID).after(e).remove();
			}


		}, F = function (t) {
			// F: The Keep Focus Function (for modal: true dialos)
			// Binds or Unbinds (t) the Focus Examination Function (X) to keypresses and clicks

			$(document)[t]("keypress keydown mousedown", X);


		}, X = function (e) {
			// X: The Focus Examination Function (for modal: true dialogs)

			var targetModal = $(e.target).data('jqm') || $(e.target).parents('.jqm-init:first').data('jqm');
			var activeModal = ActiveModals[ActiveModals.length - 1];

			// allow bubbling if event target is within active modal dialog
			return (targetModal && targetModal.ID == activeModal._jqmID) ?
			  true : $.jqm.focusFunc(activeModal, e);
		},

	I = 0,   // modal ID increment (for nested modals) 
	ActiveModals = [];  // array of active modals (used to lock interactivity to appropriate modal)


	// $.jqm, overridable defaults
	$.jqm = {
		/**
		 *  default options
		 *    
		 * (Integer)   overlay      - [0-100] Translucency percentage (opacity) of the body covering overlay. Set to 0 for NO overlay, and up to 100 for a 100% opaque overlay.  
		 * (String)    overlayClass - Applied to the body covering overlay. Useful for controlling overlay look (tint, background-image, &c) with CSS.
		 * (String)    closeClass   - Children of the modal element matching `closeClass` will fire the onHide event (to close the modal).
		 * (Mixed)     trigger      - Matching elements will fire the onShow event (to display the modal). Trigger can be a selector String, a jQuery collection of elements, a DOM element, or a False boolean.
		 * (String)    ajax         - URL to load content from via an AJAX request. False to disable ajax. If ajax begins with a "@", the URL is extracted from the attribute of the triggering element (e.g. use '@data-url' for; <a href="#" class="jqModal" data-url="modal.html">...)	                
		 * (Mixed)     target       - Children of the modal element to load the ajax response into. If false, modal content will be overwritten by ajax response. Useful for retaining modal design. 
		 *                            Target may be a selector string, jQuery collection of elements, or a DOM element -- and MUST exist as a child of the modal element.
		 * (String)    ajaxText     - Text shown while waiting for ajax return. Replaces HTML content of `target` element.
		 * (Boolean)   modal        - If true, user interactivity will be locked to the modal window until closed.
		 * (Boolean)   toTop        - If true, modal will be posistioned as a first child of the BODY element when opened, and its DOM posistion restored when closed. Useful for overcoming z-Index container issues.
		 * (Function)  onShow       - User defined callback function fired when modal opened.
		 * (Function)  onHide       - User defined callback function fired when modal closed.
		 * (Function)  onLoad       - User defined callback function fired when ajax content loads.
		 */
		params: {
			overlay: 50,
			overlayClass: 'jqmOverlay',
			closeClass: 'jqmClose',
			closeOnEsc: false,
			trigger: '.jqModal',
			ajax: false,
			target: false,
			ajaxText: '',
			modal: false,
			toTop: false,
			onShow: onShow,
			onHide: onHide,
			onLoad: false
		},

		// focusFunc is fired:
		//   a) when a modal:true dialog is shown, 
		//   b) when an event occurs outside an active modal:true dialog
		// It is passed the active modal:true dialog as well as event 
		focusFunc: function (activeModal, event) {

			// if the event occurs outside the activeModal, focus on first element
			if (event) {
				$(':input:visible:first', activeModal).focus();
			}

			// lock interactions to the activeModal
			return false;
		},

		// closeOnEscFunc is attached to modals where closeOnEsc param true.
		closeOnEscFunc: function (event) {
			if (event.keyCode == 27) {
				$(this).jqmHide();
				return false;
			}
		}
	};


})(jQuery);
////////////////PLUGIN CODE ABOVE///////////////////////////



(function ($) {
	if (!$.Sh) {
		$.Sh = {};
	};

	

	// TODO open up for behavior for any type of layer
	$.Sh.Modal = function (options) {
		// a bridge, set up options from data-
		var _options = {
			overlayClass: this.data("olcss"),
			closeClass: this.data("closecss"),
			trigger: this.data("trigger"),
			ajax: this.data("ajax"),
			target: this.data("target"),
			ajaxText: String('<div class="loading">{0}</div>').format(this.data("loading-text") || ""),
			modal: this.data("ismodal"),
			onShow: $.getFunction(this,"onshow"),
			onHide: $.getFunction(this,"onhide"),
			onLoad: $.getFunction(this, "onload"),
			mode: this.data("mode")
		};


		this.ShModal($.extend(_options, options));
		
		return $(this).data("sh.modal");
	};

	// plugin
	$.fn.ShModal = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.modal")) {
				$(this).data("sh.modal", new Modal($(this), options));
			}

		});
	};

	// expose default options
	$.Sh.Modal.defaults = {
		overlay: 100,
		overlayClass: 'jqmOverlay',
		closeClass: 'jqmClose',
		closeOnEsc: true,
		ajax: false,
		target: '#jqmContent',
		ajaxText: '<div class="loading"></div>',
		modal: false,
		toTop: false,
		mode: "ajax"

	};
	// i need to rewrite params in a way that preserves built in events
	// TODO: this should be done on load to grab project defaults object
	$.extend($.jqm.params, $.Sh.Modal.defaults);

	// constructor, not exposed
	var Modal = function (el, options) {

		// extend options
		this.options = $.extend({}, $.jqm.params, options);
		
		el.jqm({
			overlay: this.options.overlay,
			overlayClass: this.options.overlayClass,
			closeClass: this.options.closeClass,
			closeOnEsc: this.options.closeOnEsc,
			trigger: this.options.trigger,
			ajax: this.options.ajax,
			target: this.options.target,
			ajaxText: this.options.ajaxText,
			modal: this.options.modal,
			toTop: this.options.toTop,
			onShow: this.options.onShow,
			onHide: this.options.onHide,
			onLoad: this.options.onLoad,
			mode: this.options.mode
		});

		
	};


	$.Sh.Modals = {
		defaults: {
			ajaxDialog: '#ajaxDialog',
			frameDialog: '#frameDialog',
			contentDialog: '#contentDialog',
			loadingcss: ".loading",
			modal: true // TOGO
		},
		rewire: function (context) {
			// wait for body load for this
			if ($.Sh.Modals.Ready){
				var c = (context) ? context.find("[data-modal=iframe]") : "[data-modal=iframe]";
				var q = (context) ? context.find("[data-modal=ajax]") : "[data-modal=ajax]";

				$.Sh.Modals.frameDialog.jqmAddTrigger(c);
				$.Sh.Modals.ajaxDialog.jqmAddTrigger(q);


				// rewire content!
				$.Sh.Modals.bindContent(context);

				// im skeptic
				$.props.$body.trigger("ModalsReady", [context]);
			}
		},
		hideAll: function () {
			// jqmhide
			try {
				$.Sh.Modals.ajaxDialog.jqmHide();
				$.Sh.Modals.frameDialog.jqmHide();
				$('[data-modal=inpage]').jqmHide();
			}catch(e){
				// if called inside the iframe call parent
				if (window.top && window.top.$.Sh.Modals.frameDialog) {
					window.top.$.Sh.Modals.frameDialog.jqmHide();
				}
			}

		},
		// expose jqmShow for each modal
		show: function(type){
			switch (type ) {
				case "ajax":
					$.Sh.Modals.ajaxDialog.jqmShow();
					break;
				case "iframe":
					$.Sh.Modals.frameDialog.jqmShow();
					break;
				case "inpage":
					// TODO: needs thought
					break;
			}
		},
		bindContent: function(context){
			// bind content

			
			if ($.Sh.Modals.contentDialog.length > 0) {
				var newHtml = $.Sh.Modals.contentDialog.html();

				// wrap every dialog with contendialog html
				context = context || $.props.$body;
				var $modals = context.find("[data-modal=inpage]");
				if (context.is('[data-modal=inpage]')) $modals = context;
			
				$.each($modals, function (i, o) {
					// get handler
					var o = $(o);

					// TODO: new, watch
					if (o.data('sh.modal')) return;

					var h = o.data("modal-trigger");
					
					// insert the close button and h3 using title attribute
					o.wrapInner('<div id="jqmContent"></div>');
					
					o.prepend(newHtml);

					$.Sh.Modal.call(o, {
						mode: "inpage",
						modal: true,
						trigger: h,
						ajax: false,
						onShow: $.Sh.Modals.onShow,
						onHide: $.Sh.Modals.onHide
					});
					
				});
			}
		},
		windows: [],
		Ready: false,
		onShow: function (hash) {
			
			//  w: (jQuery object) The modal element
			//  c: (object) The modal's options object
			//  o: (jQuery object) The overlay element
			//  t: (DOM object) The triggering element
			// c.mode is new

			// lend back and return false
			
			var onshow = $.getFunction($(hash.t), "onbeforeshow");
			if (onshow && !onshow.call(hash)) return false;

			// add overlay
			hash.o.prependTo("body");


			// read trigger data-dialog details to define the shape of the dialog
			var $trigger = $(hash.t);
			hash.c.modal = $trigger.data("ismodal");
			

			// maintain trigger
			hash.c.original = $trigger;

			hash.w.width('').height('').css("top", '').css("left", '');

			var dialogStyle = $trigger.data("style"),
				dialogSpan = $trigger.data("span");
			
			if (hash.c.added != true) {
				$.Sh.Modals.windows.push(hash);

				hash.c.added = true;
			}

	
			hash.w.addClass(dialogStyle);
			// add text to title

			$("h3", hash.w).text($trigger.attr("data-title") || $trigger.attr("title") || "");

			// TODO unify height and top for all, seems like i never need more than an adequate position automatic
			// change top and left
			hash.w.css("left", ($.props.width - hash.w.width()) / 2);
			if (dialogSpan == "fill") {
				hash.w.css("top", $.props.height * 0.05)
						.height($.props.height * 0.90);
			}

			// if mode is iframe, bind load
			var $modalContent;
			if (hash.c.mode == "iframe") {
				$modalContent = $("iframe", hash.w);
				
				$modalContent.on("load", function (e) {
					
					hash.w.find($.Sh.Modals.defaults.loadingcss).hide();
					$modalContent.show();
					$(this.contentWindow).on("beforeunload", function (e) {
						
						$modalContent.hide();
						hash.w.find($.Sh.Modals.defaults.loadingcss).show();
					});
				})
					.html('')
					.attr("src", $trigger.attr("href"));
				
				
			}
			
			// show hide the close button
			var $c = hash.w.find("." + hash.c.closeClass);
			$trigger.data("noclose") ? $c.hide() : $c.show();

			// show modal
			hash.w.show();

			// reshape iframe
			if (hash.c.mode == "iframe") {
				$modalContent.height(hash.w.height() - $("h3", hash.w).outerHeight(true));
			}
			
			
			return true;
		},
		onHide: function (hash) {

			
			var onhide = $.getFunction(hash.c.original, "onbeforehide");
			if (onhide && !onhide.call(hash)) return false;
			
			
			hash.w.removeClass(hash.c.original.data("style")).hide();
			hash.o.remove();

			if (hash.c.mode == "iframe") {
				$("iframe", hash.w).unbind("load").attr("src", '');
				hash.w.find( $.Sh.Modals.defaults.loadingcss).hide();
			}

			if (hash.c.mode == "ajax") {
				hash.w.find(hash.c.target).empty();
			}			
			return true;
		
		},
		onLoad: function (hash) {
			
			if (hash.c.mode == 'ajax') {
				$.ShRewire(hash.w);
			}

			var onload = $.getFunction($(hash.t),"onafterload");
			onload && onload.call(hash);

		}
	};
	
	// what i want
	$(function () {
	
		// $.Sh.Modals.Rewire
		// $.Sh.Modals.HideAll
		$.Sh.Modals.ajaxDialog = $($.Sh.Modals.defaults.ajaxDialog);
		$.Sh.Modals.frameDialog = $($.Sh.Modals.defaults.frameDialog);
		$.Sh.Modals.contentDialog = $($.Sh.Modals.defaults.contentDialog);


		$.Sh.Modal.call($.Sh.Modals.ajaxDialog, {
			mode: "ajax",
			modal: true,
			trigger: "[data-modal=ajax]",
			ajax: '@href',
			onShow: $.Sh.Modals.onShow,
			onLoad: $.Sh.Modals.onLoad,
			onHide: $.Sh.Modals.onHide
		});
		$.Sh.Modal.call($.Sh.Modals.frameDialog, {
			mode: "iframe",
			modal: true,
			trigger: "[data-modal=iframe]",
			onShow: $.Sh.Modals.onShow,
			onLoad: $.Sh.Modals.onLoad,
			onHide: $.Sh.Modals.onHide
		});
		
		$.Sh.Modals.bindContent();


		$.props.$window.on("resize", function () {
			// supposidly window_width and height are set
			// read window.modals one by one and change css values, doesnt matter if they are hidden

			$.each($.Sh.Modals.windows, function (i, o) {
				// o = hash
				
				o.w.css("left", ($.props.width - o.w.width()) / 2);
				if ($(o.t).data("span") == "fill") {
					o.w.css("top", $.props.height * 0.05)
						.height($.props.height * 0.90);
				}
				// also if iframe, change height of iframe 
				if (o.c.mode == "iframe") {
					var $mc = $("iframe", o.w);
					$mc.height(o.w.height() - $("h3", o.w).outerHeight(true));
				}
			});

		});

		$.props.$body.trigger("ModalsReady");
		$.Sh.Modals.Ready = true;

	});
	

})(jQuery);(function($) {
    if (!$.Sh) {
        $.Sh = {};
    };
    if (!$.UiSh) {
        $.UiSh = {};
    };

    $.Sh.FormatRules = {
        //"email": /^\S+@\S+\.\S+$/i,
        "email": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
        //"url": /^http\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?$/i,
        "url": /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
        "integer": /^[0-9]*$/,
        "number": /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
        "digits": /^-?(?:\d*)?(?:\.\d+)?$/,
        "phone": /^[\d\s]*$/,
        "date": ""
    }



    $.Sh.Validate = function(options) {
        // a bridge, set up options from data-
        var type = "required";
        if (this.attr("data-format")) {
            type = "format";

        } else if (this.attr("data-min") || this.attr("data-max")) {
            type = "range";
        } else if (this.attr("data-min-length") || this.attr("data-max-length")) {
            type = "rangelength";
        } else if (this.attr("data-required")) {
            type = "required";
        } else if (this.attr("data-custom")) {
            type = "custom";
        }
        var _options = {
            required: this.data("required"),
            onshow: $.getFunction(this, "onshow"),
            onload: $.getFunction(this, "onload"),
            onhide: $.getFunction(this, "onhide"),
            onvalidate: $.getFunction(this, "onvalidate"),
            inputcss: this.data("inputcss"),
            reqcss: this.data("reqcss"),
            errlabelcss: this.data("errcss"),
            customlabelcss: this.data("customcss"),
            errlocation: this.data("err-location"),
            errmsg: this.data("err-message"),
            reqmsg: this.data("required-message"),
            showonload: this.data("showonload"),
            valid: this.data("valid"),
            type: type,
            format: this.data("format"),
            min: this.data("min"),
            max: this.data("max"),
            minLength: this.data("min-length"),
            maxLength: this.data("max-length"),
            skip: this.data("skip"),
            asyncvalid: this.data("async-valid")
        };
        this.ShValidate($.extend(_options, options));
        return this.data("sh.validate");
    };



    // expose default options
    $.Sh.Validate.defaults = {
        required: false,
        inputcss: "error",
        reqcss: "req",
        reqmsg: $.Res.Required,
        errlabelcss: "errlabel",
        customlabelcss: "cerrlabel",
        errlocation: "afterEnd",
        showonload: false,
        valid: null,
        skip: false,
        asyncvalid: true // by default its true
    };
    // constructor, not exposed
    var Validate = function(el, options) {

        this.options = $.extend({}, $.Sh.Validate.defaults, options);
        this.element = el;
        // which one to call
        this.reqstar = $('<span></span>').addClass(this.options.reqcss);

        this.label = null;
        this.code = null; // save the last code associtated with it

        if (this.options.type == "custom") {
            this.custom();
        } else {
            this.init();
        }
    };

    Validate.prototype = {

        init: function() {
            // extend options

            var base = this,
                el = this.element;

            if (base.options.required) {

                el.wrap(String('<div class="wrapvld {0}"></div>').format(base.options.reqcss)).after(base.reqstar); // this line is causing issues, wrapping uses a clone
            } else {
                el.wrap('<div class="wrapvld"></div>');
            }
            //default label
            base.label = $.Sh.Label.call(el, {
                text: base.options.errmsg,
                sticky: true,
                showCloseBtn: false,
                css: base.options.errlabelcss + (base.options.required ? "" : " unlabel"),
                location: base.options.errlocation,
                showOnLoad: base.options.showonload,
                //valid: base.options.valid,
                onShow: function() {
                    el.addClass(base.options.inputcss);
                    if (base.options.onshow) base.options.onshow.call(this);
                },
                onLoad: base.options.onload,
                onHide: function() {
                    el.removeClass(base.options.inputcss);
                    if (base.options.onhide) base.options.onhide.call(this);
                }
            });


            //el.on("change", function () {
            //	// reset validation, mmm
            //	//base.options.valid = false;
            //});
            // on focus, hide label
            el.on("focus keydown", function() {

                base.label.hide();

            });
            // return instance
            return this;
        },
        methods: {
            required: function(val, label, msg) {

                if (val === "") {
                    label.show({ text: msg });
                    this.options.valid = false;

                }

                return this.options.valid;
            },
            format: function(val, label) {

                // override error message with something suitable to format if exists
                var f = this.options.format,
                    msg = this.options.errmsg || $.Res.Tiny.INVALID_FORMAT;


                var re = $.Sh.FormatRules[f] || new RegExp(f, "i");
                if (f in $.Sh.FormatRules) {
                    msg = this.options.errmsg || $.Res.Tiny["INVALID_" + f + "_FORMAT"];
                }
                // if date deal differently
                if (f == "date") {
                    try {
                        $.datepicker.parseDate($.Res.Localization.DateFormat, val);
                    } catch (e) {

                        this.options.valid = false;

                    }
                } else {
                    if (re.test(val) == false) {

                        this.options.valid = false;

                    }
                }
                if (!this.options.valid) label.show({ text: msg });

                return this.options.valid;
            },
            range: function(val, label) {
                // range is between min and max


                val = Number(val);

                var min = parseInt(this.options.min),
                    max = parseInt(this.options.max),
                    msg = this.options.errmsg || $.Res.Tiny.INVALID_VALUE;

                if (isNaN(val)) {
                    this.options.valid = false;
                    label.show({ text: msg });
                    return false;
                }

                if ((min != null && min > val) || (max != null && max < val)) {
                    this.options.valid = false;
                    label.show({ text: msg });
                    return false;
                }

                return true;
            },
            rangelength: function(val, label) {

                var min = parseInt(this.options.minLength),
                    max = parseInt(this.options.maxLength);

                //var min = this.data("min-length") ? parseFloat(this.data("min-length")) : null;
                //var max = this.data("max-length") ? parseFloat(this.data("max-length")) : null;


                var _length = val.length;

                if (!isNaN(min) && min > _length) {
                    this.options.valid = false;
                    label.show({ text: this.options.errmsg || $.Res.Tiny.TOO_SHORT });
                } else if (!isNaN(max) && max < _length) {
                    this.options.valid = false;
                    label.show({ text: this.options.errmsg || $.Res.Tiny.TOO_LONG });
                }

                return this.options.valid;
            }
        },
        validate: function() {
            // call onvalidate

            var base = this,
                el = this.element,
                label = this.label;

            base.options.valid = true;
            base.code = base.options.type;

            if (base.options.type == "custom") {
                if (base.options.onvalidate) return base.options.onvalidate.call(base, label);
                // imagine if u could do this base.element.trigger("validate")
                _debug(el, "custom validation not implemented");
                return false;
            }

            var val = el.ShTrim();

            if (base.options.required) {
                var m = base.options.type == "required" ? base.options.errmsg || base.options.reqmsg : base.options.reqmsg;
                // if false return
                if (!base.methods.required.call(base, val, label, m)) return false;

            }

            // according to type, call method, if other than required, apply only on non emtpy values
            if (base.options.type != "required" && val !== "" && !base.methods[base.options.type].call(base, val, label)) {
                return false;
            }

            // fire external validation
            if (base.options.onvalidate) return base.options.onvalidate.call(base, val, label);

            return true;
        },
        custom: function() {
            // setup label, and call inline onvalidate, which is supposed to deal with the label directly
            var base = this;

            this.label = $.Sh.Label.call(this.element, {
                text: base.options.errmsg,
                sticky: true,
                showCloseBtn: false,
                css: base.options.customlabelcss,
                location: base.options.errlocation,
                showOnLoad: base.options.showonload,
                //valid: base.options.valid,
                onShow: base.options.onshow,
                onLoad: base.options.onload,
                onHide: base.options.onhide
            });

            return this;
        },
        toggleReqstar: function(isrequired) {
            // if required, for now, show reqstar, else hide it. validation should come from custom behavior
            // TODO: maybe i should detect reqstar and add it if not there yet
            isrequired ? this.reqstar.show() : this.reqstar.hide();
            return this;
        },
        option: function(name, value) {
            this.options[name] = value;
            if (name == "required") {
                this.toggleReqstar(value);
                this.label.hide();
            }
            return this;
        }

    };

    // plugin
    $.fn.ShValidate = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.validate")) {
                $(this).data("sh.validate", new Validate($(this), options));
            }

        });
    };


    /*
     * ValidateForm behavior:
     * this behavior is for multiple validation fields to be submited and validated together
     */

    $.Sh.ValidateForm = function(options) {
        // prepare fields if not already passed


        var _options = {
            fields: null,
            context: this.data("context"),
            trigger: this.data("trigger") ? this.find(this.data("trigger")) : this,
            offset: this.data("offset"),
            selector: this.data("validate-selector") || this.data("validateselector"),
            bDoValidate: this.data("dovalidate"),
            silent: this.data("silent"),
            onvalidate: $.getFunction(this, "onvalidate")
        };

        this.ShValidateForm($.extend(_options, options));
        return this.data("sh.validateform");
    };

    // expose default options
    $.Sh.ValidateForm.defaults = {
        fields: null,
        silent: false,
        trigger: null,
        selector: ".validate",
        offset: 0,
        bDoValidate: true
    };
    // constructor, not exposed
    var ValidateForm = function(el, options) {

        this.element = el;
        this.options = $.extend({}, $.Sh.ValidateForm.defaults, options);

        if (!this.options.fields)
            this.options.fields = $(this.options.selector, this.options.context || $.props.$body); // fixed this.context!

        this.context = $(this.options.context) || window;


        this.init(this.options);
    };

    ValidateForm.prototype = {
        init: function(options) {

            $.extend(this.options, options);
            var base = this;
            // setup validation and onclick events of trigger
            if (!this.options.silent) {
                if (this.options.trigger.is("form")) {
                    this.options.trigger.on("submit", function(e) {
                        if (!e.isDefaultPrevented() && !base.validate()) return false;
                    });
                } else {
                    this.options.trigger.on("click", function(e) {
                        if (!e.isDefaultPrevented() && !base.validate()) return false;
                    });
                }
            }

        },
        validate: function() {

            var base = this,
                el = this.element,
                isValid = true,
                fTop = 0,
                bTop = false;

            // go through fields and validate
            $.each(this.options.fields, function(i, o) {

                var $t = $(this),
                    //label = $t.data("sh.label"), // label object
                    v = $t.data("sh.validate"); // validation object


                v.label.hide();

                // taking care of placeholder first, assumung using Placeholder plugin
                if (!jQuery.support.placeholder) {
                    if ($t.hasClass('placeholder') && $t.val() == $t.attr('placeholder')) {
                        $t.val('');
                    }
                }

                if (base.options.bDoValidate) {

                    // skip field?

                    if (!v.options.skip && (!v.options.asyncvalid || !v.validate())) {
                        // call onasyncerror again, this happens when user focuses, loses error label, then blurs while the async error is still present)
                        if (!v.options.asyncvalid) $t.trigger("shAsync");

                        isValid = false;

                        if (!bTop) {

                            // scrollup first time only
                            var $e = $t.is(":visible") ? $t : $t.parent(); // keep an eye on parent
                            if (base.context == window) fTop = $e.offset().top - base.options.offset;
                            else if (base.context && base.context.length) fTop = $e.ShPosition(base.context).top - base.options.offset;

                            bTop = true;
                        }

                    }
                }


            });

            if (!isValid) {

                // scroll to top of page, // only if ftop is not within view
                if (base.context == window) {
                    if ($.props.$window.scrollTop() > fTop) $('html, body').animate({ scrollTop: fTop }, 'fast', 'swing');
                } else if (base.context && base.context.length) {
                    // try scrolling context

                    if (base.context.scrollTop() > fTop) base.context.animate({ scrollTop: fTop }, 'fast', 'swing');
                }

                // maybe i should fire an event here
                base.options.onvalidate ? base.optionns.onvalidate.call(base, false) : null;

                return false;
            }
            // i should fire an event here
            return base.options.onvalidate ? base.optionns.onvalidate.call(base, true) : true;
        },
        addField: function(field) {
            this.options.fields.add(field);
        }

    };

    // plugin
    $.fn.ShValidateForm = function(options) {
        return this.each(function() {
            if (!$(this).data("sh.validateform")) {
                $(this).data("sh.validateform", new ValidateForm($(this), options));
            }

        });
    };


    $.UiSh.Size = function(val, label) {
        // test if FileReader is supported first

        var size = parseInt(this.element.data("size") || 500);
        if (isNaN(size)) size = 500;
        this.code = "size";

        size = size * 1000;

        if (!window.FileReader) return true;

        var _element = this.element.get(0);

        if (_element.files && _element.files[0]) {

            var fsize = parseInt(_element.files[0].size);
            _debug(fsize, "file size");
            if (fsize <= size) {
                return true;
            }
            label.show({ text: $.Res.Tiny.FILE_LARGE });
            return false;
        }
        return true;


    }

    // this sounds like a site behavior not a framework
    $.UiSh.Options = function(val, label) {
        // if one option is selected at least

        var options = this.element.find(":selected");
        var min = this.element.data("options-min");
        var max = this.element.data("options-max");

        this.code = "options";
        _debug({ min: min, max: max, options: options });

        if ((min != null && min > options.length) || (max != null && max < options.length)) {

            label.show({ text: this.options.errmsg || $.Res.Tiny.INVALID_OPTIONS });
            return false;
        }

        return true;


    }



})(jQuery);(function ($) {


	if (!$.Sh) {
		$.Sh = {};
	};

	if (!$.UiSh) {
		$.UiSh = {};
	};
	var bodyLabel;

	$(function () {

		
		// prepare touch
		if (jQuery.support.touch) {
			$.props.$body.addClass("touch");
		} else {
			$.props.$body.addClass("notouch");
		}

		//TODO: BehaviorsReady
		// function that shows a general error badge in body
		bodyLabel = $.Sh.Label.call($.props.$body,{
			text: "",
			css: "",
			location: "beforeEnd",
			sticky: false
		});
		

	});
	$.BodyLabel = function (key, options, fallback) {
		if (!bodyLabel) return;
		bodyLabel.hide();
		//stickyLabel.hide();
		if (key != "hide") {
			if (!options.sticky) {
				options.showCloseBtn = false;
			}
			// TODO: if screensize is less than 460, use Tiny as default namespace
			
			bodyLabel.show($.extend({ text: $.ErrMessage(key, fallback, options.ns ? options.ns : "Detailed") }, options));
			return bodyLabel;

		}
	};

	$.ErrMessage = function (errorCode, fallBack, ns) {
		if (!ns) ns = "Tiny";
		var errorCode = errorCode || "Unknown",
			errorMessage = fallBack || $.Res[ns]["Unknown"];
		
		if (errorCode !== -1) {
			errorCode = $.Res[ns][errorCode];
			if (errorCode) {
				errorMessage = errorCode;
			}
		}
		return errorMessage;

	}

	// added by shut framework, keep an eye when updating
	$.fn.mustacheparse = function () {
		return $(this).map(function (i, elm) {
			var template = $.trim($(elm).html());
			var output = Mustache.parse(template);

			return $(output).get();
		});
	};

	$.mustache = function (template, view, partials) {
		return Mustache.render(template, view, partials);
	};

	$.fn.mustache = function (view, partials) {
		return $(this).map(function (i, elm) {
			var template = $.trim($(elm).html());
			var output = $.mustache(template, view, partials);
			// clean output before jquerying
			//TODO:
			return $(output).get();
		});
	};
	$.fn.ShPosition = function (context) {

		// return offset of object relative to context
		var offset = this.offset(),
			contextOffset = context.offset();
		//_debug({ top: offset.top + context.scrollTop() - contextOffset.top, left: offset.left - contextOffset.left },"offset");
		return { top: offset.top + context.scrollTop() - contextOffset.top, left: offset.left - contextOffset.left };

	};



	$.fn.ShApplyHiLight = function () {
		if (this.effect) {
			return this.effect("highlight", {}, 1000);
		} else {
			return this;
		}
	};
	$.fn.ShBadge = function (text, location, css) {
		// prepeare sherror with text
		this.ShLabel({
			text: text || $.Res.SomeError,
			css: css || "redbox block",
			location: location || "beforeStart",
			sticky: true,
			showCloseBtn: false
		});

		return this;
	};
	$.fn.ShTrim = function (value) {
		// trim and set value, unless its file type!
		if (!this.is(":file"))
			value ? this.val($.trim(value)) : this.val($.trim(this.val()));
		return this.val();
	}
	$.fn.ShVal = function (value) {
		// set value then fire event
		//_debug(value, "changed");
		return this.val(value).trigger("change");
	}


	// $.Sh collection


	$.UiSh.removeParent = function (data, fnAfterRemove) {
		// remove which parent after done


		if (data.result) {
			var $t = this;

			setTimeout(function () {
				$t.closest($t.data("which") || "li").fadeOut(500, function () {

					$(this).remove();
					// i need a return or subfunction!
					if (fnAfterRemove && typeof (fnAfterRemove) == "function") {
						fnAfterRemove.call($t,data);
					}
				});
			}, 10);
		} else {


			this.ShLabel({
				which: this.data("which"),
				text: $.ErrMessage(data.errorCode,this.data("error-message")),
				css: this.data("errorcss"),
				location: this.data("error-location") || "beforeEnd",
				sticky: true
			});
			this.data("sh.label").show();
		}
	};

	// pretty price behavior
	$.Sh.PrettyPrice = function () {
		this.text(this.text().toPrettyPrice());
	};
	
	// Wizardlist. do i really need this here?
	// strip a tags from anything that comes after selected li
	$.Sh.WizardList = function () {
		this.ShWizardList();
	};
	var WizardList = function (el) {

		var boff = false;
		$.each(el.find(">li"), function () {
			var $t = $(this);
			if ($t.hasClass("selected") || boff) {
				boff = true;
				$t.addClass("inactive").find("a").contents().unwrap();

			}
		});
		return this;
	};

	// plugin
	$.fn.ShWizardList = function () {
		return this.each(function () {
			if (!$(this).data("sh.wizardlist")) {
				$(this).data("sh.wizardlist", new WizardList($(this)));
			}

		});
	};

	$.Sh.Confirm = function (options) {
		var _options = {
			message: this.data("message")
		};

		this.ShConfirm($.extend(_options, options));
	};

	// constructor, not exposed
	var Confirm = function (el, options) {
		this.options = options;
		var base = this;
		// initialize
		el.click(function (e) {
			var $this = $(this);
			if (e.isDefaultPrevented()) return false;

			if (!window.confirm(base.options.message.replace(/\\n/gim, "\n"))) {
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});

		return this;
	};

	// plugin
	$.fn.ShConfirm = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.confirm")) {
				$(this).data("sh.confirm", new Confirm($(this), options));
			}

		});
	};

	// jquery-ui tip
	$.Sh.Tip = function (options) {
		var _options = {
			_my: this.data("my"),
			_at: this.data("at"),
			_extra: this.data("addclass")
		};
		_options = $.extend(_options, options);

		this.ShTip(_options);
	};
	$.Sh.Tip.defaults = {
		_my: "center-2 bottom-15",
		_at: "center top",
		_extra: ""
	};
	// constructor, not exposed
	var Tip = function (el, options) {
		this.options = options;
		var base = this;

		this.options = $.extend({}, $.Sh.Tip.defaults, options);

		if (jQuery.support.touch) {
			return this;
		}

		el.tooltip({
			show: false,
			hide: false,
			position: {
				my: base.options._my,
				at: base.options._at,
				using: function (position, feedback) {
					var $t = $(this).css(position)
						.addClass(feedback.vertical).addClass(base.options._extra);
					if (feedback.element.width < 50) $t.addClass("tight");
					else if (feedback.element.width > 100) $t.addClass("wide");

				}
			}
		});
		el.attr("data-title", el.attr("title"));

		return this;
	};

	// plugin
	$.fn.ShTip = function (options) {
		return this.each(function () {
			if (!$(this).data("sh.tip")) {
				$(this).data("sh.tip", new Tip($(this), options));
			}

		});
	};

})(jQuery);