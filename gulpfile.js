import gulp from 'gulp';
const { src, dest, series, parallel, watch, task } = gulp;
import pug from 'gulp-pug';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import imagemin from 'gulp-imagemin';
import gulpif from 'gulp-if';
import del from 'del';
import path from 'path';
import siteConfig from './siteConfig.js';
// const { src, dest, series, parallel, watch } = require('gulp');
// const pug = require('gulp-pug');
// const sass = require('gulp-sass')(require('sass'));
// const imagemin = require('gulp-imagemin');
// const gulpif = require('gulp-if');
// const del = require('del');
// const path = require('path');

// const siteConfig = require('./siteConfig');
const buildRelease = process.title === 'gulp release';


function markup() {
	return src(siteConfig.paths.root.src + siteConfig.paths.markup.src)
		.pipe(pug({ pretty: '	', doctype: 'html', self: true }))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.markup.dest));
}

function styles() {
	return src(siteConfig.paths.root.src + siteConfig.paths.styles.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(siteConfig.css.compressed, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.styles.dest, gulpif(buildRelease, {}, { sourcemaps: true })));
}

function scripts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.scripts.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.scripts.dest, gulpif(buildRelease, {}, { sourcemaps: true })));
}

function images() {
	return src(siteConfig.paths.root.src + siteConfig.paths.images.src)
		.pipe(gulpif(buildRelease, imagemin({ optimizationLevel: 6, progressive: true, silent: true })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.images.dest));
}

function fonts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.fonts.src)
	.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.fonts.dest));
}

function clean() {
	return del([siteConfig.paths.root.dest + '/**/*']);
}

function watcher() {
	watch(siteConfig.paths.root.src + '/markup', markup);
	watch(siteConfig.paths.root.src + siteConfig.paths.styles.src, styles);
	watch(siteConfig.paths.root.src + siteConfig.paths.scripts.src, scripts);
	watch(siteConfig.paths.root.src + siteConfig.paths.images.src, images);
	watch(siteConfig.paths.root.src + siteConfig.paths.fonts.src, fonts);
}

function nmclean() {
	return del(['node_modules', 'build', 'package-lock.json']);
}

task('clean', clean);
task('nmclean', nmclean);
task('release', series(clean, parallel(styles, scripts, fonts, images), markup));
task('default', series(clean, parallel(styles, scripts, fonts, images), markup, watcher));
// exports.markup = markup;
// exports.styles = styles;
// exports.scripts = scripts;
// exports.images = images;
// exports.fonts = fonts;
// exports.clean = clean;
// exports.watcher = watcher;
// exports.nmclean = nmclean;
// exports.release = series(clean, parallel(styles, scripts, fonts, images), markup, watcher);
// exports.default = series(clean, parallel(styles, scripts, fonts, images), markup, watcher);