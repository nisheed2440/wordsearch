var gulp = require('gulp');
var obfuscate = require('gulp-js-obfuscator');

gulp.task('default', function() {
    return gulp.src([
            './build/bundle.app.js',
            './build/bundle.vendor.js'
        ])
        .pipe(obfuscate())
        .pipe(gulp.dest('build/obfuscator'))
});