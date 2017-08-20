'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const through2 = require('through2').obj;
const combiner = require('stream-combiner2').obj;
const path = require('path');
const fs = require('fs');
const webpack3 = require('webpack');
const webpackStream = require('webpack-stream');
const pipedWebpack = require('piped-webpack');
const del = require('del');
const glob = require('glob');

const buildConf = require('../../utils/paths.config');
const helpers = require('../../utils/helpers.utils');

/*For configuration tslint, you can visit: https://palantir.github.io/tslint/usage/configuration/ */
// const program = tslint.Linter.createProgram(paths.typeScriptConfig, paths.folders.main.src.root);
exports.tsLint = function (opt) {
    return function tsLint(done) {
        if (!opt || !opt.lint || !opt.lint.files || opt.lint.files.length === 0) {
            done();
            return;
        }
        if (helpers.isExistPreviousCheck(opt.lint.result)) {
            try {
                opt.lint.result = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), opt.lint.cacheFile)));
            } catch (e) {
                // console.log(e);
            }
        }
        return gulp.src(opt.lint.files, {read: false})
            .pipe($.plumber({
                errorHandler: function (err) {
                    console.log(err.message);
                    this.emit('end');
                }
            })).pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'ts:lint'})))
            .pipe($.if(function (file) {
                    return opt.lint.result[file.path] && opt.lint.result[file.path].mtime === file.stat.mtime.toJSON();
                },
                through2(function (file, enc, callback) {
                    file.tslint = opt.lint.result[file.path].tslint;
                    file.tslint.failures = {};
                    callback(null, file);
                }),
                combiner(
                    through2(function (file, enc, callback) {
                        file.contents = fs.readFileSync(file.path);
                        callback(null, file);
                    }),
                    $.tslint({configuration: opt.lint.configFile}),
                    $.cond(helpers.mode.isDebug(), $.debug({title: 'tslint'})),
                    through2(function (file, enc, callback) {
                            file.tslint.failures = {};
                            opt.lint.result[file.path] = {
                                tslint: file.tslint,
                                mtime: file.stat.mtime.toJSON()
                            };
                            callback(null, file);
                        }
                    )
                )
            ))
            .pipe($.tslint.report({emitError: false}))
            .pipe($.if(helpers.isProduction(),
                $.tslint.report({emitError: true}).on('error', helpers.lintErrorReporter('TS'))))
            .on('end', function () {
                helpers.createFolder(opt.cache);
                fs.writeFileSync(opt.lint.cacheFile, JSON.stringify(opt.lint.result));
            })
    }
};

/*For configuration eslint, you can visit: http://eslint.org/docs/user-guide/migrating-to-3.0.0#requiring-configuration-to-run*/
exports.jsLint = function (opt) {
    return function jsLint(done) {
        if (!opt || !opt.lint || !opt.lint.files || opt.lint.files.length === 0) {
            done();
            return;
        }
        if (helpers.isExistPreviousCheck(opt.lint.result)) {
            try {
                opt.lint.result = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), opt.lint.cacheFile)));
            } catch (e) {
                // console.log(e);
            }
        }
        return gulp.src(opt.lint.files, {read: false})
            .pipe($.plumber())
            .pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'js:lint'})))
            .pipe($.if(function (file) {
                    return opt.lint.result[file.path] && opt.lint.result[file.path].mtime === file.stat.mtime.toJSON();
                },
                through2(function (file, enc, callback) {
                    file.eslint = opt.lint.result[file.path].eslint;
                    callback(null, file);
                }),
                combiner(
                    through2(function (file, enc, callback) {
                        file.contents = fs.readFileSync(file.path);
                        callback(null, file);
                    }),
                    $.eslint({configFile: opt.lint.configFile}),
                    $.cond(helpers.mode.isDebug(), $.debug({title: 'eslint'})),
                    through2(function (file, enc, callback) {
                            opt.lint.result[file.path] = {
                                eslint: file.eslint,
                                mtime: file.stat.mtime.toJSON()
                            };
                            callback(null, file);
                        }
                    )
                )
            ))
            .pipe($.eslint.format())
            .pipe($.if(helpers.isProduction(),
                $.eslint.failAfterError().on('error', helpers.lintErrorReporter('JS'))))
            .on('end', function () {
                helpers.createFolder(opt.cache);
                fs.writeFileSync(opt.lint.cacheFile, JSON.stringify(opt.lint.result));
            })
    }
};


exports.copyVendors = function (opt) {
    return function copyVendors() {
        return gulp.src([`${opt.provided.cache.dir}/*.js`, `${opt.provided.cache.dir}/*.js`], {allowEmpty: true})
            .pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'Copy vendors'})))
            .pipe(gulp.dest(helpers.isDevelopment() ? opt.devDst : opt.prodDst))
    }
};

exports.jsBuild = function (opt) {
    let needBuildNameFiles = glob.sync(...buildConf.entries.scripts.ts.files).map(file => path.basename(file).replace(/\.[^.]+$/, ""));
    return function jsBuild(done) {
        if (!opt || !opt.src || opt.src.length === 0) {
            done();
            return;
        }
        return gulp.src(opt.src)
            .pipe($.plumber())
            .pipe($.if(!opt.handleModule,
                combiner(
                    $.babel({
                        presets: ['es2015']
                    }),
                    $.if(helpers.isDevelopment(),
                        combiner(
                            $.cached(opt.cache.name),
                            $.cond(helpers.mode.isDebug(), $.debug({title: 'JS cache'})),
                            $.sourcemaps.init(),
                            $.if(!!opt.entry.out,
                                combiner(
                                    $.remember(opt.cache.name),
                                    $.concat(`${opt.entry.out}.js`)
                                )
                            ),
                            $.debug({title: 'JS build'}),
                            $.sourcemaps.write(),
                            gulp.dest(opt.devDst)
                        )
                    ),
                    $.if(helpers.isProduction(), combiner(
                        $.concat(`${opt.entry.out || 'main'}.min.js`),
                        $.uglifyjs(),
                        $.debug({title: 'JS build'})
                    ))
                )))
            .pipe($.if(opt.handleModule,
                combiner(
                    through2(function (file, enc, callback) {
                        file.named = opt.entry.out || file.stem;
                        if (buildConf.entries.libs.polifyls.handle && buildConf.entries.libs.polifyls.files.find(filePath => filePath === file.path)) {
                            file.named = buildConf.entries.scripts.polyfillsOut;
                        }
                        callback(null, file);
                    }),
                    webpackStream(require(opt.wbpConf), webpack3),
                    $.if(helpers.isDevelopment(), gulp.dest(function (file) {
                        if (/\.spec/.test(file.stem)) {
                            return buildConf.folders.main.builds.temp.spec;
                        }
                        return opt.devDst;
                    }))
                )))
            .pipe($.if(helpers.isProduction(),
                combiner(
                    $.rev(),
                    gulp.dest(opt.prodDst)
                )))
            .on('data', function (file) {
                if (needBuildNameFiles.indexOf(file.stem) !== -1) {
                    needBuildNameFiles.splice(needBuildNameFiles.indexOf(file.stem), 1);
                }
                if (needBuildNameFiles.length === 0) {
                    done();
                }

            })
    }
};

exports.providedBuild = function (opt) {
    // When run build, we need to check if already polifyls files exists
    try {
        opt.cache.lastModify = JSON.parse(fs.readFileSync(opt.cache.cacheLastModify));
        let existFiles = fs.readdirSync(opt.entry.dir);
        let srcFiles = opt.src.map(function (file) {
            return file.replace(`${opt.entry.dir}\\`, "")
        });
        if (Object.keys(opt.cache.lastModify).length === srcFiles.length) {
            for (let file of srcFiles) {
                let filePattern = new RegExp(file);
                let foundedFile = existFiles.filter((entry) => filePattern.test(entry));
                if (foundedFile.length === 0) {
                    opt.cache.needRebuild = true;
                    break;
                }
                let fullPathToFoundedFile = path.resolve(opt.entry.dir, ...foundedFile);
                let foundedFileStats = fs.statSync(fullPathToFoundedFile);
                opt.cache.needRebuild = !(opt.cache.lastModify[fullPathToFoundedFile].mtime === foundedFileStats.mtime.toJSON());
            }
        } else {
            opt.cache.lastModify= {};
            // console.log('aaaa');
        }
    } catch (e) {
        // console.log(e);
        opt.cache.needRebuild = true;
    }
    return function providedBuild(done) {
        if (opt && !opt.entry.handle) {
            done();
            return;
        }
        opt.cache.needRebuild = opt.cache.needRebuild || opt.cache.watch;
        return gulp.src(opt.src)
            .pipe($.plumber())
            .pipe($.if(opt.cache.needRebuild,
                combiner(
                    $.if(helpers.isDevelopment(),
                        combiner(
                            $.cached(opt.cache.name),
                            $.cond(helpers.mode.isDebug(), $.debug({title: `${opt.cache.title} cached files`})),
                            $.if(!!opt.entry.out, $.remember(opt.cache.name)),
                            through2(function (file, enc, callback) {
                                opt.cache.lastModify[file.path] = {mtime: file.stat.mtime.toJSON()};
                                callback(null, file);
                            })
                        )
                    ),
                    $.if(!opt.handleModules,
                        combiner(
                            $.if(helpers.isDevelopment(), $.sourcemaps.init()),
                            $.if(!!opt.entry.out, $.concat(`${opt.entry.out}.js`)),
                            $.if(helpers.isDevelopment(), $.sourcemaps.write()),
                            $.debug({title: `${opt.cache.title} build files`}),
                            $.if(helpers.isDevelopment(), gulp.dest(opt.cache.dir))
                        )
                    ),
                    $.if(opt.handleModules,
                        combiner(
                            through2(function (file, enc, callback) {
                                file.named = opt.entry.out || file.stem;
                                callback(null, file);
                            }),
                            pipedWebpack(require(opt.wbpLibConf)),
                            $.if(helpers.isDevelopment(), gulp.dest(opt.cache.dir))
                        )
                    )
                )
            ))
            .pipe($.if(helpers.isProduction(), combiner(
                $.rev(),
                $.debug({title: `${opt.cache.title} build files`}),
                gulp.dest(opt.dst))
            ))
            .on('end', function () {
                if (opt.cache.needRebuild && helpers.isDevelopment()) {
                    helpers.createFolder(opt.cache.dir);
                    if (fs.existsSync(opt.cache.cacheLastModify)) {
                        del.sync(opt.cache.cacheLastModify, {force: true});
                    }
                    fs.writeFileSync(opt.cache.cacheLastModify, JSON.stringify(opt.cache.lastModify));
                }
                done();
            });
    }
};

