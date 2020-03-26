'use strict';

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const path = require('path');

module.exports = {
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.node$/,
				use: 'node-loader'
			}
		]
	},
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.json'],
		plugins: [new TsconfigPathsPlugin({})]
	},
	devtool: 'source-map',
	plugins: []
};
