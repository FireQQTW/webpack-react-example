
'use strict';

var gulp             = require('gulp'),
    stylish          = require('jshint-stylish'),
    mainBowerFiles   = require('main-bower-files'),
    source           = require('vinyl-source-stream'),
    webpack          = require('webpack'),
    pngquant         = require('imagemin-pngquant'),
    WebpackDevServer = require("webpack-dev-server"),
    webpackConfig    = require('./webpack.config'),
    webpackDevConfig = require('./webpack-dev.config'),
    webpackProdConfig = require('./webpack-prod.config');

var gulpLoadOptions = {
      'rename': {
        'gulp-ruby-sass': 'scss',
        'gulp-filter': 'gulpFilter',
      }
    };

var SETTINGS = {
  src: {
    app:          'app/',
    publicAssets: 'app/assets/public/',
    layout:       'app/layout/',
    component:    'app/component/',
    css:          'app/assets/stylesheets/',
    js:           'app/assets/javascript/',
    images:       'app/assets/images/',
    vendor:       'app/assets/javascript/vendor',
    lib:          'app/assets/lib/'
  },
  build: {
    dist:         'dist/',
    publicAssets: 'dist/assets/public/',
    lib:          'dist/assets/lib/',
    css:          'dist/assets/css/',
    js:           'dist/assets/javascript/',
    images:       'dist/assets/images/',
    fonts:        'dist/assets/fonts/'
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
=                          images                   =
============================================================*/

gulp.task('images:all', ['images:min']);

gulp.task('images:min', function() {
  console.log("-------------------------------------------------- images min.....");
  gulp.src(SETTINGS.src.images + '*')
  .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
  }))
  .pipe(gulp.dest(SETTINGS.build.images));
});

/*============================================================
=                          public assets                   =
============================================================*/

gulp.task('public:assets', function() {
  console.log("-------------------------------------------------- copy assets");
  gulp.src(SETTINGS.src.publicAssets + '*')
  .pipe(gulp.dest(SETTINGS.build.publicAssets));
});

/*============================================================
=                          compile language                   =
============================================================*/

gulp.task('compile', ['compile:jade', 'compile:scss', 'compile:webpack', 'compile:pluginJS', 'compile:pluginCSS']);
gulp.task('compile:prod', ['compile:jade', 'compile:scss', 'compile:webpack:prod', 'compile:pluginJS', 'compile:pluginCSS']);


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
=                          webpack                   =
============================================================*/

gulp.task('compile:webpack:prod', function(){
  console.log("-------------------------------------------------- 編譯webpack:prod");

  webpack(webpackProdConfig, function (err, stats) {
    if (err) {
      throw new $.util.PluginError('compile:webpack:prod', err);
    }

    $.util.log('[compile:webpack:prod]', stats.toString({
      colors: true
    }));
  });
});

gulp.task('compile:webpack', function(){
  console.log("-------------------------------------------------- 編譯webpack");

  webpack(webpackDevConfig, function (err, stats) {
    if (err) {
      throw new $.util.PluginError('webpack-dev-server', err);
    }

    $.util.log('[webpack-dev-server]', stats.toString({
      colors: true
    }));
  });
});

gulp.task('webpack-dev-server', function(callback) {

  var server = new WebpackDevServer(webpack(webpackDevConfig), {
    publicPath: '/assets/javascript/',
    contentBase: 'dist',

    // Toggle this to enable _in code_ hot module replacement.
    // See hot-module.js / css for an example.  If you're looking
    // to simply update css / js, set to false for a sufficent enough
    // page refresh.  Otherwise you will need to wrap js requires
    // in the hot module loader accept callback in `app.js`.
    hot: true,
    inline: true,
    noInfo: true,
    quiet: true,
    lazy: false,
    stats: { colors: true },
    watchDelay: 200
  });

  server.listen(8080, "localhost", function() {});

  $.util.log('[webpack-dev-server]',
    'http://localhost:8080/webpack-dev-server/index.html');

  callback();
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
  gulp.watch(SETTINGS.src.images + '**/*', ['images:all']);
  gulp.watch(SETTINGS.src.publicAssets + '**/*', ['public:assets']);
  gulp.watch(SETTINGS.src.css + '**/*.scss', ['clean:css', 'compile:scss', 'compile:pluginCSS']);
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
=                open server & livereload               =
============================================================*/

gulp.task('connectDist', function () {
  $.connect.server({
    root: 'dist',
    port: 8080,
    livereload: true
  });
});

/*============================================================
=                          build                   =
============================================================*/

gulp.task('build:prod', ['connectDist', 'bower-copy', 'compile:prod', 'images:all', 'public:assets', 'watch'], function() {
  console.log('-------------------------------------------------- BUILD - Production Mode');
});

gulp.task('build', ['webpack-dev-server', 'bower-copy', 'compile', 'images:all', 'public:assets', 'watch'], function() {
  console.log('-------------------------------------------------- BUILD - Development Mode');
});

/*============================================================
=                          default                   =
============================================================*/

gulp.task('default', ['build']);

gulp.task('prod', ['build:prod']);