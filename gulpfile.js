const {src, dest, series, parallel, watch} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const del = require('del');
const path = require('path');
const okConfig = require('./okConfig');

// const paths = {
//     styles: {
//         src: "src/styles/**/*.scss",
//         dest: "build/css"
//     },
//     scripts: {
//         src: "src/scripts/**/*.js",
//         dest: "build/js"
//     },
//     markup: {
//         src: "src/pug/pages/**/*.pug",
//         dest: "build"
//     }
// }

function styles() {
    return src(okConfig.paths.styles.src)
        .pipe(sourcemaps.init())
        // .pipe(sass().on('error', sass.logError))
        .pipe(sass(gulpif(okConfig.css.compressed, {outputStyle: 'compressed'})).on('error', sass.logError))
        .pipe(sourcemaps.write('./maps'))
        .pipe(dest(okConfig.paths.styles.dest))
}

function nmclean() {
    return del(['node_modules'])
}

function clean() {
    return del(['build/**/*'])
}

async function drname() {
    console.log(__dirname);
}

exports.styles = styles;
exports.nmclean = nmclean;
exports.clean = clean;
exports.default = series(drname);