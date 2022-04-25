export default {
	buildRelease: process.title === 'gulp release',
	paths: {
		root: {
			src: 'src',
			dest: 'build',
		},
		markup: {
			src: '/markup/pages/**/*.pug',
			dest: '',
			watch: '/markup',
		},
		styles: {
			src: '/styles/**/*.{scss,sass}',
			dest: '/css',
			watch: '/styles/**/*.{scss,sass}',
		},
		scripts: {
			src: '/scripts/*.js',
			dest: '/js',
			watch: '/scripts/**/*.js',
		},
		fonts: {
			src: '/fonts/**/*',
			dest: '/fonts',
			watch: '/fonts/**/*',
		},
		media: {
			// src: '/media/**/*.{jpg,jpeg,png,webp,ico,gif,svg}',
			src: '/media/**/*',
			dest: '/media',
			watch: '/media/**/*',
		},
		resources: {
			src: '/resources/**/*',
			dest: '',
			watch: '/resources/**/*',
		},
	},
	compressed: {
		html: false,
		css: false,
		js: false,
	},
}