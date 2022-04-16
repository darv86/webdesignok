import gulp from 'gulp';
import pug from 'gulp-pug';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
// import webpCss from 'gulp-webp-css';
import webpCss from 'gulp-webp-css-fixed';
import autoprefixer from 'gulp-autoprefixer';
import groupMediaQueries from 'gulp-group-css-media-queries';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webpHtml from 'gulp-webp-html-nosvg';
import newer from 'gulp-newer';
import gulpif from 'gulp-if';
import del from 'del';
import browsersync from 'browser-sync';
import siteConfig from './siteConfig.js';

const { src, dest, series, parallel, watch, task, lastRun } = gulp;
const sass = gulpSass(dartSass);
const buildRelease = process.title === 'gulp release';


function markup() {
	return src(siteConfig.paths.root.src + siteConfig.paths.markup.src, { since: lastRun(markup) })
		.pipe(pug(gulpif(siteConfig.compressed.html, { doctype: 'html', self: true }, { pretty: '	', doctype: 'html', self: true })))
		.pipe(webpHtml())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.markup.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
}

function styles() {
	return src(siteConfig.paths.root.src + siteConfig.paths.styles.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(siteConfig.compressed.css, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(webpCss())
		.pipe(gulpif(buildRelease, autoprefixer({ grid: true, cascade: false })))
		.pipe(gulpif(buildRelease, groupMediaQueries()))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.styles.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
	}

function scripts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.scripts.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(gulpif(buildRelease, babel()))
		.pipe(gulpif(siteConfig.compressed.js, uglify({ toplevel: true })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.scripts.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
}

function images() {
	return src(siteConfig.paths.root.src + siteConfig.paths.images.src + '.{jpg,jpeg,png,gif}')
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.images.dest))
		.pipe(webp())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.images.dest))
		.pipe(src(siteConfig.paths.root.src + siteConfig.paths.images.src))
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.images.dest))
		.pipe(gulpif(buildRelease, imagemin({ silent: false })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.images.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
}

function fonts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.fonts.src)
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.fonts.dest));
}

function server() {
	browsersync.init({
		notify: false,
        proxy: 'http://webdev:88/',
    });
}

function clean() {
	return del(siteConfig.paths.root.dest + '/**/*');
}

function nmclean() {
	return del(['node_modules', 'build', 'package-lock.json']);
}

function watcher() {
	watch(siteConfig.paths.root.src + siteConfig.paths.markup.watch, markup);
	watch(siteConfig.paths.root.src + siteConfig.paths.styles.watch, styles);
	watch(siteConfig.paths.root.src + siteConfig.paths.scripts.watch, scripts);
	watch(siteConfig.paths.root.src + siteConfig.paths.images.watch, images);
	watch(siteConfig.paths.root.src + siteConfig.paths.fonts.watch, fonts);
}


task('clean', clean);
task('nmclean', nmclean);
task('release', series(clean, parallel(markup, styles, scripts, fonts, images)));
task('default', series(clean, parallel(markup, styles, scripts, fonts, images), parallel(watcher, server)));