var gulp = require('gulp');
var requireDir = require('require-dir')('./gulptasks');




// watching minisite
gulp.task('init', ['rawless', 'rawscripts', 'insertcss'], function () {
    // Watch .less files
    gulp.watch('**/less/*.less', ['rawless']);

    // Watch .js files 
    gulp.watch(['**/js/ui.*.js', '**/js/sh.*.js'], ['rawscripts']);


});

