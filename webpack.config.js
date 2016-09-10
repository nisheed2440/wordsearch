var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    // configuration
    entry: {
        'app': './src/app.js',
        'vendor': ['jquery', 'crypto-js/aes', 'crypto-js/sha1', 'crypto-js/enc-utf8', './src/scripts/utils.js']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: "/build/",
        filename: "bundle.[name].js"
    },
    module: {
        loaders: [{
            test: /\.(css|scss)$/,
            loader: ExtractTextPlugin.extract('style', 'css!sass'),
            include: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'node_modules/normalize.css')
            ]
        }, {
            test: /.jsx?$/,
            loader: 'babel-loader',
            include: [path.resolve(__dirname, 'src')],
            query: {
                presets: ['es2015', 'react']
            }
        }, {
            test: /.(png|jpg|gif)$/,
            loader: 'url-loader',
            include: [path.resolve(__dirname, 'src')],
            query: {
                limit: 1000
            }
        }]
    },
    plugins: [
        new ExtractTextPlugin("bundle.css"),
        new webpack.optimize.CommonsChunkPlugin( /* chunkName= */ "vendor", /* filename= */ "bundle.vendor.js")
    ]
};