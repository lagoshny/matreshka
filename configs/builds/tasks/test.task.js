/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:44
 */
'use strict';

const gulp = require('gulp');
const karmaRunner = require('gulp-karma-runner');
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


exports.testRun = function (opt) {
    const tdd = process.env.npm_config_test && process.env.npm_config_test === 'tdd';
    return function testRun(done) {
        if (!opt.handle) {
            done();
            return;
        }
        console.log(opt.src);
        return gulp.src(opt.src)
            .pipe($.plumber({
                errorHandler: function (err) {
                    console.log(err.message);
                    if (helpers.isProduction()) {
                        console.log("\n\r\x1b[31mBuild is FAIL, you need check test which was fail, after you fix all tests you need run build again.");
                        process.exit();
                    }
                    this.emit('end');
                }}))
            .pipe(
                combiner(
                    through2(function (file, enc, callback) {
                        if (/test\.spec\.ts/.test(file.path)) {
                            console.log(file.path);
                            file.named = buildConf.entries.scripts.polyfillsOut;
                        }
                       else if (/polyfills\.ts/.test(file.path)) {
                            file.named = buildConf.entries.scripts.polyfillsOut;
                        }
                        else if (/\.spec\./.test(file.path)) {
                            file.named = file.stem;
                        } else {
                            file.named = file.stem;
                        }
                        callback(null, file);
                    }),
                    webpackStream(require(opt.wbpConf), webpack3),
                    $.if(helpers.isDevelopment(), gulp.dest(function (file) {
                            return buildConf.folders.main.builds.temp.spec;
                    }))
                )
            )
            .pipe(gulp.src([`${buildConf.folders.main.builds.temp.spec}/polyfills.js`,
                `${buildConf.folders.main.builds.temp.spec}/vendors.js`,
                `${buildConf.folders.main.builds.temp.spec}/main.js`,
                `${buildConf.folders.main.builds.temp.spec}/*.spec.js`]))
            .pipe(karmaRunner.server({
                configFile: opt.config,
                autoWatch: tdd,
                singleRun: !tdd
            }))
            .on('data', function () {
                done();
            })
    }
};
