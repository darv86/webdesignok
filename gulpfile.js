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
import named from 'vinyl-named';
import csvtojson from 'csvtojson';
// import fs from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';
import _ from 'lodash/lodash.min.js';
import webpackConfig from './webpack.config.js';
import siteConfig from './siteConfig.js';

const { src, dest, series, parallel, watch, lastRun } = gulp;
const sass = gulpSass(dartSass);

export const getContent = async () => {
	const langsArr = (await readdir(siteConfig.paths.root.src + siteConfig.paths.content.src)).map(file => path.parse(file).name),
		rawJsonArr = [],
		constantsArr = [],
		contentArr = [];
	for (const lang of langsArr) rawJsonArr.push(await csvtojson().fromFile(`${siteConfig.paths.root.src}${siteConfig.paths.content.src}/${lang}.csv`));
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
	return src(siteConfig.paths.root.src + siteConfig.paths.markup.src)
		.pipe(injectdata(() => getContent()))
		.pipe(pug(gulpif(siteConfig.compressed.html, { doctype: 'html', self: true }, { pretty: '	', doctype: 'html', self: true })))
		.pipe(webpHtml())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.markup.dest))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()));
};

export const styles = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.styles.src, gulpif(siteConfig.buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(siteConfig.compressed.css, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(webpCss())
		.pipe(gulpif(siteConfig.buildRelease, autoprefixer({ grid: true, cascade: false })))
		.pipe(gulpif(siteConfig.buildRelease, groupMediaQueries()))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.styles.dest, gulpif(siteConfig.buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()));
};

export const scripts = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.scripts.src)
		.pipe(named())
		.pipe(webpack(webpackConfig))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.scripts.dest))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()));
};

export const media = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.media.src + '.{jpg,jpeg,png,gif}')
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(webp())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(src(siteConfig.paths.root.src + siteConfig.paths.media.src))
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(gulpif(siteConfig.buildRelease, imagemin({ silent: false })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()));
};

export const fonts = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.fonts.src)
		.pipe(gulpif(font => font.extname !== '.woff', font2woff2({ ignoreExt: true, clone: true })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.fonts.dest));
};

export const resources = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.resources.src).pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.resources.dest));
};

export const clean = () => {
	return del(siteConfig.paths.root.dest + '/**/*');
};

export const nmclean = () => {
	return del(['node_modules', 'build', 'package-lock.json']);
};

export const server = () => {
	browsersync.init({
		server: siteConfig.paths.root.dest,
		port: 88,
		open: false,
		notify: false,
		// proxy: 'http://webdev:88',
	});
};

export const watcher = () => {
	watch(siteConfig.paths.root.src + siteConfig.paths.markup.watch, markup);
	watch(siteConfig.paths.root.src + siteConfig.paths.styles.watch, styles);
	watch(siteConfig.paths.root.src + siteConfig.paths.scripts.watch, scripts);
	watch(siteConfig.paths.root.src + siteConfig.paths.media.watch, media);
};

export const release = series(clean, parallel(markup, styles, scripts, fonts, media, resources));
export default series(clean, parallel(markup, styles, scripts, fonts, media, resources), parallel(watcher, server));
