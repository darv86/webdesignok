export default {
	isRelease: process.title === 'gulp release',
	paths: {
		root: {
			src: 'src',
			dest: 'build',
		},
		markup: {
			src: '/markup/pages/**/*.pug',
			dest: '',
			watch: '/markup/**/*.pug',
		},
		styles: {
			src: '/styles/**/*.{scss,sass}',
			dest: '/css',
			watch: '/styles/**/*.{scss,sass}',
		},
		scripts: {
			src: ['/scripts/*.js', '/scripts/pages/**/*.js'],
			dest: '/js',
			watch: '/scripts/**/*.js',
		},
		fonts: {
			src: '/fonts/**/*.{woff2,woff,ttf,otf,svg}',
			dest: '/fonts',
			watch: '/fonts/**',
		},
		content: {
			src: '/content',
			dest: '/content',
			watch: '/content/**/*.csv',
		},
		media: {
			// src: '/media/**/*.{jpg,jpeg,png,webp,ico,gif,svg}',
			src: ['/media/**', '/media/stock/**'], // stock ignored
			dest: '/media',
			watch: '/media/**',
		},
		resources: {
			src: '/resources/**',
			dest: '',
			watch: '/resources/**',
		},
		favicon: {
			src: '/resources/favicon.svg',
			dest: '',
			watch: null,
		},
		ftp: {
			src: 'build/**',
			dest: '/io.webdesignok.com',
			watch: null,
		},
	},
	colors: {
		main: '#6f2c91',
		second: '#f2695c',
	},
	isCompressing: {
		html: false,
		css: false,
		js: false,
	},
	ftp: {
		onRelease: true,
		config: {
			host: '',
			user: '',
			password: '',
			port: 21,
			parallel: 10,
			reload: true,
		},
	},
};
