import siteConfig from './siteConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	context: path.resolve(__dirname, 'src/scripts'),
	// entry: './src/scripts/index.js',
	output: {
		filename: '[name].js',
	},
	mode: siteConfig.isRelease ? 'production' : 'development',
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules/',
			},
		],
	},
	devtool: siteConfig.isRelease ? undefined : 'eval-source-map',
};
