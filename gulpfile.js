'use strict';

var gulp       = require('gulp'),
    stylish    = require('jshint-stylish'),
    browserify = require('browserify'),
    mainBowerFiles = require('main-bower-files'),
    source      = require('vinyl-source-stream');

var gulpLoadOptions = {
      'rename': {
        'gulp-ruby-sass': 'scss',
        'gulp-filter': 'gulpFilter',
      }
    };

var SETTINGS = {
  src: {
    app:       'app/',
    layout:    'app/layout/',
    component: 'app/component/',
    css:       'app/assets/stylesheets/',
    js:        'app/assets/javascript/',
    vendor:    'app/assets/javascript/vendor',
    lib:       'app/assets/lib/'
  },
  build: {
    dist:  'dist/',
    lib:   'dist/assets/lib/',
    css:   'dist/assets/css/',
    js:    'dist/assets/javascript/',
    fonts: 'dist/assets/fonts/'
  }
};

var $ = require('gulp-load-plugins')(gulpLoadOptions);

/*============================================================
=                          bower-copy                   =
============================================================*/

gulp.task('bower-copy', ['bower-copy:mainFile', 'bower-copy:css', 'bower-copy:js', 'bower-copy:fonts']);

gulp.task('bower-copy:mainFile', function() {
  console.log("-------------------------------------------------- bower-copy:mainFile");
  gulp.src(mainBowerFiles())
      .pipe(gulp.dest(SETTINGS.src.lib));
});

gulp.task('bower-copy:css', function() {
  console.log("-------------------------------------------------- bower-copy:css");
  gulp.src(SETTINGS.src.lib + '**/*.css')
      .pipe(gulp.dest(SETTINGS.build.lib));
});

gulp.task('bower-copy:js', function() {
  console.log("-------------------------------------------------- bower-copy:js");
  gulp.src(SETTINGS.src.lib + '**/*.js')
      .pipe(gulp.dest(SETTINGS.build.lib));
});
gulp.task('bower-copy:fonts', function() {
  console.log("-------------------------------------------------- bower-copy:fonts");
  gulp.src(SETTINGS.src.lib + '**/*.{otf,eot,svg,ttf,woff}')
      .pipe(gulp.dest(SETTINGS.build.fonts));
});


/*============================================================
=                          compile language                   =
============================================================*/

gulp.task('compile', ['compile:jade', 'compile:scss', 'compile:browserify', 'compile:pluginJS', 'compile:pluginCSS']);

gulp.task('compile:jade', function() {
  console.log("-------------------------------------------------- 編譯jade");
  var YOUR_LOCALS = {};
  gulp.src([ SETTINGS.src.app + '**/*.jade', '!' + SETTINGS.src.layout + '**/*.jade', '!' + SETTINGS.src.component + '**/*.jade'])
  .pipe($.jade({
    pretty: true
  }))
  .pipe(gulp.dest(SETTINGS.build.dist))
  .pipe($.livereload());
});

gulp.task('compile:scss', function(){
  console.log("-------------------------------------------------- 編譯scss");
  gulp.src(SETTINGS.src.css + 'styles.scss')
  .pipe($.scss({
    sourcemap: true,
    sourcemapPath: '/',
    style: 'compressed',
    debugInfo: false,
    compass: true
  }))
  .on('error', function (err) { console.log(err.message); })
  .pipe(gulp.dest(SETTINGS.build.css))
  .pipe($.livereload());
});


gulp.task('compile:browserify', ['jshint'], function() {
  console.log("-------------------------------------------------- browserify run");
  var b = browserify();
  b.add('./' + SETTINGS.src.js + 'default.js');
  b.bundle()
  .on('error', $.util.log.bind($.util, 'Browserify Error'))
  .pipe(source('all.js'))
  .pipe(gulp.dest(SETTINGS.build.js))
  .pipe($.livereload());
});

gulp.task('compile:pluginJS', function(){
  console.log("-------------------------------------------------- plugin js");
  gulp.src(SETTINGS.build.lib + '*.js')
  .pipe($.uglify({
    mangle: false
  }))
  .pipe($.concat('pluginAll.min.js'))
  .pipe(gulp.dest(SETTINGS.src.vendor));
});

gulp.task('compile:pluginCSS', function(){
  console.log("-------------------------------------------------- plugin CSS");
  gulp.src(SETTINGS.build.lib + '*.css')
  .pipe($.minifyCss({
    debug: true
  }))
  .pipe($.concat('pluginAll.min.css'))
  .pipe(gulp.dest(SETTINGS.build.css));
});

/*============================================================
=                          jshint                   =
============================================================*/

gulp.task('jshint', function() {
  console.log("-------------------------------------------------- 檢查jshint");
  gulp.src(SETTINGS.src.js)
  .pipe($.jshint())
  .pipe($.jshint.reporter(stylish));
});

/*============================================================
=                          watch                   =
============================================================*/

gulp.task('watch', function() {
  $.livereload.listen();
  gulp.watch(SETTINGS.src.app + '**/*.jade', ['clean:html', 'compile:jade']);
  gulp.watch(SETTINGS.src.css + '*.scss', ['clean:css', 'compile:scss', 'compile:pluginCSS']);
  gulp.watch([SETTINGS.src.js + '**/*.js', '!' + SETTINGS.src.vendor + '**/*.js'], ['clean:js', 'compile:browserify', 'compile:pluginJS']);
});


/*============================================================
=                          clean                   =
============================================================*/

gulp.task('clean:all', function(cb) {
  console.log("-------------------------------------------------- 清除dist全部");
  return gulp.src(SETTINGS.build.dist, {read: false})
  .pipe($.clean());
});

gulp.task('clean:html', function(cb) {
  console.log("-------------------------------------------------- 清除html!!!");
  return gulp.src(SETTINGS.build.dist + '**/*.html', {read: false})
  .pipe($.clean());
});

gulp.task('clean:css', function(cb) {
  console.log("-------------------------------------------------- 清除css!!!");
  return gulp.src(SETTINGS.build.css, {read: false})
  .pipe($.clean());
});

gulp.task('clean:js', function(cb) {
  console.log("-------------------------------------------------- 清除js!!!");
  return gulp.src(SETTINGS.build.js, {read: false})
  .pipe($.clean());
});

/*============================================================
=                          build                   =
============================================================*/

gulp.task('build', ['bower-copy', 'compile', 'watch'], function() {
  console.log('-------------------------------------------------- BUILD - Development Mode');
});

/*============================================================
=                          default                   =
============================================================*/

gulp.task('default', ['build']);

gulp.task('prod', ['build:prod']);