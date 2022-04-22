import siteConfig from './siteConfig.js'


export default {
	mode: siteConfig.buildRelease ? 'production' : 'development',
	output: {
        filename: 'main.js',
    },
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules/',
			}
		]
	},
	devtool: siteConfig.buildRelease ? undefined : 'eval-source-map',
}