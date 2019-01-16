const fw = require('./fw');
const assets = require('./assets');
const icons = require('./icons');


// exports.default = watch;

exports.default = fw.watch; // watch to create src/css/sh.css
exports.rawshut = fw.rawshut; // create src/css/sh.css
exports.buildshut = fw.buildshut; // build dist/ 

exports.rawless = assets.rawless; // create minisite src/css/sh.css 
exports.buildcss = assets.buildcss; // build minisite public/css/sh.min.css 
exports.assets = assets.watch; // watch minisite to create src/css/sh.css

exports.iconset = icons.iconset;