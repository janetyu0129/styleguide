var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    imagemin = require('gulp-imagemin'),
    rename = require("gulp-rename"),
    clean = require('gulp-clean'),
    jade = require('gulp-jade'),
    compass = require('gulp-compass'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    webserver = require('gulp-webserver'),
    livereload = require('gulp-livereload');

/**
 * Test and Product
 */

gulp.task('testJs', function() {
    gulp.src('app/js/**/*.js')
        .pipe(gulp.dest('../ctbcproject/src/main/webapp/js'));
});

gulp.task('minJs', function() {
    gulp.src('app/js/all.js')
        .pipe(uglify({
            compress: {
                drop_console: true
            }
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('../ctbcproject/src/main/webapp/js'));
});

gulp.task('testCss', function() {
    gulp.src('app/css/all.css')
        .pipe(gulp.dest('../ctbcproject/src/main/webapp/css'));
});

gulp.task('minCss', function() {
    gulp.src('app/css/all.css')
        .pipe(uglifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('../ctbcproject/src/main/webapp/css'));
});

gulp.task('minImages', ['cleanImages'], function() {
    gulp.src('app/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('../ctbcproject/src/main/webapp/images'));
});

gulp.task('cleanImages', function() {
    gulp.src('../ctbcproject/src/main/webapp/images', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});


/**
 * Develop
 */

gulp.task('jade', function() {
    gulp.src('src/jade/*.jade')
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('app'))
        .pipe(livereload());
});

function jadeCompileAndRefresh(file) {
    gulp.src(file)
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('app'))
        .pipe(livereload());
}

gulp.task('compass', ['cleanAppCSS'], function() {
    gulp.src('src/scss/**/*.scss')
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(compass({
            config_file: 'config.rb',
            css: 'app/css',
            sass: 'src/scss'
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(livereload());
});

gulp.task('cleanAppCSS', function() {
    gulp.src('app/css/**/*.css', {
            read: false
        })
        .pipe(clean());
});

gulp.task('concatPlugins', ['cleanAppPluginsJS'], function() {
    gulp.src(['src/js/plugins/**/*.js'])
        .pipe(concat('all.plugins.js'))
        .pipe(gulp.dest('app/js'))
        .pipe(livereload());
});

gulp.task('concatSource', ['cleanAppSourceJS'], function() {
    gulp.src(['src/js/source/library/*.js', 'src/js/source/Class/*.js', 'src/js/source/component/*.js', 'src/js/source/*.js'])
        .pipe(plumber({
            errorHandler: function(error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/js'))
        .pipe(livereload());
});

gulp.task('cleanAppPluginsJS', function() {
    gulp.src('app/js/all.plugins.js', {
            read: false
        })
        .pipe(clean());
});

gulp.task('cleanAppSourceJS', function() {
    gulp.src('app/js/all.js', {
            read: false
        })
        .pipe(clean());
});

/*********************************************************/


/**
 * Web Server
 */
gulp.task('webserver', function() {
    gulp.src('app')
        .pipe(webserver({
            fallback: 'index.html',
            open: true,
            directoryListing: {
                enable: true,
                path: 'app'
            }
        }));
});

gulp.task('livereload', function() {
    livereload.listen();
    gulp.watch('src/jade/**/*.jade', function(event) {
        jadeCompileAndRefresh(event.path);
    });
    gulp.watch('src/scss/**/*.scss', ['compass']);
    gulp.watch('src/js/plugins/**/*.js', ['concatPlugins']);
    gulp.watch('src/js/source/**/*.js', ['concatSource']);
});



/*********************************************************/

/**
 * Mixin feature of usage
 */
gulp.task('start', ['webserver']);

gulp.task('watch', ['jade', 'compass', 'concatPlugins', 'concatSource', 'livereload']);

gulp.task('test', ['testJs', 'testCss', 'minImages']);

gulp.task('pd', ['minJs', 'minCss', 'minImages']);