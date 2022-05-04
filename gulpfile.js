import gulp from 'gulp'
import pug from 'gulp-pug'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import webpCss from 'gulp-webp-css-fixed'
import autoprefixer from 'gulp-autoprefixer'
import groupMediaQueries from 'gulp-group-css-media-queries'
import webpack from 'webpack-stream'
import imagemin from 'gulp-imagemin'
import webp from 'gulp-webp'
import webpHtml from 'gulp-webp-html-nosvg'
import newer from 'gulp-newer'
import gulpif from 'gulp-if'
import injectdata from 'gulp-data'
import csvtojson from 'gulp-csvtojson'
import del from 'del'
import browsersync from 'browser-sync'
import through2 from 'through2'
import vinyl from 'vinyl'
import named from 'vinyl-named'
import fs from 'fs'
import webpackConfig from './webpack.config.js'
import siteConfig from './siteConfig.js'

const { src, dest, series, parallel, watch, lastRun } = gulp
const through = through2.obj
const sass = gulpSass(dartSass)

export const markup = () => {
	// return src(siteConfig.paths.root.src + siteConfig.paths.markup.src, { since: lastRun(markup) })
	return src(siteConfig.paths.root.src + siteConfig.paths.markup.src)
		// .pipe(injectdata(() => JSON.parse(fs.readFileSync(siteConfig.paths.root.src + '/content/en.json'))))
		.pipe(pug(gulpif(siteConfig.compressed.html, { doctype: 'html', self: true }, { pretty: '	', doctype: 'html', self: true })))
		.pipe(webpHtml())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.markup.dest))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()))
}

export const content = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.content.src)
		.pipe(csvtojson())
		// .pipe(csvtojson({ toArrayString: true }))
		// .pipe(through((file, enc, cb) => {
		// 	cb(null, file)
		// }))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.content.dest))
}

export const styles = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.styles.src, gulpif(siteConfig.buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(siteConfig.compressed.css, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(webpCss())
		.pipe(gulpif(siteConfig.buildRelease, autoprefixer({ grid: true, cascade: false })))
		.pipe(gulpif(siteConfig.buildRelease, groupMediaQueries()))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.styles.dest, gulpif(siteConfig.buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()))
}

export const scripts = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.scripts.src)
		.pipe(named())
		.pipe(webpack(webpackConfig))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.scripts.dest))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()))
}

export const media = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.media.src + '.{jpg,jpeg,png,gif}')
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(webp())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(src(siteConfig.paths.root.src + siteConfig.paths.media.src))
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(gulpif(siteConfig.buildRelease, imagemin({ silent: false })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(gulpif(!siteConfig.buildRelease, browsersync.stream()))
}

export const fonts = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.fonts.src)
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.fonts.dest))
}

export const resources = () => {
	return src(siteConfig.paths.root.src + siteConfig.paths.resources.src)
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.resources.dest))
}

export const clean = () => {
	return del(siteConfig.paths.root.dest + '/**/*')
}

export const nmclean = () => {
	return del(['node_modules', 'build', 'package-lock.json'])
}

export const server = () => {
	browsersync.init({
		notify: false,
		proxy: 'http://webdev:88/',
	})
}

export const watcher = () => {
	watch(siteConfig.paths.root.src + siteConfig.paths.markup.watch, markup)
	// watch(siteConfig.paths.root.src + siteConfig.paths.content.watch, markup)
	watch(siteConfig.paths.root.src + siteConfig.paths.styles.watch, styles)
	watch(siteConfig.paths.root.src + siteConfig.paths.scripts.watch, scripts)
	watch(siteConfig.paths.root.src + siteConfig.paths.media.watch, media)
	// watch(siteConfig.paths.root.src + siteConfig.paths.fonts.watch, fonts)
}


export const release = series(clean, parallel(markup, styles, scripts, fonts, media, resources))
// export default series(clean, parallel(markup, styles, scripts, fonts, media, resources), parallel(watcher, server))
export default series(clean, content, parallel(markup, styles, scripts, fonts, media, resources), parallel(watcher, server))