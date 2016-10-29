# Shut framework

#### An unobtrusive UI Framework, and CSS framework

```
npm install shut --save-dev
```

> Documentation is work in progress. Find here <a href="http://vinepaper.com/">Shut Framework</a>

The idea of this framework, is to sepearte UI behavior from business behavior whenever possible. This framework takes away a lot of repeated work for front-end developers, but it needs to be seeded in order to bring the desired results.  

## Getting started

In order to use styles as included from the framework, use dist/css/sh.min.css. This is a quick-start stylesheet using the seeds found in minisite (an example implementation). Read about the minisite here <https://github.com/ayyash/shut/tree/master/minisite>.

```
<link rel="stylesheet" href="dist/css/sh.min.css" />
<script src="dist/js/sh.data.js"></script>
<script src="dist/js/sh.min.js"></script>
```

The first step to get started is to setup your own seed, which contains at least the following files:

1. js/sh.data.js
2. less/sh.vars.less
3. less/sh.icons.less
4. less/sh.framework.less

The minisite folder contains a simple implementation of the shut framework. It was made on purpose like that to allow for maximum customization (because let's face it, Bootstrap websites look alike).

Copy the folders minisite/src over to your new website, and customize as required. Then run a task to generate the final CSS and JS. 

The CSS task should generate files in the order they appear in <https://github.com/ayyash/shut/blob/master/minisite/src/less/sh.imports.less>. You can use gulp taks "rawless" found in <https://github.com/ayyash/shut/blob/master/gulptasks/shut.js> for this purpose.

As for JS, the minisite/src/js/sh.js is a concatination of Shut framework files, you only need to reference dev.js, and sh.data.js in your html, and any other javascript files you create.



*TODO* More documentation