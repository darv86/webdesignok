// @ts-nocheck
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
import font2woff2 from 'gulp-ttf2woff2';
import realFavicon from 'gulp-real-favicon';
import del from 'del';
import browsersync from 'browser-sync';
import ftpConnection from 'vinyl-ftp';
import named from 'vinyl-named';
import csvtojson from 'csvtojson';
import { readdir, unlink } from 'node:fs/promises';
// import { Transform } from 'node:stream';
import path from 'node:path';
import _ from 'lodash/lodash.min.js';
import webpackConfig from './webpack.config.js';
import siteConfig from './siteConfig.js';

const { isRelease, paths, isCompressing, colors, ftp } = siteConfig;
const { src, dest, series, parallel, watch, lastRun } = gulp;
const sass = gulpSass(dartSass);

let content;
export const getContent = async () => {
	const langsArr = (await readdir(paths.root.src + paths.content.src)).map(file => path.parse(file).name),
		[rawJsonArr, constantsArr, contentArr] = [[], [], []];
	for (const lang of langsArr) rawJsonArr.push(await csvtojson().fromFile(`${paths.root.src}${paths.content.src}/${lang}.csv`));
	_(rawJsonArr)
		.flattenDeep()
		.filter('constant')
		.groupBy('constant')
		.forOwn((content, constant) => {
			for (const lang of langsArr) constantsArr.push(`${constant}.${lang}`);
			for (const lang of content) contentArr.push(lang.content);
		});
	content = _.zipObjectDeep(constantsArr, contentArr);
	return content;
};

export const markup = () => {
	return src(paths.root.src + paths.markup.src)
		.pipe(pug({ pretty: isCompressing.html ? false : '	', data: { ...content, colors }, doctype: 'html', self: true }))
		.pipe(webpHtml())
		.pipe(dest(paths.root.dest + paths.markup.dest))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const styles = () => {
	return src(paths.root.src + paths.styles.src, isRelease ? {} : { sourcemaps: true })
		.pipe(sass(isCompressing.css && { outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(webpCss())
		.pipe(gulpif(isRelease, autoprefixer({ grid: true, cascade: false })))
		.pipe(gulpif(isRelease, groupMediaQueries()))
		.pipe(dest(paths.root.dest + paths.styles.dest, isRelease ? {} : { sourcemaps: true }))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const scripts = () => {
	return src(paths.root.src + paths.scripts.src)
		.pipe(named())
		.pipe(webpack(webpackConfig))
		.pipe(dest(paths.root.dest + paths.scripts.dest))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const media = () => {
	return src(paths.root.src + paths.media.src)
		.pipe(newer(paths.root.dest + paths.media.dest))
		.pipe(webp())
		.pipe(dest(paths.root.dest + paths.media.dest))
		.pipe(src(paths.root.src + paths.media.src))
		.pipe(newer(paths.root.dest + paths.media.dest))
		.pipe(gulpif(isRelease, imagemin()))
		.pipe(dest(paths.root.dest + paths.media.dest))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const fonts = () => {
	return src(paths.root.src + paths.fonts.src)
		.pipe(gulpif(font => font.extname !== '.woff', font2woff2({ ignoreExt: true, clone: true })))
		.pipe(dest(paths.root.dest + paths.fonts.dest));
};

export const resources = () => {
	return src(paths.root.src + paths.resources.src, { dot: true })
		.pipe(gulpif(isRelease, imagemin()))
		.pipe(dest(paths.root.dest + paths.resources.dest));
};

export const favicon = cb => {
	const markupFile = 'faviconData.json';
	realFavicon.generateFavicon(
		{
			masterPicture: paths.root.src + paths.favicon.src,
			dest: paths.root.dest + paths.favicon.dest,
			iconsPath: '/',
			design: {
				ios: {
					pictureAspect: 'noChange',
					assets: {
						ios6AndPriorIcons: false,
						ios7AndLaterIcons: false,
						precomposedIcons: false,
						declareOnlyDefaultIcon: true,
					},
				},
				desktopBrowser: {
					design: 'raw',
				},
				windows: {
					pictureAspect: 'noChange',
					backgroundColor: colors.main,
					onConflict: 'override',
					assets: {
						windows80Ie10Tile: false,
						windows10Ie11EdgeTiles: {
							small: true,
							medium: true,
							big: true,
							rectangle: true,
						},
					},
				},
				androidChrome: {
					pictureAspect: 'noChange',
					themeColor: colors.main,
					manifest: {
						display: 'standalone',
						orientation: 'notSet',
						onConflict: 'override',
						declared: true,
					},
					assets: {
						legacyIcon: false,
						lowResolutionIcons: false,
					},
				},
				safariPinnedTab: {
					pictureAspect: 'blackAndWhite',
					threshold: 75,
					themeColor: colors.second,
				},
			},
			settings: {
				scalingAlgorithm: 'Mitchell',
				errorOnImageTooSmall: false,
				readmeFile: false,
				htmlCodeFile: false,
				usePathAsIs: false,
			},
			markupFile,
		},
		async () => {
			await unlink(markupFile);
			cb();
		}
	);
};

export const clean = () => {
	return del(paths.root.dest + '/**/*', { dot: true });
};

export const nmclean = () => {
	return del(['node_modules', 'build', 'package-lock.json'], { dot: true });
};

export const deploy = () => {
	return src(paths.ftp.src, { dot: true }).pipe(ftpConnection.create(ftp.config).dest(paths.ftp.dest));
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

export const release = series(
	clean,
	getContent,
	parallel(markup, styles, scripts, fonts, media, resources, favicon),
	gulpif(ftp.onRelease, deploy, async () => {})
);

export default series(clean, getContent, parallel(markup, styles, scripts, fonts, media, resources, favicon), parallel(watcher, server));
