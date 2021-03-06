/* eslint-env node */
//var pckg = require('./package.json');
var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var postcss = require('gulp-postcss');
var minifyInline = require('gulp-minify-inline');
var htmlmin = require('gulp-htmlmin');
var cache = require('gulp-cache');
var rename = require('gulp-rename');
var del = require('del');
var replace = require('gulp-replace');
var gulpUtil = require('gulp-util');
var date = new Date();
//var cdnPath = 'https://cdn.mariani.life/projects/minerva/';
var pckg = require('./package.json');
var build_timestamp = date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + '_' + new Date().getTime();

function pad(n) {
    return n < 10 ? '0' + n : n;
}
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// empty dist folder
gulp.task('clean:dist', function (done) {
    del.sync('dist');
    done();
});

// Copy other php files over to dist except for index.php
gulp.task('base', function (done) {
    gulp.src(['app/favicon.ico', 'app/browserconfig.xml', 'app/manifest.json', 'app/service-worker.js']).pipe(gulp.dest('dist'));
    done();
});
gulp.task('images', function () {
    return gulp.src('app/img/**/*').pipe(gulp.dest('dist/img'));
});
gulp.task('css-debug', function () {
    return gulp.src('app/css/*').pipe(gulp.dest('dist/css'));
});
gulp.task('fonts', function () {
    return gulp.src('app/font/*').pipe(gulp.dest('dist/font'));
});
gulp.task('js-1', function () {
    return gulp
        .src(['app/js/lib/ByteArray.js', 'app/js/lib/AMF0.js', 'app/js/lib/AMF3.js'])
        .pipe(uglify())
        .pipe(
            rename(function (path) {
                path.basename += `.${build_timestamp}`;
            })
        )
        .pipe(gulp.dest('dist/js/lib'));
});
gulp.task('js-2', function () {
    return (
        gulp
            .src(['app/js/parsers/SOLReaderWorker.js', 'app/js/parsers/SOLWriterWorker.js'])
            //.pipe(replace('../', `${cdnPath}js/`))
            .pipe(replace('.js', `.${build_timestamp}.js`))
            .pipe(uglify())
            .pipe(
                rename(function (path) {
                    path.basename += `.${build_timestamp}`;
                })
            )
            .pipe(gulp.dest('dist/js/parsers'))
    );
});
gulp.task('js-debug', function () {
    return gulp.src('app/js/*').pipe(gulp.dest('dist/js'));
});
gulp.task('js-1-debug', function () {
    return gulp.src('app/js/lib/*').pipe(gulp.dest('dist/js/lib'));
});
gulp.task('js-2-debug', function () {
    return gulp.src('app/js/parsers/*').pipe(gulp.dest('dist/js/parsers'));
});
gulp.task('js-3-debug', function () {
    return gulp.src('app/js/vendor/*').pipe(gulp.dest('dist/js/vendor'));
});
gulp.task('js-4-debug', function () {
    return gulp.src('app/js/view/*').pipe(gulp.dest('dist/js/view'));
});

// Concat/minify CSS and JS, copy to dist
gulp.task('useref', function (done) {
    gulp.src('app/index.html')
        .pipe(useref({}))
        .pipe(gulpIf('*.js', uglify().on('error', gulpUtil.log)))
        .pipe(gulpIf('*.css', postcss()))
        .pipe(gulp.dest('dist'));
    done();
});
gulp.task('useref_debug', function () {
    return gulp.src('app/index.html').pipe(gulp.dest('dist'));
});

gulp.task('fix-index', function (done) {
    gulp.src(['dist/index.html'])
        /* Update variables for build */
        .pipe(replace('%VERSION%', pckg.version))
        .pipe(replace('%YEAR%', date.getFullYear())) // yyyy
        .pipe(replace('%BUILT%', date.getDate() + '-' + monthNames[date.getMonth()] + '-' + date.getFullYear())) // d-MMMM-yyyy
        .pipe(replace('%BUILD%', build_timestamp)) // yyyyMMdd_milliseconds
        .pipe(replace('bundle.js', `bundle.${build_timestamp}.js`))
        .pipe(replace('bundle.css', `bundle.${build_timestamp}.css`))
        /* Update CDN URLs */
        //.pipe(replace('content="img/', `content="${cdnPath}img/`))
        //.pipe(replace('content="browserconfig', `content="${cdnPath}browserconfig`))
        //.pipe(replace('href="img/', `href="${cdnPath}img/`))
        //.pipe(replace('src="img/', `src="${cdnPath}img/`))
        //.pipe(replace('href="css/', `href="${cdnPath}css/`))
        //.pipe(replace('href="manifest', `href="${cdnPath}manifest`))
        //.pipe(replace('href="favicon', `href="${cdnPath}favicon`))
        //.pipe(replace('script src="', `script src="${cdnPath}`))
        //.pipe(replace('url(img/', `url(${cdnPath}img/`))
        /* Minify inline css/js */
        .pipe(minifyInline())
        /* Minify HTML */
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist'));
    done();
});

gulp.task('fix-index-debug', function (done) {
    gulp.src(['dist/index.html'])
        /* Update variables for build */
        .pipe(replace('%VERSION%', pckg.version))
        .pipe(replace('%YEAR%', date.getFullYear())) // yyyy
        .pipe(replace('%BUILT%', date.getDate() + '-' + monthNames[date.getMonth()] + '-' + date.getFullYear())) // d-MMMM-yyyy
        .pipe(replace('%BUILD%', build_timestamp)) // yyyyMMdd_milliseconds
        .pipe(gulp.dest('dist'));
    done();
});

gulp.task('fix-worker', function (done) {
    gulp.src(['dist/service-worker.js'])
        .pipe(replace('%VERSION%', pckg.version))
        .pipe(replace('%BUILD%', date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()))) // yyyyMMdd
        .pipe(replace('.css', `.${build_timestamp}.css`))
        .pipe(replace('.js', `.${build_timestamp}.js`))
        .pipe(
            rename(function (path) {
                path.basename += `.${build_timestamp}`;
            })
        )
        .pipe(gulp.dest('dist'));
    del(['dist/service-worker.js']);
    done();
});

gulp.task('fix-js', function (done) {
    gulp.src(['dist/js/bundle.js'])
        //.pipe(replace('register("service-worker.js"', `register("${cdnPath}service-worker.${build_timestamp}.js`))
        .pipe(replace('orker.js"', `orker.${build_timestamp}.js"`))
        .pipe(
            rename(function (path) {
                path.basename += `.${build_timestamp}`;
            })
        )
        .pipe(gulp.dest('dist/js'));
    del(['dist/js/bundle.js']);
    done();
});
gulp.task('fix-css', function (done) {
    gulp.src(['dist/css/bundle.css'])
        //.pipe(replace('url(img/', `url(${cdnPath}img/`))
        //.pipe(replace('url(../', `url(${cdnPath}`))
        .pipe(
            rename(function (path) {
                path.basename += `.${build_timestamp}`;
            })
        )
        .pipe(gulp.dest('dist/css'));
    del(['dist/css/bundle.css']);
    done();
});

// Run above tasks in sequence
gulp.task('build', gulp.series('clean:dist', gulp.series('base', 'useref'), gulp.series('images', 'fonts', 'js-1', 'js-2', 'fix-index', 'fix-worker', 'fix-js', 'fix-css')));

// Copy app to a folder and convert it so it runs safely on localhost
gulp.task('copy_index', function () {
    return gulp.src('app/index.html').pipe(rename('local.html')).pipe(gulp.dest('app'));
});
gulp.task('fix-index_local', function (done) {
    gulp.src(['app/local.html'])
        .pipe(replace('<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>', ''))
        .pipe(replace('%YEAR%', date.getFullYear())) // yyyy
        .pipe(replace('%BUILT%', date.getDate() + '-' + monthNames[date.getMonth()] + '-' + date.getFullYear())) // d-MMMM-yyyy
        .pipe(replace('%BUILD%', date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()))) // yyyyMMdd
        .pipe(gulp.dest('app'));
    done();
});

gulp.task(
    'dev',
    gulp.series('clean:dist', gulp.series('base', 'useref_debug'), gulp.series('css-debug', 'js-debug', 'js-1-debug', 'js-2-debug', 'js-3-debug', 'js-4-debug', 'fix-index-debug', 'fix-worker'))
);

// Empty cached images from gulp-cache
gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback);
});
