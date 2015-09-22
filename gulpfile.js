// ////////////////////////////////////////////////
// jsConcatFiles => list of javascript files (in order) to concatenate
// // /////////////////////////////////////////////

var config = {
	jsConcatFiles: [
            'app/js/app.js',
            'app/js/controllers.js'
	], 
        distFilesBowerCopy: [
            'app/bower_components/leaflet/dist/leaflet.js',
            'app/bower_components/leaflet/dist/leaflet.css',
            'app/bower_components/angular/angular.min.js',
            'app/bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
            'app/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.min.js'
        ]
};


// ////////////////////////////////////////////////
// Required taskes
// gulp dist
// bulp dist:serve
// // /////////////////////////////////////////////

var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
        gutil = require('gulp-util'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
        jshint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
        clean = require('gulp-clean'),
        htmlReplace = require('gulp-html-replace'),
        taskListing = require('gulp-task-listing');


// ////////////////////////////////////////////////
// Utility tasks
// // /////////////////////////////////////////////

gulp.task('help', taskListing);

// ////////////////////////////////////////////////
// Scripts Tasks
// ///////////////////////////////////////////////

gulp.task('scripts', ['dist:cleanfolder'], function() {
  return gulp.src(config.jsConcatFiles)
    .pipe(concat('temp.js'))
    .pipe(uglify())
    .pipe(rename('app.min.js'))		
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({stream:true}));
});

// configure the jshint task
gulp.task('jshint', function() {
  return gulp.src(config.jsConcatFiles)
    .pipe(jshint({
        "undef": true,
        "unused": true
    }))
    .pipe(jshint.reporter('jshint-stylish'));
});

// ////////////////////////////////////////////////
// HTML Tasks
// // /////////////////////////////////////////////

gulp.task('html', ['replace-html'], function(){
    return gulp.src('app/**/*.html')
    .pipe(reload({stream:true}));
});

gulp.task('replace-html', function () {
    return gulp.src('app/index.html')
    .pipe(htmlReplace({
        'js': 'js/app.min.js'
    }))
    .pipe(gulp.dest('dist'));
});


// ////////////////////////////////////////////////
// Browser-Sync Tasks
// // /////////////////////////////////////////////

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./app/"
        },
        browser: "chromium"
    });
});

// task to run dist server for testing final app
gulp.task('dist:serve', function() {
    browserSync({
        server: {
            baseDir: "./dist/"
        },
        browser: "chromium"
    });
});


// ////////////////////////////////////////////////
// Build Tasks
// // /////////////////////////////////////////////

// clean out all files and folders from dist folder
gulp.task('dist:cleanfolder', function () {
    return gulp.src('dist/**', { read: false}).
        pipe(clean());
});

// task to create dist directory of all files
gulp.task('dist:copy', ['scripts', 'replace-html'], function(){
    return gulp.src(
        ['app/!(bower_components)/*/','!app/index.html', '!app/js/app.js', '!app/js/controllers.js']
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist:copy-components', ['scripts', 'replace-html'], function () {
    return gulp.src(config.distFilesBowerCopy, { base: 'app/bower_components/'}).
        pipe(gulp.dest('dist/bower_components'));
});

gulp.task('dist', ['dist:copy', 'dist:copy-components']);

// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task ('watch', function(){
	gulp.watch('app/js/**/*.js', ['scripts', 'jshint']);
  	gulp.watch('app/**/*.html', ['html']);
});


gulp.task('default', ['scripts', 'html', 'browser-sync', 'watch']);
