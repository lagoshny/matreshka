/**
 * Webpack configuration
 *
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 24.07.2017 22:59
 */
'use strict';

const webpack3 = require('webpack');
const fs = require('fs');

const buildConf = require('../utils/paths.config');
const helpers = require('../utils/helpers.utils');

const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
const path = require('path');
const del = require('del');

let changeFileName;

function AddWatchWebpackPlugin() {
};

AddWatchWebpackPlugin.prototype.apply = function (compiler) {
    compiler.plugin("after-compile", function (compilation, callback) {
        // Watch for root project dir
        compilation.contextDependencies.push(path.resolve(buildConf.folders.main.src.dir));
        callback();
    });

    compiler.plugin("make", function (compilation, callback) {
        if (changeFileName) {
            let name = path.basename(changeFileName).replace('.ts', '');
            const dep = SingleEntryPlugin.createDependency(changeFileName, name);
            compilation.addEntry(buildConf.folders.main.src.dir, dep, name, callback);
            changeFileName = "";
        } else {
            callback();
        }
    });

    compiler.plugin('watch-run', function (compilation, callback) {
        /**
         * If file was changed, then compiler.watchFileSystem.watcher will object:
         * mtimes: {
         *   'PathToFileWhichWasChange': 'time in mls'
         * }
         * For example:
         *   mtimes: {'D:\Development\Projects\main\src\a2.ts': 1503649122899
         * }
         *
         * If you will watch to dir, it will have 2 objects:
         *
         * For example:
         *   mtimes: {
         *   'D:\Development\Projects\main\src\a2.ts___jb_tmp___': null,
         *   'D:\Development\Projects\main\src\a2.ts': 1503649122899
         * }
         *
         */
        if (compilation.compiler.watchFileSystem.watcher.mtimes !== {}) {
            for (let file of Object.keys(compilation.compiler.watchFileSystem.watcher.mtimes)) {
                // I will watch for js, ts files, and not dir.
                if (/\.ts|\.js/.test(file) && !/___jb_tmp___/.test(file)) {
                    // If mtimes exist, and time file changed is not null, then we save filePath
                    if (compilation.compiler.watchFileSystem.watcher.mtimes[file] !== null) {
                        changeFileName = file;
                    } else {
                        // If mtimes exist, and time file changed time is NULL, then we delete builded file
                        del.sync(file.replace(path.dirname(file), buildConf.folders.main.builds.temp.spec).replace('.ts', '.js'), {force: true});
                    }
                }
            }
        }
        callback();
    })
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
        new AddWatchWebpackPlugin()
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
// if (fs.existsSync(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/polyfills.test.manifest.json'))) {
//     module.exports.plugins.push(
//         new webpack3.DllReferencePlugin({
//             manifest: require(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/polyfills.test.manifest.json'))
//         })
//     )
// }
// if (fs.existsSync(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/vendors.manifest.json'))) {
//     module.exports.plugins.push(
//         new webpack3.DllReferencePlugin({
//             manifest: require(path.resolve(buildConf.entries.libs.cache.dir, 'manifest/vendors.manifest.json'))
//         })
//     )
// }

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

