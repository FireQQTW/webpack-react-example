var gulp      = require('gulp'),
    scss      = require('gulp-ruby-sass'),
    clean     = require('gulp-clean'),
    concat    = require('gulp-concat'),
    uglify    = require('gulp-uglify'),
    jshint    = require('gulp-jshint'),
    debug     = require('gulp-debug'),
    stylish   = require('jshint-stylish'),
    jade      = require('gulp-jade'),
    bowerSrc  = require('gulp-bower-src'),
    gulpFilter = require('gulp-filter'),
    rename     = require('gulp-rename'),
    watchify   = require('watchify'),
    browserify = require('browserify'),
    gutil      = require('gulp-util'),
    source     = require('vinyl-source-stream'),
    livereload = require('gulp-livereload');

var path = {
    stylesheetsPath: './app/assets/stylesheets/*.scss',
    jsPath: './app/assets/javascript/**/*.js',
    jadePath: './app/**/*.jade'
};

// jade to bower-src task
gulp.task('bower-src', ['clean'], function () {
    console.log("=============== bower-src ===============");
    var jsFilter = gulpFilter(['**/*.js', '!**/*.min.js']),
        cssFilter = gulpFilter(['**/*.css', '!**/*.min.css']);
    
    gulp.src('./app/assets/lib/**/*')
    .pipe(gulp.dest('./dist/assets/lib'));

    bowerSrc()
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(concat('pluginAll.min.js'))
        .pipe(jsFilter.restore())
        .pipe(gulp.dest('./dist/assets/lib'));
    bowerSrc()
        .pipe(cssFilter)
        .pipe(concat('pluginAll.min.css'))
        .pipe(cssFilter.restore())
        .pipe(gulp.dest('./dist/assets/lib'));
});

// jade to HTML task
gulp.task('jade', ['clean'], function() {
  console.log("=============== 編譯jade ===============");
  var YOUR_LOCALS = {};
  gulp.src(['./app/**/*.jade', '!./app/layout/**/*.jade', '!./app/component/**/*.jade'])
  .pipe(jade({
    pretty: true
  }))
  .pipe(gulp.dest('./dist/'));
});

// scss task
gulp.task('scss', ['clean'], function(){
    console.log("=============== 編譯scss ===============");
    gulp.src('./app/assets/stylesheets/styles.scss')
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
  gulp.src('./app/assets/javascript/**/*.js')
  .pipe(debug())
  .pipe(uglify({
    mangle: false
  }))
  .pipe(concat('all.js'))
  .pipe(gulp.dest('./dist/assets/javascript'));
});


// browserify task
var bundler = watchify(browserify('./app/assets/javascript/default.js', watchify.args));
bundler.transform('brfs');

gulp.task('browserify:compile', ['clean'], bundleBrowserify);
bundler.on('update', bundleBrowserify);

function bundleBrowserify() {
  console.log("=============== browserify run ===============");
  bundler.bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify Error'))
  .pipe(source('all.js'))
  .pipe(gulp.dest('./dist/assets/javascript'));
}

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
   'scss',
   'bower-src',
   'watch',
   // 'jshint',
   'jade',
   'browserify:compile'
   // 'concatJS:pro',
   ]);