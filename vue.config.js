const compressionWebpackPlugin = require('compression-webpack-plugin'); //引入插件
const webpack = require('webpack');
const productionGZipExtensions = ['js', 'css']; //压缩的文件类型
process.env.VUE_APP_VERSION = require('./package.json').version
module.exports = {
    runtimeCompiler: true,
    transpileDependencies: [
        'vuetify'
    ],

    publicPath: '/vuetify',
    devServer: {
        host: "0.0.0.0",
        port: 8080, // 端口号
        https: false, // https:{type:Boolean}
        open: false, //配置自动启动浏览器
        // 配置多个代理
        proxy:
            {
                "/api/api": {
                    // target: "http://106.54.11.162:8083", // 要访问的接口域名
                    // target: "http://222.184.233.10:8089", // 要访问的接口域名
                    target: "http://127.0.0.1:8089", // 要访问的接口域名
                    ws: true, // 是否启用websockets
                    changeOrigin: true, //开启代理：在本地会创建一个虚拟服务端，然后发送请求的数据，并同时接收请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
                    pathRewrite: {
                        '^/api/api': '/api'
                    }
                },

            }

    },

    productionSourceMap: false,
    chainWebpack: config => {
        // 移除 prefetch 插件
        config.plugins.delete('prefetch')

        config.plugin('webpack-bundle-analyzer')
            .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    },
    configureWebpack: {
        plugins: [
            new compressionWebpackPlugin({
                //[file] 会被替换成原始资源。[path] 会被替换成原始资源的路径， [query] 会被替换成查询字符串。默认值是 "[path].gz[query]"。
                filename: '[path].gz[query]', // 提示compression-webpack-plugin@3.0.0的话asset改为filename
                //可以是 function(buf, callback) 或者字符串。对于字符串来说依照 zlib 的算法(或者 zopfli 的算法)。默认值是 "gzip"。
                algorithm: 'gzip',
                //所有匹配该正则的资源都会被处理。默认值是全部资源。
                test: new RegExp('\\.(' + productionGZipExtensions.join('|') + ')$'),
                //只有大小大于该值的资源会被处理。单位是 bytes。默认值是 0。
                threshold: 10240,
                //只有压缩率小于这个值的资源才会被处理。默认值是 0.8。
                minRatio: 0.8
            }),
            new webpack.optimize.MinChunkSizePlugin({
                minChunkSize: 320000 // Minimum number of characters  51200
            })
        ],
        output: { // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
            filename: `js/[name].${process.env.VUE_APP_VERSION}.js`,
            chunkFilename: `js/[name].${process.env.VUE_APP_VERSION}.js`
        },
        externals: {
            xlsx: 'XLSX'
        }
    }
}
