// ////////////////////////////////////////////////
// jsConcatFiles => list of javascript files (in order) to concatenate
// // /////////////////////////////////////////////

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
        taskListing = require('gulp-task-listing'),
        fs = require('fs'),
        userHome = require("user-home"),
        GulpSSH = require("gulp-ssh"),
        zip = require('gulp-zip'),
        exec = require('child_process').exec;

var config = {
	jsConcatFiles: [
            'app/js/app.js',
            'app/js/controllers.js',
            'app/js/directives.js',
            'app/js/services.js'
	],
        distFilesBowerCopy: [
            'app/bower_components/bootstrap/dist/css/bootstrap.min.css',
            'app/bower_components/bootstrap/dist/js/bootstrap.min.js',
            'app/bower_components/jquery/dist/jquery.min.js',
            'app/bower_components/angular/angular.min.js',
            'app/bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
            'app/bower_components/leaflet/dist/leaflet.js',
            'app/bower_components/leaflet/dist/leaflet.css',
            'app/bower_components/leaflet/dist/images/**',
            'app/bower_components/leaflet-plugins/layer/tile/Google.js',
            'app/bower_components/leaflet-draw/dist/leaflet.draw.js',
            'app/bower_components/leaflet-draw/dist/leaflet.draw.css',
            'app/bower_components/leaflet-draw/dist/images/**',
            'app/bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.min.js',
            'app/bower_components/angular.panels/dist/angular.panels.min.js',
            'app/bower_components/angular.panels/dist/angular.panels.min.css'
        ],
        sshOptionsUser: {
            host: 'lamaquina',
            port: 22,
            username: 'user',
            privateKey: fs.readFileSync(userHome + "/.ssh/id_rsa")
        },
        sshOptionsRoot: {
            host: 'lamaquina',
            port: 22,
            username: 'root',
            privateKey: fs.readFileSync(userHome + "/.ssh/id_rsa")
        }
};

var gulpSSHUser = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config.sshOptionsUser
});

var gulpSSHRoot = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config.sshOptionsRoot
});

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
gulp.task('dist:cleanfolder', function (cb) {
    exec('rm -rf dist', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
    });
});

// task to create dist directory of all files
gulp.task('dist:copy', ['scripts', 'replace-html'], function(){
    return gulp.src(
        [
        'app/!(bower_components)/*/',
        '!app/index.html',
        '!app/js/app.js',
        '!app/js/controllers.js',
        '!app/js/directives.js',
        '!app/js/services.js'
        ]
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist:copy-components', ['scripts', 'replace-html'], function () {
    return gulp.src(config.distFilesBowerCopy, { base: 'app/bower_components/'})
        .pipe(gulp.dest('dist/bower_components'));
});


gulp.task('dist', ['dist:copy', 'dist:copy-components']);
gulp.task('dist:zip', ['dist'], function () {
    return gulp.src('dist/**/*')
        .pipe(zip('veloprovements-dist.zip'))
        .pipe(gulp.dest('.'));
});

// ////////////////////////////////////////////////
// Watch Tasks
// // /////////////////////////////////////////////

gulp.task ('watch', function(){
	gulp.watch('app/js/**/*.js', ['scripts', 'jshint']);
  	gulp.watch('app/**/*.html', ['html']);
});

gulp.task('default', ['scripts', 'html', 'browser-sync', 'watch']);

// ////////////////////////////////////////////////
// Remote Tasks
// // /////////////////////////////////////////////

gulp.task('remote:deploy-all', ['remote:deploy', 'remote:deploy-python']);

gulp.task('remote:deploy', ['remote:transfer']);
gulp.task('remote:transfer', ['dist', 'remote:cleanup'], function () {
    return gulp.src('dist/**/*')
        .pipe(gulpSSHUser.dest('/var/www/veloprovements/static'))
});

gulp.task('remote:cleanup', function() {
    return gulpSSHUser
        .exec([
            'rm -rf /var/www/veloprovements/static/*'
            ],
        {filePath: 'commands.log'})
        .pipe(gulp.dest('logs'))
});

gulp.task('remote:deploy-python', ['remote:start-services-python']);

gulp.task('remote:start-services-python', ['remote:transfer-python'], function() {
    return gulpSSHRoot
        .exec([
            'systemctl start uwsgi',
            'systemctl start nginx'
            ],
        {filePath: 'commands.log'})
        .pipe(gulp.dest('logs'))
});

gulp.task('remote:transfer-python', ['remote:cleanup-python'], function() {
    return gulp.src('../veloprovements.py')
        .pipe(gulpSSHUser.dest('/var/www/veloprovements'))
});

gulp.task('remote:cleanup-python', [], function() {
    return gulpSSHRoot
        .exec([
            'systemctl stop nginx',
            'systemctl stop uwsgi',
            'rm -f /var/www/veloprovements/veloprovements.py'
            ],
        {filePath: 'commands.log'})
        .pipe(gulp.dest('logs'))
});
