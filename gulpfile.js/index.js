// var gulp = require('gulp');
const {rawless} = require('./shut');
const {shutcss} = require('./fw');
// exports.aa = function(cb) {
//     cb();
// }
// watching minisite
// gulp.task('init', ['rawless', 'rawscripts', 'insertcss'], function() {
//     // Watch .less files
//     gulp.watch('**/less/*.less', ['rawless']);

//     // Watch .js files
//     gulp.watch(['**/js/ui.*.js', '**/js/sh.*.js'], ['rawscripts']);
// });

function defaultTask(cb) {
    // place code for your default task here
    gulp.watch('**/less/*.less', ['rawless']);

    // Watch .js files
    gulp.watch(['**/js/ui.*.js', '**/js/sh.*.js'], ['rawscripts']);
    cb();
}

exports.shutcss = shutcss;

exports.default = defaultTask;
