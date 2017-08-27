/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:44
 */
'use strict';

const Server = require('karma').Server;

exports.testRun = function (opt) {
    const tdd = process.env.npm_config_test && process.env.npm_config_test === 'tdd';
    let server = null;
    return function testRun(done) {
        if (!server) {
            server = new Server({
                configFile: opt.config,
                autoWatch: tdd,
                singleRun: !tdd,
                files: opt.src
            }, done);
            server.start();
        } else {
            server.refreshFiles();
            done();
        }
    }
};