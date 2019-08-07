var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var transform = require('gulp-transform');

var shutConfig = require(__dirname + '/shut.config.json');

var rtl = require('./rtl.js');
var critical = require('./critical.js');

// creating raw for immidiate start (without seed)

// save sh.css in src/css/
const fwCss = function () {
    return gulp
        .src(shutConfig.shutUrl + 'less/sh.less')
        .pipe(less())
        .pipe(autoprefixer(
            {overrideBrowserslist: shutConfig.browserslist}
        ))
        // .pipe(cssmin())
        .pipe(rename({ basename: 'sh' }))
        .pipe(gulp.dest(shutConfig.shutUrl + 'css'));
};

// for rtl.
// create src/css/sh.rtl.css 
const fwRtlCss = function () {
    return gulp
        .src(shutConfig.shutUrl + 'less/rtl.sh.less')
        .pipe(less())
        .pipe(autoprefixer(
            {overrideBrowserslist: shutConfig.browserslist}
        ))
        .pipe(rename({ basename: 'sh', suffix: '.rtl' }))
        .pipe(gulp.dest(shutConfig.shutUrl + 'css'));

};

// mirror src/css/sh.rtl.css
const fwMirror = gulp.series(fwRtlCss, function () {

    return gulp.src(shutConfig.shutUrl + 'css/sh.rtl.css')
        .pipe(transform(function (contents, file) {
            return rtl.MirrorText(contents);
        }, { encoding: 'utf8' }))
        .pipe(gulp.dest(shutConfig.shutUrl + 'css/'));
});


// remove non critical from sh.css and in sh.general.css
// critical at shut level is not really needed, its an asset kind of task
const fwNonCritical = gulp.series(fwCss, function () {
    return gulp.src(shutConfig.shutUrl + 'css/sh.css')
        .pipe(transform(function (contents, file) {
            return critical.CriticalText(contents, false);
        }, { encoding: 'utf8' }))
        // rename to .general
        .pipe(rename({ basename: 'sh', suffix: '.general' }))
        .pipe(gulp.dest(shutConfig.shutUrl + 'css/'))
        .on('error', console.error.bind(console));
});
const fwCritical = gulp.series(fwCss, function () {
    return gulp.src(shutConfig.shutUrl + 'css/sh.css')
        .pipe(transform(function (contents, file) {
            return critical.CriticalText(contents, true);
        }, { encoding: 'utf8' }))
        // rename to .general
        .pipe(rename({ basename: 'sh', suffix: '.critical' }))
        .pipe(gulp.dest(shutConfig.shutUrl + 'css/'))
        .on('error', console.error.bind(console));
});



// minify src/css/sh.css into dist/css/sh.min.css
const fwBuildCss = function () {
    return gulp
        .src(shutConfig.shutUrl + 'css/sh.css')
        .pipe(cssmin())
        .pipe(rename({ basename: 'sh', suffix: '.min' }))
        .pipe(gulp.dest(shutConfig.shutDistUrl + 'css'));
};

// minify src/css/sh.rtl.css into dist/css/sh.rtl.min.css
const fwBuildRtlCss = function () {
    return gulp
        .src(shutConfig.shutUrl + 'css/sh.rtl.css')
        .pipe(cssmin())
        .pipe(rename({ basename: 'sh', suffix: '.rtl.min' }))
        .pipe(gulp.dest(shutConfig.shutDistUrl + 'css'));
};


const fwDistResources = function () {
    return gulp
        .src([shutConfig.shutUrl + 'fonts/*', shutConfig.shutUrl + 'images/*'], { base: shutConfig.shutUrl })
        .pipe(gulp.dest(shutConfig.shutDistUrl));
};

// prepare dist
if (shutConfig.isRtl) {

    const rawAll = gulp.parallel(fwCss, fwMirror);

    exports.rawshut = rawAll;
    exports.buildshut = gulp.parallel(fwDistResources,
        gulp.series(
            rawAll,
            gulp.parallel(fwBuildCss, fwBuildRtlCss)
        )
    );
    exports.watch = function () {
        gulp.watch(shutConfig.shutUrl + 'less/(sh|css|rtl){1}\.*.less', { ignoreInitial: false }, rawAll);
    };

} else {
    exports.rawshut = fwCss;
    exports.buildshut = gulp.parallel(fwDistResources, gulp.series(fwCss, fwBuildCss));
    exports.watch = function () {
        gulp.watch(shutConfig.shutUrl + 'less/(sh|css){1}\.*.less', { ignoreInitial: false }, fwCss);
    };
}

exports.criticalshut = gulp.parallel(fwCritical, fwNonCritical);

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
