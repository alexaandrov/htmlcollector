'use strict';

const gulp          = require('gulp'),
    sass            = require('gulp-sass'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglify'),
    cleanCSS        = require('gulp-clean-css'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    cache           = require('gulp-cache'),
    autoprefixer    = require('gulp-autoprefixer'),
    bourbon         = require('node-bourbon'),
    errorNotifier   = require('gulp-error-notifier'),
    browserSync     = require('browser-sync');

const base = {
    preprocessor: 'scss'
};

const path = {
    bower: 'bower_modules',
    npm: 'node_modules',
    source: 'src',
    dest: 'dist'
};

gulp.task('browser-sync', function () {
    browserSync({
        proxy: {
            target: "http://sample.www"
        },
        notify: true
    });
});

gulp.task('scss', function () {
    del.sync(path.dest + '/css/**/*');
    return gulp.src(path.source + '/' + base.preprocessor + '/**/*.' + base.preprocessor)
        .pipe(errorNotifier())
        .pipe(sass.sync({
            outputStyle: 'compressed',
            includePaths: bourbon.includePaths
        }).on('error', sass.logError))
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.dest + '/css'));
});

gulp.task('js', function () {
    return gulp.src(path.source + '/js/**/*.js')
        .pipe(errorNotifier())
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dest + '/js'));
});

gulp.task('libs', function () {
    del.sync(path.dest + '/js/libs.min.js');
    return gulp.src([
        path.npm + '/jquery/dist/jquery.min.js',
        path.npm + '/bootstrap-sass/assets/javascripts/bootstrap.min.js',
        path.npm + '/html5shiv/dist/html5shiv.min.js',
        path.npm + '/respond.js/dest/respond.min.js'
    ])
        .pipe(errorNotifier())
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dest + '/js'));
});

gulp.task('fonts', function () {
    del.sync(path.dest + '/fonts/**/*');
    return gulp.src(path.source + '/fonts/**/*').pipe(gulp.dest(path.dest + '/fonts'));
});

gulp.task('imagemin', function () {
    del.sync(path.dest + '/images/**/*');
    return gulp.src(path.source + '/images/**/*')
        .pipe(errorNotifier())
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(path.dest + '/images'));
});

gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('build', [base.preprocessor, 'libs', 'js', 'imagemin', 'fonts']);

gulp.task('watch', [base.preprocessor, 'libs', 'js', 'browser-sync'], function () {
    gulp.watch(path.source + '/' + base.preprocessor + '/**/*.' + base.preprocessor, [base.preprocessor]);
    gulp.watch(path.source + '/css/**/*.css', [base.preprocessor]);
    gulp.watch(path.source + '/js/**/*.js', ['js']);
    gulp.watch(path.source + '/images/**/*', ['imagemin']);
    gulp.watch(path.source + '/fonts/**/*', ['fonts']);
    gulp.watch(path.dest + '/fonts/**/*', browserSync.reload);
    gulp.watch(path.dest + '/images/**/*', browserSync.reload);
    gulp.watch(path.dest + '/js/**/*.js', browserSync.reload);
    gulp.watch(path.dest + '/css/**/*.css', browserSync.reload);
    gulp.watch('..' + '/pages/**/*.htm', browserSync.reload);
    gulp.watch('..' + '/partials/**/*.htm', browserSync.reload);
});

gulp.task('default', ['build', 'watch']);