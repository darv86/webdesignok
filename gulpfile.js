// @ts-nocheck
import { pathToFileURL } from 'node:url';
import { rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import gulp from 'gulp';
import pug from 'gulp-pug';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webpCss from 'gulp-webp-css-fixed';
import groupMediaQueries from 'gulp-group-css-media-queries';
import webpack from 'webpack-stream';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webpHtml from 'gulp-webp-html-nosvg';
import gulpif from 'gulp-if';
import font2woff2 from 'gulp-ttf2woff2';
import realFavicon from 'gulp-real-favicon';
import browsersync from 'browser-sync';
import ftpConnection from 'vinyl-ftp';
import named from 'vinyl-named';
import csvtojson from 'csvtojson';
import _ from 'lodash/lodash.min.js';
import webpackConfig from './webpack.config.js';
import siteConfig from './siteConfig.js';
import { log } from 'node:console';

const { isRelease, paths, isCompressing, colors, ftp } = siteConfig;
const { src, dest, series, parallel, watch } = gulp;
const sass = gulpSass(dartSass);

const getContent = async () => {
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
	return _.zipObjectDeep(constantsArr, contentArr);
};

export const markup = async () => {
	return src(paths.root.src + paths.markup.src)
		.pipe(pug({ pretty: isCompressing.html ? false : '	', data: { ...(await getContent()), colors }, basedir: path.resolve('./'), doctype: 'html', self: true }))
		.on('error', err => console.error(err.message))
		.pipe(webpHtml())
		.pipe(dest(paths.root.dest + paths.markup.dest))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const styles = () => {
	return src(paths.root.src + paths.styles.src, isRelease ? {} : { sourcemaps: true })
		.pipe(
			sass({
				outputStyle: isCompressing.css ? 'compressed' : undefined,
				importers: [{ findFileUrl: url => (url.startsWith('/') ? pathToFileURL(path.resolve(url.slice(1))) : null) }],
				loadPaths: [path.resolve('node_modules')],
			}).on('error', sass.logError),
		)
		.pipe(webpCss())
		.pipe(gulpif(isRelease, groupMediaQueries()))
		.pipe(dest(paths.root.dest + paths.styles.dest, isRelease ? {} : { sourcemaps: true }))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const scripts = () => {
	return src([paths.root.src + paths.scripts.src[0], paths.root.src + paths.scripts.src[1]], { base: paths.root.src + '/scripts/' })
		.pipe(named(file => path.relative(file.base, file.path).slice(0, -3)))
		.pipe(webpack(webpackConfig))
		.pipe(dest(paths.root.dest + paths.scripts.dest))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const media = () => {
	return src([`${paths.root.src}${paths.media.src[0]}`, `!${paths.root.src}${paths.media.src[1]}`], { encoding: false })
		.pipe(gulpif(img => ['.jpg', '.jpeg', '.png', '.tiff', '.tif'].includes(img.extname.toLowerCase()), webp()))
		.pipe(gulpif(isRelease, imagemin()))
		.pipe(dest(paths.root.dest + paths.media.dest))
		.pipe(gulpif(!isRelease, browsersync.stream()));
};

export const fonts = () => {
	return src(paths.root.src + paths.fonts.src, { encoding: false })
		.pipe(gulpif(font => font.extname === '.ttf' || font.extname === '.otf', font2woff2({ ignoreExt: true, clone: true })))
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
			await rm(markupFile, { force: true });
			cb();
		},
	);
};

export const clean = async () => {
	await rm(paths.root.dest, { recursive: true, force: true });
};

export const nmclean = () => {
	// await deleteAsync(['node_modules', 'build', 'package-lock.json'], { force: true, dot: true });
	return Promise.all(['node_modules', 'build', 'package-lock.json'].map(async file => await rm(file, { recursive: true })));
};

export const deploy = () => {
	return src(paths.ftp.src, { dot: true }).pipe(ftpConnection.create(ftp.config).dest(paths.ftp.dest));
};

export const server = () => {
	browsersync.init({
		server: paths.root.dest,
		port: 8000,
		open: false,
		notify: false,
	});
};

export const watcher = () => {
	watch(paths.root.src + paths.markup.watch, markup);
	watch(paths.root.src + paths.styles.watch, styles);
	watch(paths.root.src + paths.scripts.watch, scripts);
};

export const release = series(
	clean,
	parallel(markup, styles, scripts, fonts, media, resources, favicon),
	gulpif(ftp.onRelease, deploy, async () => {}),
);

export default series(clean, parallel(markup, styles, scripts, fonts, media, resources), parallel(watcher, server));
