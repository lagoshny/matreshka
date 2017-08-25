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
const del = require('del');

const buildConf = require('../utils/paths.config');
const helpers = require('../utils/helpers.utils');
const CircularJSON = require('circular-json');

function MyExampleWebpackPlugin() {
    this.deletedFile = 1;

};

let deletedFile = 1;
let changeFileName;
// Defines `apply` method in it's prototype.
MyExampleWebpackPlugin.prototype.apply = function(compiler) {
        compiler.plugin("after-compile", function(compilation, callback) {
                // compilation.contextDependencies.push(path.resolve(buildConf.folders.main.src.dir));
                compilation.fileDependencies.push('D:\\Development\\Projects\\IntelijIDEA\\matryoshka\\main\\src\\123.ts');
                compilation.fileDependencies.push('D:\\Development\\Projects\\IntelijIDEA\\matryoshka\\main\\src\\a2.ts');

            if (deletedFile === 4) {
                // console.log("DELETED");
                // compilation.contextDependencies = [];
                // compilation.fileDependencies = [];
            }
            // console.log(compilation);
            // console.log(compilation.contextDependencies);
            callback();
        });



        compiler.plugin('invalid', function (fileName, changeTime) {
            // console.log('FILE: ' + fileName + ' CHANGE TIME: ' + changeTime);
            changeFileName = fileName;
        });
        
        compiler.plugin('watch-run', function (compilation, callback) {

            console.log(compilation.compiler.watchFileSystem);
           compilation.compiler.watchFileSystem.watcher.once("remove", function(mtime, type) {
                console.log('FILE REMOVED: ' + type);
                // this._onChange(file, mtime, file, type);
            });
            compilation.compiler.watchFileSystem.watcher.once("aggregated", function(mtime, type) {
                console.log('FILE CHANGED: ' + type);
                // this._onChange(file, mtime, file, type);
            });

            deletedFile++;
            // console.log(CircularJSON.stringify(compilation.compiler.files));
            // console.log(compilation.compiler.watchFileSystem.watcher);
            // console.log(CircularJSON.stringify(compilation.compiler.inputFileSystem._statStorage.levels));
            // console.log(CircularJSON.stringify(compilation.assets));
            if (compilation.compiler.watchFileSystem.watcher.mtimes !== {}) {
                console.log('aaaa');

                let options = compilation.compiler.options;
                for (let file of Object.keys(compilation.compiler.watchFileSystem.watcher.mtimes)) {


                    if (/\.ts|\.js/.test(file) && !/___jb_tmp___/.test(file)) {
                        if (compilation.compiler.watchFileSystem.watcher.mtimes[file] === null) {

                            // let moduleRegExp = new RegExp(path.basename(file));
                            // for (let module of Object.keys(compilation.compiler.records.modules.byIdentifier)) {
                            //     if (moduleRegExp.test(module)) {
                            //         delete compilation.compiler.records.modules.usedIds[compilation.compiler.records.modules.byIdentifier[module]];
                            //         delete compilation.compiler.records.modules.byIdentifier[module];
                            //     }
                            // }
                            //
                            // compilation.compiler.watchFileSystem.watcher.mtimes = {};
                            // // delete compilation.compiler.files;
                            // delete options.entry[path.basename(file).replace(path.extname(file), '')];
                            // compilation.compiler.applyPluginsBailResult("entry-option", options.context, options.entry);
                            //
                            // for (let watcher of compilation.compiler.watchFileSystem.watcher.fileWatchers) {
                            //     if (watcher.path === file) {
                            //         console.log('DELE ' +  watcher.path);
                            //         delete compilation.compiler.watchFileSystem.watcher.fileWatchers[watcher];
                            //     }
                            // }
                            // // compiler.options = new webpack3.WebpackOptionsApply().process(options, compiler);
                            // del.sync(file.replace(path.dirname(file), buildConf.folders.main.builds.temp.spec).replace('.ts', '.js'), {force: true});
                        } else {
                            if (!options.entry[path.basename(file).replace(path.extname(file), '')]) {
                                options.entry[path.basename(file).replace(path.extname(file), '')] = [file];
                                compilation.compiler.applyPluginsBailResult("entry-option", options.context, options.entry);
                            }
                        }
                    }
                }

            } else {
                console.log('aaaa');
                let moduleRegExp = new RegExp(path.basename(file));
                for (let module of Object.keys(compilation.compiler.records.modules.byIdentifier)) {
                    if (moduleRegExp.test(module)) {
                        delete compilation.compiler.records.modules.usedIds[compilation.compiler.records.modules.byIdentifier[module]];
                        delete compilation.compiler.records.modules.byIdentifier[module];
                    }
                }

                compilation.compiler.watchFileSystem.watcher.mtimes = {};
                // delete compilation.compiler.files;
                delete options.entry[path.basename(file).replace(path.extname(file), '')];
                compilation.compiler.applyPluginsBailResult("entry-option", options.context, options.entry);

                for (let watcher of compilation.compiler.watchFileSystem.watcher.fileWatchers) {
                    if (watcher.path === file) {
                        console.log('DELE ' +  watcher.path);
                        delete compilation.compiler.watchFileSystem.watcher.fileWatchers[watcher];
                    }
                }
                // compiler.options = new webpack3.WebpackOptionsApply().process(options, compiler);
                del.sync(file.replace(path.dirname(file), buildConf.folders.main.builds.temp.spec).replace('.ts', '.js'), {force: true});
            }

            // console.log(CircularJSON.stringify(compilation));
            // let fileChanged = Object.keys(compilation.compiler.watchFileSystem.watcher.mtimes)[1];
            // console.log(compilation.compiler.watchFileSystem.watcher.mtimes);
            // let options = compilation.compiler.options;
            // if (fileChanged && /\.ts|\.js/.test(fileChanged)) {
            //     if (!options.entry[path.basename(fileChanged).replace(path.extname(fileChanged), '')]) {
            //         options.entry[path.basename(fileChanged).replace(path.extname(fileChanged), '')] = [fileChanged];
            //         compiler.applyPluginsBailResult("entry-option", options.context, options.entry);
            //     }
            //     // console.log(compilation.compiler.options.entry);
            // }


            console.log(changeFileName);
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

