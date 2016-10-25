var gulp = require('gulp');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
//var wrap = require('gulp-wrap');
var replace = require('gulp-replace');
var htmlmin = require('gulp-htmlmin');
var shutConfig = require('./shut.config.json');




gulp.task('rawless', function () {
    // TODO: stop relying on imports, imports file is important in case end user does not want to use gulp

    // for now: inject less in imports then less
    var g = gulp.src('./minisite/less/sh.imports.less')
        .pipe(
            inject(
                gulp.src('./minisite/less/ui.*.less', { read: false }),
                {starttag: '// inject:uiless', endtag: '// endinject', relative: true}
            )
        )
        .pipe(
             inject(
                gulp.src('./minisite/less/media.*.less', { read: false }),
                {starttag: '// inject:medialess',  endtag: '// endinject'}
            )
        )
        .pipe(concat('all.less', { newLine: '' }))
        .pipe(gulp.dest('./minisite/less/'))
        .pipe(less())
        .on('error', function (err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(gulp.dest('./minisite/less/'));
    g.on('error', console.error.bind(console));

    return g;

});

gulp.task('buildless', function () {
    var g = gulp.src('./minisite/less/all.less')
        .pipe(less())
        .pipe(cssmin())
        .pipe(rename({ basename: 'minisite', suffix: '.min' }))
        .pipe(gulp.dest('./minisite/public/css'));
    g.on('error', console.error.bind(console));

    return g;
});





gulp.task('rawscripts', ['shutscripts'], function () {
    // inject file in index.htm

    return gulp.src('./minisite/*.html')
        .pipe(inject(
            gulp.src(['./minisite/js/sh.js', './minisite/js/ui.*.js'], { read: false }), {
                relative: true
            }))
        .pipe(inject(gulp.src('./minisite/js/dev.js', { read: false }), { name: 'development', relative: true }))
        .pipe(inject(gulp.src('./minisite/js/sh.data.js', { read: false }), { name: 'data', relative: true }))
        .pipe(gulp.dest('./minisite/'));

});

function getShutScripts() {
    var arr = [];
    shutConfig.scripts.forEach(function (i) {
        arr.push(shutConfig.shutUrl + 'js/sh.' + i + '.js');
    });
    
    return arr;
}
gulp.task('shutscripts', function () {
    // get shut scripts into minisite sh.js

    return gulp.src(getShutScripts())
        .pipe(concat('sh.js', { newLine: '' }))
        .pipe(replace(String.fromCharCode(65279), '')) // BOM bug
        .pipe(gulp.dest('./minisite/js'));
});



// this for minisite only
gulp.task('buildscripts', function () {
    return gulp.src(['./minisite/js/sh.js', './minisite/js/ui.*.js'])
        .pipe(concat('minisite.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./minisite/public/js'));
});



gulp.task('dist', ['buildless', 'buildscripts'], function () {
    // inject scripts in html, produce new one, uglify and replace
    // TODO clean up and move sh.data.js here
    return gulp.src('./minisite/*.html')
        .pipe(inject(
            gulp.src(['./minisite/public/js/minisite.min.js', './minisite/public/css/minisite.min.css'], { read: false }), {
                relative: true,
                removeTags: true,
                ignorePath: 'public/'
            }))
        .pipe(inject(gulp.src('./minisite/public/js/dev.js', { read: false }), { name: 'development', removeTags: true, empty: true }))
        .pipe(inject(gulp.src('./minisite/public/js/minisite.data.js', { read: false }), { name: 'data', relative: true, removeTags: true }))
        .pipe(gulp.dest('./minisite/public'))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest('./minisite/public'))

});


gulp.task('insertcss', function () {
    return gulp.src('./minisite/*.html')
          .pipe(
            inject(
                gulp.src('./minisite/less/all.css', { read: false }),
                {relative: true}
            )
        )
        .pipe(gulp.dest('./minisite/'));
});


// watching
gulp.task('default', ['rawless', 'rawscripts', 'insertcss'], function () {
    // Watch .less files
    gulp.watch('less/*.less', ['rawless']);

    // Watch .js files 
    gulp.watch(['js/ui.*.js', 'src/js/sh.*.js'], ['rawscripts']);


});

