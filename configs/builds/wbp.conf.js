/**
 * Webpack configuration
 *
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 24.07.2017 22:59
 */
'use strict';

const path = require('path');
const webpack3 = require('webpack');
const fs = require('fs');

const buildConf = require('../utils/paths.config');
const helpers = require('../utils/helpers.utils');
const watchFilePlugin = require('watchfile-webpack-plugin');

module.exports = {
    entry: {
      main: buildConf.entries.scripts.spec.files
    },
    output: {
        publicPath: '',
        filename: '[name].js',
    },
    plugins: [
        new webpack3.NoEmitOnErrorsPlugin(),
        new webpack3.ContextReplacementPlugin(
            /angular([\\\/])core([\\\/])@angular/,
            path.resolve(__dirname, '../src')
        )
    ],
    module: {
        rules: []
    },
    resolve: {
        modules: [
            buildConf.folders.configs.utils,
            buildConf.folders.dependencies.node,
            buildConf.folders.main.src.dir
        ],
        extensions: ['.ts', '.js']
    },
    profile: true,
    bail: helpers.isProduction(),
    watch: true
};


