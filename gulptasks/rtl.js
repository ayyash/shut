var gulp = require('gulp');
var transform = require('gulp-transform');
var rename = require('gulp-rename');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


var shutConfig = require(__dirname + '/shut.config.json');


// TODO: im supposed to re-less things instead
gulp.task('rtlless', function () {
  // grab minisite seed to create (TODO)
  return gulp.src([shutConfig.srcUrl + 'less/all.less', shutConfig.shutUrl + 'less/rtl.sh.less', shutConfig.srcUrl + 'less/rtl.*.less'])
    .pipe(concat('allrtl.less', { newLine: '' }))
    .pipe(gulp.dest(shutConfig.srcUrl + 'less/'))
    .pipe(less(
            {modifyVars: 
                {'@shut-url': '"'+shutConfig.shutUrl + 'less/"',}
            })
        )
    .pipe(cssmin())
    .pipe(rename({ basename: shutConfig.projectName, suffix: '.rtl.min' }))
    .pipe(gulp.dest(shutConfig.distUrl + 'css'));

});

gulp.task('mirror', ['rtlless'], function () {
  var rtlmirror = function (contents, file) {

    return MirrorText(contents);
  };

  gulp.src(shutConfig.distUrl + 'css/' + shutConfig.projectName + '.rtl.min.css')
    .pipe(transform(rtlmirror, { encoding: 'utf8' }))
    .pipe(gulp.dest(shutConfig.distUrl + 'css/'));
});



function MirrorText(txt) {
  // this function is still under testing

  // find /* RTL BEGIN */ and /* RTL END */ and save their index location

  var re = /\/\* RTL BEGIN \*\/[\s\S]*?\/\* RTL END \*\//gim;
  var s;
  var matches = [];
  while (s = re.exec(txt)) {
    var rtl = s[0];
    matches.push(rtl);

  }
  var c = 0;
  txt = txt.replace(re, function () {
    return "#RTL#" + c++;
  });

  // mirror txt, 
  txt = BasicMirror(txt);

  // then plug matches back in place
  for (var i = 0; i < matches.length; i++) {
    txt = txt.replace("#RTL#" + i, matches[i]);
  }

  return txt;
}

function BasicMirror(txt) {
  // simply switch left to right
  // right(?!.+{) and left(?!.+{) to replace properties only

  var regright = /right(?=(.*:\s|.*;)+)/ig;
  var regleft = /left(?=(.*:\s|.*;)+)/ig;

  var newStr = txt.replace(regright, "shuttemp").replace(regleft, "right").replace(/shuttemp/gi, "left");


  // find padding, margin, border, and switch b with d (a b c d)
  var repPad = function (match, p1, p2, p3, p4, offset, string) {
    return "padding: " + [p1, p4, p3, p2].join(" ") + ";";
  };
  var repMargin = function (match, p1, p2, p3, p4, offset, string) {
    return "margin: " + [p1, p4, p3, p2].join(" ") + ";";
  };
  var repBorderWidth = function (match, p1, p2, p3, p4, offset, string) {
    return "border-width: " + [p1, p4, p3, p2].join(" ") + ";";
  };
  var repBorderStyle = function (match, p1, p2, p3, p4, offset, string) {
    return "border-style: " + [p1, p4, p3, p2].join(" ") + ";";
  };
  var repBorderColor = function (match, p1, p2, p3, p4, offset, string) {
    return "border-color: " + [p1, p4, p3, p2].join(" ") + ";";
  };
  //TODO border-radius

  var padre = /padding: (-?\w+)\s{1}(-?\w+)\s{1}(-?\w+)\s{1}(-?\w+)?;/g;
  var marginre = /margin: (-?\w+)\s{1}(-?\w+)\s{1}(-?\w+)\s{1}(-?\w+)?;/g;
  var borstylere = /border-style: (\w+)\s{1}(\w+)\s{1}(\w+)\s{1}(\w+)?;/g;
  var borwidthre = /border-width: (\w+)\s{1}(\w+)\s{1}(\w+)\s{1}(\w+)?;/g;
  var borcolorre = /border-color: (\w+)\s{1}(\w+)\s{1}(\w+)\s{1}(\w+)?;/g;



  newStr = newStr.replace(padre, repPad);
  newStr = newStr.replace(marginre, repMargin);
  newStr = newStr.replace(borstylere, repBorderStyle);
  newStr = newStr.replace(borwidthre, repBorderWidth);
  newStr = newStr.replace(borcolorre, repBorderColor);

  return newStr;
}
