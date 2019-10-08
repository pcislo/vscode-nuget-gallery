const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
    configureWebpack: {
        optimization: {
            splitChunks: false
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index.html',
                inlineSource: '.(js|css)$'
            }),
            new HtmlWebpackInlineSourcePlugin()
        ]
    }
}