const config = require('./webpack.base.config.js');
const webpack = require('webpack');

// webpack-dev-server配置
config.devServer = {
    // 服务端口
    port: 8808,
    // 运行webpack-dev-server时是否自动打开默认的浏览器
    open: false
};

config.plugins.push(new webpack.DefinePlugin({
    PRODUCTION: false
}));

module.exports = config;