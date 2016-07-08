var gulp      = require('gulp');
var prefix    = require('gulp-autoprefixer');
var cmq       = require('gulp-combine-media-queries');
var concat    = require('gulp-concat');
var less      = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename    = require('gulp-rename');
var uglifyJS  = require('gulp-uglify');
var util      = require('gulp-util');

var cssDest    = 'style/css/';
var lessDest   = 'style/less/';
var cssMinName = 'form.min.css';

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

var jsDest = 'js/';
var jsFiles = [
    'form',
    'validator'
];

gulp.task('js-min', function() {

    for (var i = 0; i < jsFiles.length; i++) {
        gulp.src(jsDest + jsFiles[i] + '.js')
            .pipe(gulp.dest(jsDest))
            .pipe(rename(jsFiles[i] + '.min.js'))
            .pipe(uglifyJS())
            .pipe(gulp.dest(jsDest));
    }
});