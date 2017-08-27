/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:45
 */

const path = require('path');

const buildConf = require('../utils/paths.config');

module.exports = function (config) {
    config.set({
        basePath: buildConf.folders.main.src.dir,
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        reporters: ["spec"],
        specReporter: {
            maxLogLines: 5,             // limit number of lines logged per test
            suppressErrorSummary: true, // do not print error summary
            suppressFailed: false,      // do not print information about failed tests
            suppressPassed: false,      // do not print information about passed tests
            suppressSkipped: true,      // do not print information about skipped tests
            showSpecTiming: false,      // print the time elapsed for each spec
            failFast: false              // test would finish with error when a first fail occurs.
        },

    });
};