# Shut
> An unobtrusive UI Framework, and CSS framework

Documentation is work in progress. Find here <a href="http://vinepaper.com/">Shut Framework</a>

The idea of this framework, is to sepearte UI behavior from business behavior whenever possible. 


## Styles

In order to use styles as included from the framework, use css/sh.min.css

```
<link rel="stylesheet" href="css/sh.min.css" />
```

This stylesheet is a compilation of the LESS files in **less** folder, and **minisite/less** folder. 

The minisite folder contains a simple implementation of the shut framework. Inside less folder, there are few sh.\*.less files, these files are needed by the framework to generate the final css. They can be customized and changed, and new ui.\*.less files can be added. You can use a task runner to generate the css. A gulp task is included for that purposes if you wish to use it. It was made on purpose like that to allow for maximum customization (because let's face it, Bootstrap websites look almost the same).

*TODO* More documentation