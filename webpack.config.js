/** 生产环境的webpack配置 */
const config = require('./webpack.base.config.js');
const webpack = require('webpack');

config.plugins.push(new webpack.DefinePlugin({
    PRODUCTION: true
}));

module.exports = config;