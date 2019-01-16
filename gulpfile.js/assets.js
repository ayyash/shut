const gulp = require('gulp');

var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var inject = require('gulp-inject');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var transform = require('gulp-transform');

var shutConfig = require('./shut.config.json');

var rtl = require('./rtl.js');

// use less/sh.imports.less to create a less file of all ui* and media*, then generate src/css/sh.css
const rawless = function() {

    return gulp
        .src(shutConfig.srcUrl + 'less/sh.imports.less')
        .pipe(
            inject(gulp.src(shutConfig.srcUrl + 'less/ui.*.less', { read: false }), {
                starttag: '// inject:uiless',
                endtag: '// endinject',
                relative: true
            })
        )
        .pipe(
            inject(gulp.src(shutConfig.srcUrl + 'less/media.*.less', { read: false }), {
                starttag: '// inject:medialess',
                endtag: '// endinject'
            })
        )
        // .pipe(rename({ basename: 'all' }))
        .pipe(gulp.dest(shutConfig.srcUrl + 'less/'))
        .pipe(
            less({
                paths: [shutConfig.shutUrl + 'less/']
            })
        )
        .on('error', function(err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(
            autoprefixer({
                browsers: shutConfig.browserslist
            })
        )
        .pipe(rename({ basename: shutConfig.projectName }))
        .pipe(gulp.dest(shutConfig.distUrl + 'css'))
        .on('error', console.error.bind(console));
};

// use sh.rtl.imports.less, concat to sh.imports.less, the inject rtl.*.less to generate src/css/sh.rtl.css
const rawlessRtl = function(){
    return gulp.src([shutConfig.srcUrl + 'less/sh.imports.less', shutConfig.srcUrl + 'less/sh.rtl.imports.less'])
        .pipe(concat('all.rtl.less', { newLine: '' }))
        .pipe(
            inject(gulp.src(shutConfig.srcUrl + 'less/rtl.*.less', { read: false }), {
                starttag: '// inject:rtlless',
                endtag: '// endinject',
                relative: true
            })
        )
        .pipe(
            gulp.dest(shutConfig.srcUrl + 'less/')
        )
        .pipe(
            less({
                paths: [shutConfig.shutUrl + 'less/']
            })
        )
        .on('error', function(err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(
            autoprefixer({
                browsers: shutConfig.browserslist
            })
        )
        .pipe(rename({ basename: shutConfig.projectName, suffix: '.rtl' }))
        .pipe(gulp.dest(shutConfig.distUrl + 'css'))
        .on('error', console.error.bind(console));
};

// mirror /src/css/sh.rtl.css
const rawMirror = gulp.series(rawlessRtl, function(){
    
    return gulp.src(`${shutConfig.distUrl}css/${shutConfig.projectName}.rtl.css`)
       .pipe(transform(function(contents, file){
           return rtl.MirrorText(contents);
       }, { encoding: 'utf8' }))
       .pipe(gulp.dest(shutConfig.distUrl + 'css/'));
 });

const buildcss = function() {
    // minify the disturl and place in minisite public
	// this step is not part of the shut, but rather the working environment of every project
    return gulp
        .src(shutConfig.distUrl+ 'css/sh.css')
        .pipe(cssmin())
        .pipe(rename({ basename: 'sh', suffix: '.min' }))
        .pipe(gulp.dest(shutConfig.minisiteDistUrl + 'css'))
        .on('error', console.error.bind(console));
};

const buildRtlcss = function(){
    return gulp
        .src(shutConfig.distUrl+ 'css/sh.rtl.css')
        .pipe(cssmin())
        .pipe(rename({ basename: 'sh', suffix: '.rtl.min' }))
        .pipe(gulp.dest(shutConfig.minisiteDistUrl + 'css'))
        .on('error', console.error.bind(console));

}

if (shutConfig.isRtl){
    exports.rawless = gulp.series(rawless, rawMirror);
    exports.buildcss = gulp.parallel(buildcss, buildRtlcss);

    exports.watch = function() {
        // place code for your default task here
        gulp.watch('**/less/(sh|ui|rtl){1}\.*.less',  { ignoreInitial: false }, gulp.series(rawless, rawMirror));

    }

} else {

    exports.rawless = rawless;
    exports.buildcss = buildcss;
    exports.watch = function() {
        // place code for your default task here
        gulp.watch('**/less/(sh|ui){1}\.*.less',  { ignoreInitial: false }, rawless);

    }
}

