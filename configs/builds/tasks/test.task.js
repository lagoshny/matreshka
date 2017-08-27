/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:44
 */
'use strict';

const Server = require('karma').Server;

exports.testRun = function (opt) {
    const tdd = process.env.npm_config_test && process.env.npm_config_test === 'tdd';
    return function testRun(done) {
        new Server({
            configFile: opt.config,
            autoWatch: tdd,
            singleRun: !tdd,
            files: opt.src
        }, done).start();
        done();
    }
};