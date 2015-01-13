var gulp      = require('gulp'),
    scss      = require('gulp-ruby-sass'),
    clean     = require('gulp-clean'),
    concat    = require('gulp-concat'),
    uglify    = require('gulp-uglify'),
    jshint    = require('gulp-jshint'),
    debug     = require('gulp-debug'),
    stylish   = require('jshint-stylish'),
    jade      = require('gulp-jade'),
    prettify  = require('gulp-prettify'),
    livereload = require('gulp-livereload');

var path = {
    stylesheetsPath: './app/assets/stylesheets/*.scss',
    jsPath: './app/assets/javascript/**/*.js',
    jadePath: './app/**/*.jade'
};

// jade to HTML task
gulp.task('jade', ['clean'], function() {
  console.log("=============== 編譯jade ===============");
  var YOUR_LOCALS = {};
  gulp.src(['./app/**/*.jade', '!./app/layout/**/*.jade', '!./app/component/**/*.jade'])
  .pipe(jade())
  .pipe(prettify({indent_size: 2}))
  .pipe(gulp.dest('./dist/'));
});

// scss task
gulp.task('scss', ['clean'], function(){
    console.log("=============== 編譯scss ===============");
    gulp.src(path.stylesheetsPath)
    .pipe(scss({
      sourcemap: true,
      sourcemapPath: '../scss',
      style: 'compressed',
      debugInfo: true,
      compass: true
    }))
    .on('error', function (err) { console.log(err.message); })
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(livereload());
});


// jshint task
gulp.task('jshint', ['clean'], function() {
  console.log("=============== 檢查jshint ===============");
  gulp.src(path.jsPath)
  .pipe(jshint())
  .pipe(jshint.reporter(stylish));
});


// include JS task
gulp.task('concatJS:pro', ['clean'], function(){
  console.log("=============== 合併、壓縮 js ===============");
  gulp.src([path.jsPath, '!./app/assets/javascript/plugin/**'])
  .pipe(uglify()) 
  .pipe(concat('all.js'))
  .pipe(gulp.dest('./dist/assets/javascript'));
});

// concat js plugin task
gulp.task('concatJS:plugin:pro', ['concatJS:pro'], function() {
  console.log("=============== 合併plugin js ===============");
  gulp.src('./app/assets/javascript/plugin/**')
  .pipe(concat('pluginAll.js'))
  .pipe(gulp.dest('./dist/assets/javascript'));
});


// watch task
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(path.jadePath, ['default']);
  gulp.watch(path.stylesheetsPath, ['default']);
  gulp.watch(path.jsPath, ['default']);
});


// clean task
gulp.task('clean', function(cb) {
  console.log("=============== 清除編譯編譯完的檔案!!! ===============");
  return gulp.src('./dist', {read: false})
  .pipe(clean());
});


// default task
gulp.task('default', 
  ['clean',
   'watch',
   'scss',
   // 'jshint',
   'jade',
   'concatJS:pro',
   'concatJS:plugin:pro'
   ]);