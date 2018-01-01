// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  gulp.src('./src/assets/less/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./src/assets/css'));
});

// gulp.task('integrate-less', function () {
//     gulp.src('./assets/less/integrate.less')
//         .pipe(less())
//         .pipe(gulp.dest('./assets/css'));
// });

// Default Task
gulp.task('default', ['less']);
