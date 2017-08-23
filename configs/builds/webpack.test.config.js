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


function MyExampleWebpackPlugin() {

};

// Defines `apply` method in it's prototype.
MyExampleWebpackPlugin.prototype.apply = function(compiler) {
        compiler.plugin("after-compile", function(compilation) {
                compilation.contextDependencies.push(path.resolve(buildConf.folders.main.src.dir, '**/*.*'));
            console.log(compilation.fileDependencies);
            console.log(compilation.contextDependencies);

        });
};

module.exports = {
    output: {
        publicPath: '',
        filename: '[name].js',
    },
    plugins: [
        new webpack3.NoEmitOnErrorsPlugin(),
        new webpack3.ContextReplacementPlugin(
            /angular([\\\/])core([\\\/])@angular/,
            path.resolve(__dirname, '../src')
        ),
        new MyExampleWebpackPlugin()
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
    watch: helpers.isDevelopment()
};


if (buildConf.entries.scripts.js.handle) {
    module.exports.module.rules.push(
        // Use babel loader for processing JS files
        {
            test: /\.js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            },
            include: [buildConf.folders.main.src.dir]
        }
    )
}

if (buildConf.entries.scripts.ts.handle) {
    let tsLoader = {
        // Use TS loader for processing TS files
        // Use angular2-template-loader for replace templateUrl: './some.html' to templateUrl: require('./some.html')
        test: /\.ts$/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    //Fo speed build we are using this loader options, with TS isolatedModules compiler options
                    transpileOnly: helpers.isDevelopment(),
                    configFileName: buildConf.tsConf,
                    compilerOptions: {
                        isolatedModules: helpers.isDevelopment(),
                    }

                }
            }
        ],
        include: [buildConf.folders.main.src.dir]
    };

    module.exports.module.rules.push(tsLoader);
    if (buildConf.angular.inlineStyles || buildConf.angular.inlineTemplate) {
        tsLoader.use.push('angular2-template-loader');
        if (buildConf.angular.inlineStyles) {
            module.exports.module.rules.push(
                {
                    test: /\.(css)$/,
                    use: {
                        loader: 'raw-loader'
                    },
                    include: [buildConf.folders.main.src.dir]
                }
            )
        }
        if (buildConf.angular.inlineTemplate) {
            module.exports.module.rules.push(
                {
                    test: /\.(html)$/,
                    use: {
                        loader: 'raw-loader'
                    },
                    include: [buildConf.folders.main.src.dir]
                }
            )
        }
    }
    if (buildConf.angular.lazyRoute) {
        tsLoader.use.push('angular2-router-loader');
    }
}
if (fs.existsSync(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/polyfills.test.manifest.json'))) {
    module.exports.plugins.push(
        new webpack3.DllReferencePlugin({
            manifest: require(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/polyfills.test.manifest.json'))
        })
    )
}
if (fs.existsSync(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/vendors.manifest.json'))) {
    module.exports.plugins.push(
        new webpack3.DllReferencePlugin({
            manifest: require(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/vendors.manifest.json'))
        })
    )
}

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

if (helpers.isProduction()) {
    // Minimization JS files
    module.exports.plugins.push(
        new webpack3.optimize.UglifyJsPlugin({
            mangle: {
                keep_fnames: true
            },
            compress: true
        })
    );
}

