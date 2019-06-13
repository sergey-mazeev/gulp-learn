var gulp = require('gulp');
var {series, parallel, dest, watch, src} = require('gulp');
var browserSync = require('browser-sync').create();
var pug = require('gulp-pug');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var imgMin = require('gulp-image');
sass.compiler = require('node-sass');


function server(cb) {
    browserSync.init({
        server: {
            baseDir: "./built"
        },
        watch: true,
    });
    cb();
}

function pugBlocks(cb) {
    src('src/blocks/**/*.pug')
        .pipe(concat('blocks.pug'))
        .pipe(dest('src/pug/layout/'));
    cb();
}

function pugTemplate(cb) {
    src('src/pug/*.pug')
        .pipe(plumber())
        .pipe(pug())
        .pipe(plumber.stop())
        .pipe(dest('./built'));
    cb();
}

function scssBlocks(cb) {
    src('src/blocks/**/*.scss')
        .pipe(concat('_blocks.scss'))
        .pipe(dest('src/scss/helpers/'));
    cb();
}

function scss(cb) {
    src('src/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'})
            .on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(dest('built/css/'));
    cb();
}

function jsMove(cb) {
    src('src/js/*js')
        .pipe(dest('built/js'));
    cb();
}

var imgMinOptions = {
    optimizationLevel: 5,
    pngquant: true,
    optipng: true,
    zopfling: false,
    jpegRecompress: true,
    jpegoptim: true,
    mozjpeg: true,
    gifsicle: true,
    svgo: true,
    concurrent: 5
};

function img(cb) {
    src('src/img/**/*.{jpg,png,svg,gif}')
        .pipe(imgMin(imgMinOptions))
        .pipe(dest('built/img/'));
    cb();
}

function watchFiles() {
    watch('src/blocks/**/*.pug', pugBlocks);
    watch('src/pug/**/*.pug', pugTemplate);
    watch('src/blocks/**/*.scss', scssBlocks);
    watch('src/scss/**/*.scss', scss);
    watch('src/js/*.js', jsMove);
    watch('src/img/**/*.{jpg,png,svg,gif}', img);
}

var buidPug = series(pugBlocks, pugTemplate);
var buildScss = series(scssBlocks, scss);

exports.default =
    series(
        parallel(
            series(pugBlocks, pugTemplate),
            series(scssBlocks, scss)),
        parallel(server, watchFiles));
exports.test = series(
    parallel(buidPug, buildScss, jsMove, img),
    parallel(server, watchFiles));
