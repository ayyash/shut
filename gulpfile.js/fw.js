var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var shutConfig = require(__dirname + '/shut.config.json');

// creating raw for immidiate start (without seed)

const fwDistCss = function() {
    return gulp
        .src(shutConfig.shutUrl + 'less/sh.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: shutConfig.browserslist
        }))
        .pipe(cssmin())
        .pipe(rename({ basename: 'sh', suffix: '.min' }))
        .pipe(gulp.dest(shutConfig.shutDistUrl + 'css'));
};

const fwDistResources = function() {
    return gulp
        .src([shutConfig.shutUrl + 'fonts/*', shutConfig.shutUrl + 'images/*'], { base: shutConfig.shutUrl })
        .pipe(gulp.dest(shutConfig.shutDistUrl));
};

exports.shutcss = gulp.parallel(fwDistCss, fwDistResources);

// gulp.task('shutdistcss', function() {
//     // grab minisite seed to create (TODO)
//     return gulp
//         .src(shutConfig.shutUrl + 'less/all.less')
//         .pipe(less())
//         .pipe(cssmin())
//         .pipe(rename({ basename: 'sh', suffix: '.min' }))
//         .pipe(gulp.dest(shutConfig.fwDistUrl + 'css'));
// });

// gulp.task('shutresources', function() {
//     // clean images and fonts first, and copy over env

//     gulp.src(shutConfig.shutUrl + 'env/*').pipe(gulp.dest(shutConfig.fwDistUrl + 'js'));

//     return gulp
//         .src([shutConfig.shutUrl + 'fonts/*', shutConfig.shutUrl + 'images/*'], { base: shutConfig.shutUrl })
//         .pipe(gulp.dest(shutConfig.fwDistUrl));
// });

// function getShutScripts() {
//     var arr = [];
//     // add two major files: 0init and behaviors
//     arr.push(shutConfig.shutUrl + 'js/_Init.js');
//     arr.push(shutConfig.shutUrl + 'js/_behaviors.js');

//     shutConfig.scripts.forEach(function(i) {
//         arr.push(shutConfig.shutUrl + 'js/sh.' + i + '.js');
//     });

//     return arr;
// }

// gulp.task('shutdist', ['shutresources', 'shutdistjs', 'shutdistcss']);
// // the js file is easy, just minify all sh.*.js, the css file is more tricky, need to grab seeds from minisite/src/less

// gulp.task('shutdistjs', function() {
//     // with this file. the sh.data.js is required alongway
//     // copy src/env/sh.data.js

//     return gulp
//         .src(getShutScripts())
//         .pipe(concat('sh.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest(shutConfig.fwDistUrl + 'js'));
// });
