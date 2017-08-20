/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:44
 */
'use strict';

const gulp = require('gulp');
const karmaRunner = require('gulp-karma-runner');
const karmaServer = require('karma').Server;
const $ = require('gulp-load-plugins')();
// const webpack3 = require('webpack');
// const webpackStream = require('webpack-stream');
// const through2 = require('through2').obj;
// const combiner = require('stream-combiner2').obj;
// const buildConf = require('../../utils/paths.config');


exports.testRun = function (opt) {
    return function testRun(done) {
        console.log(opt.src);
        return gulp.src(opt.src)
            .pipe($.plumber({
                errorHandler: function (err) {
                    console.log(err.message);
                    this.emit('end');
                }}))
            .pipe(karmaRunner.server({
                configFile: opt.config,
                autoWatch: false,
                singleRun: true
            }))
    }
};

exports.testTdd = function (opt) {
    return function testRun(done) {
        return gulp.src(opt.src)
            .pipe($.plumber({
                errorHandler: function (err) {
                    console.log(err.message);
                    this.emit('end');
                }}))
            .pipe(karmaRunner.server({
                configFile: opt.config,
                // autoWatch: false,
                singleRun: false
            }))
            .on('data', function () {
                done();
            })
    }
};

