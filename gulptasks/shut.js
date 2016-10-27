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
var del = require('del');
var shutConfig = require(__dirname+ '/shut.config.json');



gulp.task('rawless', function () {
    //imports file is important in case end user does not want to use gulp

    var g = gulp.src(shutConfig.srcUrl + 'less/sh.imports.less')
        .pipe(
        inject(
            gulp.src(shutConfig.srcUrl + 'less/ui.*.less', { read: false }),
            { starttag: '// inject:uiless', endtag: '// endinject', relative: true }
        )
        )
        .pipe(
        inject(
            gulp.src(shutConfig.srcUrl + 'less/media.*.less', { read: false }),
            { starttag: '// inject:medialess', endtag: '// endinject' }
        )
        )
        .pipe(concat('all.less', { newLine: '' }))
        .pipe(gulp.dest(shutConfig.srcUrl + 'less/'))
        .pipe(less())
        .on('error', function (err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(gulp.dest(shutConfig.srcUrl + 'less/'));

    return g;

});

gulp.task('buildless', function () {
    // build css into sh.min.css
    var g = gulp.src(shutConfig.srcUrl + 'less/all.less')
        .pipe(less())
        .pipe(cssmin())
        .pipe(rename({ basename: 'sh', suffix: '.min' }))
        .pipe(gulp.dest(shutConfig.distUrl + 'css'));
    g.on('error', console.error.bind(console));

    return g;
});





gulp.task('rawscripts', ['shutscripts'], function () {
    // inject file in html files, all scripts chosen from shut, and those in working folder
    // add dev.js which will make logging active

    return gulp.src(shutConfig.srcUrl + '*.html')
        .pipe(inject(
            gulp.src([shutConfig.srcUrl + 'js/sh.js', shutConfig.srcUrl + 'js/ui.*.js'], { read: false }), {
                relative: true
            }))
        .pipe(inject(gulp.src(shutConfig.srcUrl + 'js/dev.js', { read: false }), { name: 'development', relative: true }))
        .pipe(inject(gulp.src(shutConfig.srcUrl + 'js/sh.data.js', { read: false }), { name: 'data', relative: true }))
        .pipe(gulp.dest(shutConfig.srcUrl));

});

function getShutScripts() {
    var arr = [];
    shutConfig.scripts.forEach(function (i) {
        arr.push(shutConfig.shutUrl + 'js/sh.' + i + '.js');
    });

    return arr;
}
gulp.task('shutscripts', function () {
    // get shut scripts into local site sh.js

    return gulp.src(getShutScripts())
        .pipe(concat('sh.js', { newLine: '' }))
        .pipe(replace(String.fromCharCode(65279), '')) // BOM bug
        .pipe(gulp.dest(shutConfig.srcUrl + 'js'));
});


gulp.task('buildscripts', function () {
    // build scripts into sh.min.js
    return gulp.src([shutConfig.srcUrl + 'js/sh.js', shutConfig.srcUrl + 'js/ui.*.js'])
        .pipe(concat('sh.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(shutConfig.distUrl + 'js'));
});

gulp.task('resources',function(){
    // clean images and fonts first, and copy over env

    gulp.src(shutConfig.srcUrl + 'env/*')
        .pipe(gulp.dest(shutConfig.distUrl + 'js'));

    return gulp.src([shutConfig.srcUrl + 'fonts/*', 
                    shutConfig.srcUrl + 'images/*'], {base: shutConfig.srcUrl})
            .pipe(gulp.dest(shutConfig.distUrl));

});

gulp.task('dist', ['resources', 'buildless', 'buildscripts'], function () {
    // inject scripts in html, produce new one, uglify and replace
    // env folder has special settings for distribution, but dev.js does not have to be present 
    
    // im not cleaning dist first, because thats a personal preference

    return gulp.src(shutConfig.srcUrl + '*.html')
        .pipe(gulp.dest(shutConfig.distUrl))
        .pipe(inject(
            gulp.src([shutConfig.distUrl + 'js/sh.min.js', shutConfig.distUrl + 'css/sh.min.css'], { read: false}), {
                relative:true,
                removeTags: false
            }))
        .pipe(inject(gulp.src(shutConfig.distUrl + 'js/dev.js', { read: false }), { name: 'development', relative: true, removeTags: true, empty: true }))
        .pipe(inject(gulp.src(shutConfig.distUrl + 'js/sh.data.js', { read: false }), { name: 'data', relative: true, removeTags: true, empty:true }))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(shutConfig.distUrl))

});


gulp.task('insertcss', function () {
    // needs to be just once
    return gulp.src(shutConfig.srcUrl + '*.html')
        .pipe(
        inject(
            gulp.src(shutConfig.srcUrl + 'less/all.css', { read: false }),
            { relative: true }
        )
        )
        .pipe(gulp.dest(shutConfig.srcUrl));
});



