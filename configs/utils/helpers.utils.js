/**
 * Some useful methods, which helps improve configuration code
 *
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 27.07.2017 22:59
 */

'use strict';

const $ = require('gulp-load-plugins')();
const del = require('del');

const path = require('path');
const buildConf = require('../utils/paths.config');

//For install ENV in Windows console, use command: set NODE_ENV=prod && gulp task_name or separate.
const NODE_ENV = process.env.NODE_ENV || 'dev';
const debug = process.env.npm_config_info;

exports.isDevelopment = function isDevelopment() {
    return NODE_ENV === 'dev';
};

exports.isProduction = function isProduction() {
    return NODE_ENV === 'prod';
};

exports.mode = {
    isDebug: function () {
        return debug;
    }
};

exports.createFolder = function (folderName) {
    const mkdirp = require('mkdirp');
    if (!folderName) {
        return;
    }
    mkdirp.sync(folderName);
};


exports.buildCaches = {
    html: {
        name: buildConf.cacheName.html
    },
    fonts: {
        name: buildConf.cacheName.fonts
    },
    img: {
        name: buildConf.cacheName.img
    },
    resources: {
        name: buildConf.cacheName.resources
    },
    scripts: {
        name: buildConf.cacheName.js
    },
    polifyls: {
        dir: buildConf.entries.libs.cache.dir,
        name: buildConf.cacheName.polifyls,
        title: 'Polifyls',
        cacheLastModify: buildConf.entries.libs.cache.polifylsModify,
        lastModify: {},
        needRebuild: true,
        watch: false
    },
    vendors: {
        dir: buildConf.entries.libs.cache.dir,
        name: buildConf.cacheName.vendors,
        title: 'Vendors',
        cacheLastModify: buildConf.entries.libs.cache.vendorsModify,
        lastModify: {},
        needRebuild: true,
        watch: false
    }
};

exports.isExistPreviousCheck = function (obj) {
    return Object.keys(obj).length === 0;
};

exports.lintErrorReporter = function (fileType) {
    let msg;
    if (fileType === 'css') {
        msg = '\nUse the command \'npm run css:lint\' for get more information about warnings in your CSS files'
    }
    if (fileType === 'js') {
        msg = '\nUse the command \'npm run js:lint\' for get more information about warnings in your JS files'
    }
    if (fileType === 'ts') {
        msg = '\nUse the command \'npm run ts:lint\' for get more information about warnings in your TS files'
    }
    return function (err) {
        $.notify({
            title: 'You have error with ' + fileType + ' file(s)',
            message: err.message + msg
        }).write(err);
        del(buildConf.folders.main.builds.prod.root, {force: true});
        process.exit(1);
    };
};

exports.deleteFilesFromCache = function (cacheName, isRemember) {
    return function (fileName) {
        if (isRemember && cacheName) {
            $.remember.forget(cacheName, path.resolve(fileName));
        }
        let buildFileName = fileName.replace(buildConf.folders.main.src.dir, buildConf.folders.main.builds.dev.dir);

        if (exports.buildCaches.polifyls.lastModify[fileName]) {
            buildFileName = fileName.replace(buildConf.entries.libs.polifyls.dir, buildConf.entries.libs.cache.dir);
            delete exports.buildCaches.polifyls.lastModify[fileName];
        }
        if (exports.buildCaches.vendors.lastModify[fileName]) {
            buildFileName = fileName.replace(buildConf.entries.libs.vendors.dir, buildConf.entries.libs.cache.dir);
            delete exports.buildCaches.vendors.lastModify[fileName];
        }
        del.sync(buildFileName, {force: true});
        //Так же по оригинальному пути, удаляем файл из кеша
        if (cacheName && $.cached.caches[cacheName]) {
            delete $.cached.caches[cacheName][path.resolve(fileName)];
        }
    }
}