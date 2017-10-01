(function ($) {
  if (!$.Sh) {
    $.Sh = {};
  };
  $.Sh.Dialog = function (options) {
    // $('<div></div>').addClass(o.overlayClass).css({ height: '100%', width: '100%', position: 'fixed', left: 0, top: 0, 'z-index': z - 1, opacity: o.overlay / 100 })
    // 
  };
  $.Sh.Dialog.defaults = {


  };
  var Dialog = function (el, options) {

  };
  Dialog.prototype = {

  };

  $.fn.Dialog = function (options) {
    return this.each(function () {
      if (!$(this).data("sh.dialog")) {
        $(this).data("sh.dialog", new Dialog($(this), options));
      }

    });
  };


})(jQuery);