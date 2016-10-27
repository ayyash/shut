## Example implementation

Inside minisite folder an example implementation of the shut framework. The framework is intended to give developers full control without having to think about design details. For example, the orginal LESS files in the framework define the grid, the reset values, give some mixin functions, but it does not define box padding, number of columns in grid system, colors, and images. This means, the developer needs to feed it in with these variables to generate their final CSS. 

To do that, in development site (minisite), a LESS folder is added, which contains four essential framework files:

- **sh.framework.less**: these are initially defined by the framework, but contain color, icon and design definitions, thus they were extracted and placed asside for front end developer to mutuate as required.

- **sh.icons.less**: these are the icons initially defined by the font added "vpicons", again, because this changes according to every project, it was extracted and placed outside. The way the icons were created, is to allow for maximum applicability. They exists as ".icon-name" and also as a LESS variabl "@icon-name" making it usable elsewhere in LESS files. (More on that here http://vinepaper.com/shutv2/elements/icons).

- **sh.vars.less**: This is where variables can be redefined, colors, grid layout, fonts, icon-fonts, urls, and general design aspects. You can add your variables here, and start using them in your own LESS files based on Shut framework.

- **sh.imports.less**: This is the file you need to use as the base file to generate your CSS. It has the required Shut files in order, in addition to **inject** tags, I use these tags in combination with GULP to add UI less files, and UI media files. You can use it as you wish, by manually inserting the files, adding your own LESS code, or using Gulp or Grunt to generate it. Find in <https://github.com/ayyash/shut/blob/master/gulptasks/shut.js> gulp tasks to generate CSS in development, and on distribution.