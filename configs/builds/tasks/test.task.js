/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:44
 */
'use strict';

const gulp = require('gulp');
const karmaRunner = require('gulp-karma-runner');
const helpers = require('../../utils/helpers.utils');
const $ = require('gulp-load-plugins')();

exports.testRun = function (opt) {
    const tdd = process.env.npm_config_test && process.env.npm_config_test === 'tdd';
    return function testRun(done) {
        if (!opt.handle) {
            done();
            return;
        }
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
