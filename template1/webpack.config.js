require('coffee-script/register');

var path = require('path');
var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');
var entryHelper = require('./tool/entryHelper')

entries = entryHelper.getEntries(path.join(__dirname, './src/js/page'));

var config = module.exports = {
    staticPath: '/',
    env: 'dev',
    entry: entries,
    output: {
        path: path.join(__dirname, 'build/dev/assets/js/'),
        filename: '[name].all.js',
        chunkFilename: '[name].js'
    },

    module: {
        loaders: [{
            test: /\.coffee$/,
            loader: "coffee-loader"
        }]
    },

    resolve: {
        extensions: ['', '.coffee', '.js'],
        alias: {
            'vendor': path.join(__dirname, './src/js/vendor'),
        }
    },

    externals: {
        'jquery': 'jQuery'
    },
    
    devtool: "source-map",

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'commons',
        }),
        new StatsPlugin('stats.json', {
            chunkModules: true,
            source: false,
            chunks: false,
            modules: false
        }),
    ]
};