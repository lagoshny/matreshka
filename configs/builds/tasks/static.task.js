'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const combiner = require('stream-combiner2').obj;

const buildConf = require('../../utils/paths.config');
const helpers = require('../../utils/helpers.utils');

exports.buildHtml = function (opt) {
    return function buildHtml() {
        return gulp.src(...opt.src)
            .pipe($.plumber())
            .pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'Static:html'})))
            .pipe($.if(helpers.isDevelopment(), combiner(
                $.cached(opt.cache),
                $.cond(helpers.mode.isDebug(), $.debug({title: 'Cached static:html'})),
                $.inject(gulp.src([
                        ...buildConf.folders.main.builds.dev.polyfillsFiles,
                        ...buildConf.folders.main.builds.dev.vendorsFiles,
                        ...buildConf.folders.main.builds.dev.jsFiles,
                        ...buildConf.folders.main.builds.dev.cssFiles], {read: false, allowEmpty:true}),
                    {
                        ignorePath: ['../../main/builds/development/'],
                        addRootSlash: false
                    }),
                gulp.dest(opt.devDst)
            )))
            .pipe($.if(helpers.isProduction(), combiner(
                $.inject(gulp.src([
                        ...buildConf.folders.main.builds.prod.polyfillsFiles,
                        ...buildConf.folders.main.builds.prod.vendorsFiles,
                        ...buildConf.folders.main.builds.prod.jsFiles,
                        ...buildConf.folders.main.builds.prod.cssFiles], {read: false, allowEmpty:true}),
                    {
                        ignorePath: '../../main/builds/production/',
                        addRootSlash: false
                    }),
                $.revReplace({
                    manifest: gulp.src([
                        opt.manifest.img.file,
                        opt.manifest.provided.file,
                        opt.manifest.js.file], {allowEmpty: true})
                }),
                gulp.dest(opt.prodDst)
            )))
    }
};

exports.buildImages = function (opt) {
    return function buildImages() {
        return gulp.src(...opt.src)
            .pipe($.plumber())
            .pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'Static:images'})))
            .pipe($.if(helpers.isDevelopment(), combiner(
                $.cached(opt.cache),
                $.cond(helpers.mode.isDebug(), $.debug({title: 'Cached static:images'})),
                gulp.dest(opt.devDst)
            )))
            .pipe($.if(helpers.isProduction(), combiner(
                $.imagemin([$.imagemin.optipng({optimizationLevel: 5})]),
                $.rev(),
                gulp.dest(opt.prodDst),
                $.rev.manifest(opt.manifest.img.name),
                gulp.dest(opt.manifest.img.path)
            )))
    };
};

exports.buildFonts = function (opt) {
    return function buildFonts() {
        return gulp.src(...opt.src)
            .pipe($.plumber())
            .pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'Static:fonts'})))
            .pipe($.if(helpers.isDevelopment(), combiner(
                $.cached(opt.cache),
                $.cond(helpers.mode.isDebug(), $.debug({title: 'Cached static:fonts'})),
                gulp.dest(opt.devDst)
            )))
            .pipe($.if(helpers.isProduction(), gulp.dest(opt.prodDst)));
    }
};

exports.buildResources = function (opt) {
    return function buildResources() {
        return gulp.src(...opt.src)
            .pipe($.plumber())
            .pipe($.cond(helpers.mode.isDebug(), $.debug({title: 'Static:resources'})))
            .pipe($.if(helpers.isDevelopment(), combiner(
                $.cached(opt.cache),
                $.cond(helpers.mode.isDebug(), $.debug({title: 'Cached static:resources'})),
                gulp.dest(opt.devDst)
            )))
            .pipe($.if(helpers.isProduction(), gulp.dest(opt.prodDst)));
    };
};