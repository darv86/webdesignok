import gulp from 'gulp'
import pug from 'gulp-pug'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import webpCss from 'gulp-webp-css-fixed'
import autoprefixer from 'gulp-autoprefixer'
import groupMediaQueries from 'gulp-group-css-media-queries'
import babel from 'gulp-babel'
import imagemin from 'gulp-imagemin'
import webp from 'gulp-webp'
import webpHtml from 'gulp-webp-html-nosvg'
import newer from 'gulp-newer'
import gulpif from 'gulp-if'
import del from 'del'
import browsersync from 'browser-sync'
import through2 from 'through2'
import Vinyl from 'vinyl'
import siteConfig from './siteConfig.js'

const { src, dest, series, parallel, watch, lastRun } = gulp
const through = through2.obj
const sass = gulpSass(dartSass)
const buildRelease = process.title === 'gulp release'


export function markup() {
	const files = new Vinyl()
	return src(siteConfig.paths.root.src + siteConfig.paths.markup.src, { since: lastRun(markup) })
		// .pipe(through((chunk, enc, cb) => {
		// 	console.log(files.stem = '1')
		// 	cb(null, chunk)
		// }))
		.pipe(pug(gulpif(siteConfig.compressed.html, { doctype: 'html', self: true }, { pretty: '	', doctype: 'html', self: true })))
		.pipe(webpHtml())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.markup.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()))
}

export function styles() {
	return src(siteConfig.paths.root.src + siteConfig.paths.styles.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(sass(gulpif(siteConfig.compressed.css, { outputStyle: 'compressed' })).on('error', sass.logError))
		.pipe(webpCss())
		.pipe(gulpif(buildRelease, autoprefixer({ grid: true, cascade: false })))
		.pipe(gulpif(buildRelease, groupMediaQueries()))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.styles.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()))
	}

export function scripts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.scripts.src, gulpif(buildRelease, {}, { sourcemaps: true }))
		.pipe(gulpif(buildRelease, babel()))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.scripts.dest, gulpif(buildRelease, {}, { sourcemaps: true })))
		.pipe(gulpif(!buildRelease, browsersync.stream()))
}

export function media() {
	return src(siteConfig.paths.root.src + siteConfig.paths.media.src + '.{jpg,jpeg,png,gif}')
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(webp())
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(src(siteConfig.paths.root.src + siteConfig.paths.media.src))
		.pipe(newer(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(gulpif(buildRelease, imagemin({ silent: false })))
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.media.dest))
		.pipe(gulpif(!buildRelease, browsersync.stream()))
}

export function fonts() {
	return src(siteConfig.paths.root.src + siteConfig.paths.fonts.src)
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.fonts.dest))
}

export function resources() {
	return src(siteConfig.paths.root.src + siteConfig.paths.resources.src)
		.pipe(dest(siteConfig.paths.root.dest + siteConfig.paths.resources.dest))
}

export function clean() {
	return del(siteConfig.paths.root.dest + '/**/*')
}

export function nmclean() {
	return del(['node_modules', 'build', 'package-lock.json'])
}

export function server() {
	browsersync.init({
		notify: false,
		proxy: 'http://webdev:88/',
	})
}

export function watcher() {
	watch(siteConfig.paths.root.src + siteConfig.paths.markup.watch, markup)
	watch(siteConfig.paths.root.src + siteConfig.paths.styles.watch, styles)
	watch(siteConfig.paths.root.src + siteConfig.paths.scripts.watch, scripts)
	watch(siteConfig.paths.root.src + siteConfig.paths.media.watch, media)
	// watch(siteConfig.paths.root.src + siteConfig.paths.fonts.watch, fonts)
}


export const release = series(clean, parallel(markup, styles, scripts, fonts, media, resources))
export default series(clean, parallel(markup, styles, scripts, fonts, media, resources), parallel(watcher, server))