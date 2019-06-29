const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 编译后的文件目录
const DIST_PATH = path.resolve(__dirname, 'dist');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        // filename: '[name].[chunkhash].js',
        path: DIST_PATH,
        publicPath: ''
    },
    module: {
        rules: [
            {test: /\.html$/, loader: 'html-loader', exclude: /node_modules/},
            {test: /\.htm$/, loader: 'string-loader',include:  [path.resolve(__dirname,'src/template')], exclude: /node_modules/},
            {test: '/\.js$/', loader: 'babel-loader', exclude: [/node_modules/, path.resolve(__dirname, 'src/js/config/paths.js')]},
            {test: /\.less$/, use: ['style-loader',MiniCssExtractPlugin.loader, {loader: 'css-loader', options: {importLoaders: 1}}, 'less-loader']},
            {test: /\.css$/, use: ['style-loader',MiniCssExtractPlugin.loader, {loader: 'css-loader', options: {importLoaders: 1}}]},
            {test: /\.(png|jpg|jpeg|gif|svg)$/, loaders: ['url-loader?limit=1&name=assets/[name]-[hash:5].[ext]', 'image-webpack-loader'] },
            {test: /\.(woff|svg|eot|ttf|otf)\??.*$/, loaders: ['url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]'] }
        ]
    },
    plugins: [
        // 删除dist等编译后的文件夹
        new CleanWebpackPlugin([DIST_PATH]),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),

        new HtmlWebPackPlugin({
            title: '测试平台',
            favicon: './favicon.gif'
        }),

        new MiniCssExtractPlugin({
            filename: '[name]-[contenthash].css'
        }),

        // 拷贝静态资源目录
        new CopyWebpackPlugin([{
            from: 'src/static',
            to: 'static'
        }])
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, '/src'),
            path.resolve(__dirname, 'node_modules/')
        ],
        alias: {
            '@lib': path.resolve(__dirname, './src/lib'),
            '@js': path.resolve(__dirname, './src/js'),
            '@components': path.resolve(__dirname, './src/js/components'),
            '@template': path.resolve(__dirname, './src/template'),
            '@json': path.resolve(__dirname, './src/static/dummy_data')
        },
        extensions: ['.js']
    },
    node: {
        process: false,
        global: false,
        fs: 'empty'
    },

    optimization: {
        splitChunks: {
            chunks: 'async',  //异步模块
            minSize: 30000, //超过30000才打包
            minChunks: 1, //最小引入次数1
            maxAsyncRequests: 5, //一次异步加载的最大模块请求数
            maxInitialRequests: 3, //入口文件最大的模块请求数
            automaticNameDelimiter: '~', //默认的文件名分隔符
            name: true, //根据chunk名或cacheGroups里的key生成文件名
            //默认值+++
            cacheGroups: { //一个对象，对象里的每一个key-value都对应一个公共块。如第一个：
                commons: {  //将引用到的node_modules目录下的模块打包为一个文件
                    test: /[\\/]node_modules[\\/]/, //将引用到node_modules目录下的模块打包为一个文件
                    name: 'vendors', //输出的文件名
                    chunks: 'all' //可配置为initial:默认打包的chunk, async：异步加载的chunk,all：所有的chunk
                }
            }
        }
    }
};