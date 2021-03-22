const fw = require('./fw');
const assets = require('./assets');
const icons = require('./icons');
const include = require('./include');


// exports.default = watch;

exports.default = fw.watch; // watch to create src/css/sh.css
exports.rawshut = fw.rawshut; // create src/css/sh.css
exports.buildshut = fw.buildshut; // build dist/ 
exports.criticalshut = fw.criticalshut; // create src/css/sh.general.css and sh.critical.css

exports.rawless = assets.rawless; // create minisite src/css/sh.css 
exports.buildcss = assets.buildcss; // build minisite public/css/sh.min.css 
exports.assets = assets.watch; // watch minisite to create src/css/sh.css
exports.critical = assets.critical; // watch minisite to create src/css/sh.general.css and sh.critical.css

exports.iconset = icons.iconset;

exports.createLocal = include.createLocalIndex; // create index file under local folder
exports.watchLocal = include.watch; // watch and create index