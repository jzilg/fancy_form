var gulp      = require('gulp'),
    prefix    = require('gulp-autoprefixer'),
    cmq       = require('gulp-combine-media-queries')
    concat    = require('gulp-concat'),
    less      = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    rename    = require('gulp-rename')
;

var cssDest    = 'style/css/',
    lessDest   = 'style/less/'
    cssMinName = 'form.min.css'
;

gulp.task('css', function() {

    gulp.src(lessDest + '*.less')
        .pipe(less()).on('error', console.error.bind(console))
        .pipe(prefix(
            'Android',
            'BlackBerry',
            'iOS',
            'FirefoxAndroid',
            'ChromeAndroid',
            'Explorer Mobile',
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'Safari',
            'ie > 8'
        ))
        .pipe(minifyCSS({keepSpecialComments: '0'}))
        .pipe(cmq({
            log: false
        }))
        .pipe(gulp.dest(cssDest));
});

gulp.task('css-min', function() {

    gulp.src(cssDest + '*.css')
        .pipe(concat(cssMinName))
        .pipe(minifyCSS({keepSpecialComments: '0'}))
        .pipe(rename(cssMinName))
        .pipe(gulp.dest(cssDest));
});