/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 30.07.2017 22:26
 */
const webpack3 = require('webpack');
const path = require('path');

const buildConf = require('../utils/paths.config');
const helpers = require('../utils/helpers.utils');

module.exports = {
    output: {
        filename: '[name].js',
        library: '[name]'
    },
    devtool: helpers.isDevelopment() ? 'source-map' : '',
    plugins: [
        new webpack3.NoEmitOnErrorsPlugin(),
        new webpack3.ContextReplacementPlugin(
            /angular([\\\/])core([\\\/])@angular/,
            path.resolve(__dirname, '../src')
        ),
        new webpack3.DllPlugin({
            path: path.resolve('manifest', '[name].manifest.json'),
            name: '[name]'
        })
    ],
    resolve: {
        modules: [
            buildConf.folders.configs.utils,
            buildConf.folders.dependencies.node
        ],
        extensions: ['.ts', '.js']
    }
};

if (process.env.npm_config_info) {
    module.exports.stats = {
        errorDetails: true,
        modules: true,
        moduleTrace: true,
        performance: true,
        reasons: true,
        entrypoints: false
    }
}

