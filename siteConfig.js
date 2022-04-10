export default {
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
			src: '/scripts/**/*.js',
			dest: '/js',
			watch: '/scripts/**/*.js',
		},
		fonts: {
			src: '/fonts/**/*',
			dest: '/fonts',
			watch: '/fonts/**/*',
		},
		images: {
			// src: '/images/**/*.{jpg,jpeg,png,webp,ico,gif,svg}',
			src: '/images/**/*',
			dest: '/images',
			watch: '/images/**/*',
		},
	},
	compressed: {
		html: false,
		css: false,
		js: false,
	},
}