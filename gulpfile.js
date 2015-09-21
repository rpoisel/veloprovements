// ////////////////////////////////////////////////
// jsConcatFiles => list of javascript files (in order) to concatenate
// distFilesFoldersRemove => list of files to remove when running final dist
// // /////////////////////////////////////////////

var config = {
	jsConcatFiles: [
            'app/js/main.js'
	], 
	distFilesFoldersRemove:[
            'app/js/*.min.js',
            'dist/js/!(*.min.js)',
	    'dist/bower.json',
            'dist/bower_components/',
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
        clean = require('gulp-clean');
        taskListing = require('gulp-task-listing'),


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
    .pipe(gulp.dest('app/js'))
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

gulp.task('html', function(){
    return gulp.src('app/**/*.html')
    .pipe(reload({stream:true}));
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
gulp.task('dist:copy', ['scripts'], function(){
    return gulp.src('app/**/*/')
    .pipe(gulp.dest('dist/'));
});

// task to removed unwanted dist files
// list all files and directories here that you don't want included
gulp.task('dist:remove', ['dist:copy'], function () {
    return gulp.src(config.distFilesFoldersRemove, { read: false}).
        pipe(clean());
});

gulp.task('dist', ['dist:copy', 'dist:remove']);

// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task ('watch', function(){
	gulp.watch('app/js/**/*.js', ['scripts', 'jshint']);
  	gulp.watch('app/**/*.html', ['html']);
});


gulp.task('default', ['scripts', 'html', 'browser-sync', 'watch']);
