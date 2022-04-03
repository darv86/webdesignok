const { src, dest, series, parallel, watch } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
// const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const del = require('del');
const path = require('path');

const buildRelease = process.title === 'gulp release';
const okConfig = require('./okConfig');


function markup() {
    return src(okConfig.paths.root.src + okConfig.paths.markup.src)
        .pipe(pug({ pretty: true }))
        .pipe(dest(okConfig.paths.root.dest + okConfig.paths.markup.dest));
}

function styles() {
    return src(okConfig.paths.root.src + okConfig.paths.styles.src, gulpif(buildRelease, {}, { sourcemaps: true }))
        .pipe(sass(gulpif(okConfig.css.compressed, { outputStyle: 'compressed' })).on('error', sass.logError))
        .pipe(dest(okConfig.paths.root.dest + okConfig.paths.styles.dest, gulpif(buildRelease, {}, { sourcemaps: true })));
}

function scripts() {
    return src(okConfig.paths.root.src + okConfig.paths.scripts.src, gulpif(buildRelease, {}, { sourcemaps: true }))
        .pipe(dest(okConfig.paths.root.dest + okConfig.paths.scripts.dest, gulpif(buildRelease, {}, { sourcemaps: true })));
}

function clean() {
    return del([okConfig.paths.root.dest + '/**/*']);
}

function copyStatic() {
    return src(okConfig.paths.root.src + okConfig.paths.images.src)
        .pipe(dest(okConfig.paths.root.dest + okConfig.paths.images.dest));
}

function watcher() {
    watch(okConfig.paths.root.src + '/markup', markup);
    // watch(okConfig.paths.root.src + okConfig.paths.markup.src, markup);
    watch(okConfig.paths.root.src + okConfig.paths.styles.src, styles);
    // watch(okConfig.paths.styles.src, styles);
    // watch(okConfig.paths.styles.src, styles);
    // watch(okConfig.paths.styles.src, styles);
}

function nmclean() {
    return del(['node_modules']);
}

// async function drname() {
//     console.log(__dirname);
// }

exports.markup = markup;
exports.styles = styles;
exports.scripts = scripts;
exports.clean = clean;
exports.watcher = watcher;
exports.nmclean = nmclean;
exports.release = series(clean, parallel(styles, scripts, copyStatic), markup, watcher);
exports.default = series(clean, parallel(styles, scripts, copyStatic), markup, watcher);