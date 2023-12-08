import gulp from 'gulp';
import pug from 'gulp-pug';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webpCss from 'gulp-webp-css-fixed';
import autoprefixer from 'gulp-autoprefixer';
import groupMediaQueries from 'gulp-group-css-media-queries';
import webpack from 'webpack-stream';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webpHtml from 'gulp-webp-html-nosvg';
import newer from 'gulp-newer';
import gulpif from 'gulp-if';
import injectdata from 'gulp-data';
import font2woff2 from 'gulp-ttf2woff2';
import del from 'del';
import browsersync from 'browser-sync';
import ftp from 'vinyl-ftp';
import named from 'vinyl-named';
import csvtojson from 'csvtojson';
// import fs from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import _ from 'lodash/lodash.min.js';
import webpackConfig from './webpack.config.js';
import siteConfig from './siteConfig.js';

const { buildRelease, paths, compressed, ftpConfig } = siteConfig;
const { src, dest, series, parallel, watch, lastRun } = gulp;
const sass = gulpSass(dartSass);

export const getContent = async () => {
	const langsArr = (await readdir(paths.root.src + paths.content.src)).map(file => path.parse(file).name),
		rawJsonArr = [],
		constantsArr = [],
		contentArr = [];
	for (const lang of langsArr) rawJsonArr.push(await csvtojson().fromFile(`${paths.root.src}${paths.content.src}/${lang}.csv`));
	_(rawJsonArr)
		.flattenDeep()
		.filter('constant')
		.groupBy('constant')
		.forOwn((content, constant) => {
			for (const lang of langsArr) constantsArr.push(`${constant}.${lang}`);
			for (const lang of content) contentArr.push(lang.content);
		});
	return _.zipObjectDeep(constantsArr, contentArr);
};

export const markup = () => {
	return src(paths.root.src + paths.markup.src)
		.pipe(injectdata(() => getContent()))
		.pipe(pug(gulpif(compressed.html, { doctype: 'html', self: true }, { pretty: '	', doctype: 'html', self: true })))
		.pipe(webpHtml())
		.pipe(dest(paths.root.dest + paths.markup.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
};

export const styles = () => {
	return src(paths.root.src + paths.styles.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(compressed.css, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(webpCss())
		.pipe(gulpif(buildRelease, autoprefixer({ grid: true, cascade: false })))
		.pipe(gulpif(buildRelease, groupMediaQueries()))
		.pipe(dest(paths.root.dest + paths.styles.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
};

export const scripts = () => {
	return src(paths.root.src + paths.scripts.src)
		.pipe(named())
		.pipe(webpack(webpackConfig))
		.pipe(dest(paths.root.dest + paths.scripts.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
};

export const media = () => {
	return src(paths.root.src + paths.media.src + '.{jpg,jpeg,png,gif}')
		.pipe(newer(paths.root.dest + paths.media.dest))
		.pipe(webp())
		.pipe(dest(paths.root.dest + paths.media.dest))
		.pipe(src(paths.root.src + paths.media.src))
		.pipe(newer(paths.root.dest + paths.media.dest))
		.pipe(gulpif(buildRelease, imagemin({ silent: false })))
		.pipe(dest(paths.root.dest + paths.media.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()));
};

export const fonts = () => {
	return src(paths.root.src + paths.fonts.src)
		.pipe(gulpif(font => font.extname !== '.woff', font2woff2({ ignoreExt: true, clone: true })))
		.pipe(dest(paths.root.dest + paths.fonts.dest));
};

export const resources = () => {
	return src(paths.root.src + paths.resources.src, { dot: true }).pipe(dest(paths.root.dest + paths.resources.dest));
};

export const clean = () => {
	return del(paths.root.dest + '/**/*');
};

export const nmclean = () => {
	return del(['node_modules', 'build', 'package-lock.json']);
};

export const deploy = () => {
	return src(paths.ftp.src, { dot: true }).pipe(ftp.create(ftpConfig).dest(paths.ftp.dest));
};

export const server = () => {
	browsersync.init({
		server: paths.root.dest,
		port: 88,
		open: false,
		notify: false,
	});
};

export const watcher = () => {
	watch(paths.root.src + paths.markup.watch, markup);
	watch(paths.root.src + paths.styles.watch, styles);
	watch(paths.root.src + paths.scripts.watch, scripts);
	watch(paths.root.src + paths.media.watch, media);
};

export const release = series(clean, parallel(markup, styles, scripts, fonts, media, resources));
export default series(clean, parallel(markup, styles, scripts, fonts, media, resources), parallel(watcher, server));
