import gulp from 'gulp';
import pug from 'gulp-pug';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import imagemin from 'gulp-imagemin';
import gulpif from 'gulp-if';
import autoprefixer from 'gulp-autoprefixer';
import del from 'del';
import browsersync from 'browser-sync';
import siteConfig from './siteConfig.js';

const { src, dest, series, parallel, watch, task, lastRun } = gulp;
const sass = gulpSass(dartSass);
const buildRelease = process.title === 'gulp release';


function markup() {
	return src(siteConfig.paths.root.src + siteConfig.paths.markup.src, { since: lastRun(markup) })
		.pipe(pug(gulpif(siteConfig.html.compressed, { doctype: 'html', self: true }, { pretty: '	', doctype: 'html', self: true })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.markup.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
}

function styles() {
	return src(siteConfig.paths.root.src + siteConfig.paths.styles.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(siteConfig.css.compressed, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(gulpif(buildRelease, autoprefixer({ grid: true, overrideBrowserslist: ['> .5%'], cascade: false })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.styles.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
}

function scripts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.scripts.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.scripts.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
}

function images() {
	return src(siteConfig.paths.root.src + siteConfig.paths.images.src)
		.pipe(gulpif(buildRelease, imagemin({ optimizationLevel: 5, progressive: true, silent: true })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.images.dest));
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
	watch(siteConfig.paths.root.src + '/markup', markup);
	watch(siteConfig.paths.root.src + siteConfig.paths.styles.src, styles);
	watch(siteConfig.paths.root.src + siteConfig.paths.scripts.src, scripts);
	watch(siteConfig.paths.root.src + siteConfig.paths.images.src, images);
	watch(siteConfig.paths.root.src + siteConfig.paths.fonts.src, fonts);
}


task('clean', clean);
task('nmclean', nmclean);
task('release', series(clean, parallel(markup, styles, scripts, fonts, images)));
task('default', series(clean, parallel(markup, styles, scripts, fonts, images), parallel(watcher, server)));