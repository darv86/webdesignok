export default {
	"paths": {
		"root": {
			"src": "src",
			"dest": "build"
		},
		"markup": {
			"src": "/markup/pages/**/*.pug",
			"dest": ""
		},
		"styles": {
			"src": "/styles/**/*.scss",
			"dest": "/css"
		},
		"scripts": {
			"src": "/scripts/**/*.js",
			"dest": "/js"
		},
		"fonts": {
			"src": "/fonts/**/*",
			"dest": "/fonts"
		},
		"images": {
			"src": "/images/**/*",
			"dest": "/images"
		}
	},
	"html": {
		"compressed": false
	},
	"css": {
		"compressed": false
	}
}