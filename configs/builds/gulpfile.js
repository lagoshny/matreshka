/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 08.06.2017 21:42
 */
'use strict';

const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const del = require('del');

const buildConf = require('../utils/paths.config');
const helpers = require('../utils/helpers.utils');

const statics = require('./tasks/static.task');
const css = require('./tasks/css.task');
const scripts = require('./tasks/scripts.task');
const testTasks = require('./tasks/test.task');

const tasksConf = {
    buildStaticConfig: {
        html: {
            src: buildConf.entries.html.files,
            devDst: buildConf.folders.main.builds.dev.html,
            prodDst: buildConf.folders.main.builds.prod.html,
            cache: helpers.buildCaches.html,
            manifest: buildConf.manifest
        },
        fonts: {
            src: buildConf.entries.fonts.files,
            devDst: buildConf.folders.main.builds.dev.fonts,
            prodDst: buildConf.folders.main.builds.prod.fonts,
            cache: helpers.buildCaches.fonts
        },
        images: {
            src: buildConf.entries.img.files,
            devDst: buildConf.folders.main.builds.dev.img,
            prodDst: buildConf.folders.main.builds.prod.img,
            cache: helpers.buildCaches.img,
            manifest: buildConf.manifest
        },
        resources: {
            src: buildConf.entries.resources.files,
            devDst: buildConf.folders.main.builds.dev.resources,
            prodDst: buildConf.folders.main.builds.prod.resources,
            cache: helpers.buildCaches.resources
        }
    },
    cssBuildConfig: {
        src: [...buildConf.entries.libs.styles.files, buildConf.entries.css.commonStyles, ...buildConf.entries.css.files].filter((entry) => /[^undefined]\S/.test(entry)),
        out: buildConf.entries.css.out,
        devDst: buildConf.folders.main.builds.dev.css,
        prodDst: buildConf.folders.main.builds.prod.css,
        manifest: buildConf.manifest
    },
    jsBuildConfigs: {
        entry: buildConf.entries.scripts,
        src: [
            ...buildConf.entries.libs.polifyls.files,
            ...buildConf.entries.scripts.js.files,
            ...buildConf.entries.scripts.ts.files,
            ...buildConf.entries.scripts.spec.files].filter((entry) => /[^undefined]\S/.test(entry)),
        handleModule: buildConf.entries.scripts.modules,
        provided: buildConf.entries.libs,
        cache: helpers.buildCaches.scripts,
        devDst: buildConf.folders.main.builds.dev.js,
        prodDst: buildConf.folders.main.builds.prod.js,
        wbpConf: buildConf.folders.configs.webpackConf
    },
    jsCopyVendors: {
        provided: buildConf.entries.libs,
        devDst: buildConf.folders.main.builds.dev.js,
        prodDst: buildConf.folders.main.builds.prod.js
    },
    jsPolifylsConfigs: {
        entry: buildConf.entries.libs.polifyls,
        src: [...buildConf.entries.libs.polifyls.files].filter((entry) => /[^undefined]\S/.test(entry)),
        dst: buildConf.folders.main.builds.prod.js,
        handleModules: buildConf.entries.scripts.modules,
        cache: helpers.buildCaches.polifyls,
        wbpLibConf: buildConf.folders.configs.webpackLibsConf
    },

    jsVendorsConfigs: {
        entry: buildConf.entries.libs.scripts,
        src: [...buildConf.entries.libs.scripts.files].filter((entry) => /[^undefined]\S/.test(entry)),
        dst: buildConf.folders.main.builds.prod.js,
        handleModules: buildConf.entries.scripts.modules,
        cache: helpers.buildCaches.vendors,
        wbpLibConf: buildConf.folders.configs.webpackLibsConf
    },
    testConfigs: {
        src: [
            ...buildConf.entries.scripts.spec.builded].filter((entry) => /[^undefined]\S/.test(entry)),
        config: buildConf.folders.configs.karmaConfig,
        handle: buildConf.entries.scripts.spec.handle,
        wbpConf: buildConf.folders.configs.webpackTestConf
    },
    jsTestCopyVendors: {
        provided: buildConf.entries.libs,
        devDst: buildConf.folders.main.builds.temp.spec,
        prodDst: buildConf.folders.main.builds.prod.js
    },
    cssLintConfigs: {
        lint: buildConf.lints.css,
        cache: buildConf.lints.cachesDir
    },
    jsLintConfigs: {
        lint: buildConf.lints.js,
        cache: buildConf.lints.cachesDir
    },
    tsLintConfigs: {
        lint: buildConf.lints.ts,
        cache: buildConf.lints.cachesDir
    }
};

function clean(folder) {
    return function clean() {
        let deleteFolder = process.env.npm_config_cl || folder;
        if (deleteFolder === 'build') {
            return del(buildConf.folders.main.builds.dir, {force: true});
        }
        if (deleteFolder === 'cache' || deleteFolder === 'tmp') {
            return del(buildConf.folders.main.builds.temp.dir, {force: true});
        }
        if (deleteFolder === 'dep') {
            return del(buildConf.folders.main.dependencies.node, {force: true});
        }
        return helpers.isProduction() ? del([buildConf.folders.main.builds.prod.dir, buildConf.folders.main.builds.temp.dir], {force: true})
            : del(buildConf.folders.main.builds.dev.dir, {force: true});
    };

}

gulp.task('clean', clean());

gulp.task('statics', gulp.series(
    statics.buildFonts(tasksConf.buildStaticConfig.fonts),
    statics.buildImages(tasksConf.buildStaticConfig.images),
    statics.buildResources(tasksConf.buildStaticConfig.resources)
    )
);

gulp.task('buildPolifyls', scripts.providedBuild(tasksConf.jsPolifylsConfigs));
gulp.task('buildVendors', scripts.providedBuild(tasksConf.jsVendorsConfigs));
gulp.task('test', testTasks.testRun(tasksConf.testConfigs));

gulp.task('js', gulp.parallel(
    scripts.jsLint(tasksConf.jsLintConfigs),
    scripts.tsLint(tasksConf.tsLintConfigs),
    gulp.series(
        'buildPolifyls',
        'buildVendors',
        scripts.copyVendors(tasksConf.jsCopyVendors),
        scripts.jsBuild(tasksConf.jsBuildConfigs),
        'test'
    ))
);

gulp.task('test', testTasks.testRun(tasksConf.testConfigs));

gulp.task('css', gulp.series(
    css.cssLint(tasksConf.cssLintConfigs),
    css.cssBuild(tasksConf.cssBuildConfig))
);

gulp.task('css:linting', gulp.series('clean', css.cssLint(tasksConf.cssLintConfigs)));
gulp.task('js:linting', gulp.series('clean', scripts.jsLint(tasksConf.jsLintConfigs)));
gulp.task('ts:linting', gulp.series('clean', scripts.tsLint(tasksConf.tsLintConfigs)));

gulp.task('clean:lintsCache', function (callback) {
    del(buildConf.lints.cachesDir, {force: true});
    callback();
});


gulp.task('testWatch', function () {
    helpers.buildCaches.polifyls.watch = true;
    gulp.watch(buildConf.watchDirs.polifyls, {usePolling: true}, gulp.series('buildPolifyls')).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.polifyls, !!buildConf.entries.libs.polifyls.out));
    gulp.watch(buildConf.watchDirs.vendors, {usePolling: true}, gulp.series('buildVendors')).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.vendors, !!buildConf.entries.libs.scripts.out));
    gulp.watch(buildConf.watchDirs.js, {usePolling: true}, gulp.series('js')).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.js, !!buildConf.entries.scripts.out));
    // gulp.watch(buildConf.watchDirs.js, {usePolling: true}, gulp.series('js', statics.buildHtml(tasksConf.buildStaticConfig.html))).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.js, !!buildConf.entries.scripts.out));
});

gulp.task('tst', gulp.series(scripts.copyVendors(tasksConf.jsTestCopyVendors), 'test'));

gulp.task('watch', function () {
    helpers.buildCaches.polifyls.watch = true;
    helpers.buildCaches.watch = true;
    gulp.watch(buildConf.watchDirs.polifyls, {usePolling: true}, gulp.series('buildPolifyls'))
        .on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.polifyls, !!buildConf.entries.libs.polifyls.out));

    gulp.watch(buildConf.watchDirs.vendors, {usePolling: true}, gulp.series('buildVendors'))
        .on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.vendors, !!buildConf.entries.libs.scripts.out));

    if (!buildConf.entries.scripts.modules) {
        gulp.watch(buildConf.watchDirs.js, {usePolling: true}, gulp.series('js'))
            .on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.js, !!buildConf.entries.scripts.out));
    }
    gulp.watch(buildConf.watchDirs.css, {usePolling: true}, gulp.series('css', statics.buildHtml(tasksConf.buildStaticConfig.html)))
        .on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.css, !!buildConf.entries.css.out));
    gulp.watch(buildConf.lints.configsDir, {usePolling: true}, gulp.series('clean:lintsCache'));
    gulp.watch(buildConf.watchDirs.html, {usePolling: true},
        gulp.series(statics.buildHtml(tasksConf.buildStaticConfig.html))).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.html));
    gulp.watch(buildConf.watchDirs.img, {usePolling: true},
        gulp.series(statics.buildImages(tasksConf.buildStaticConfig.images))).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.img));
    gulp.watch(buildConf.watchDirs.fonts, {usePolling: true},
        gulp.series(statics.buildFonts(tasksConf.buildStaticConfig.fonts))).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.fonts));
    gulp.watch(buildConf.watchDirs.resources, {usePolling: true},
        gulp.series(statics.buildResources(tasksConf.buildStaticConfig.resources))).on('unlink', helpers.deleteFilesFromCache(buildConf.cacheName.resources));
});

gulp.task('serve', function () {
    browsersync.init({
        server: buildConf.folders.main.builds.dev.dir,
        middleware: function (req, res, next) {
            if (buildConf.angular.redirectToIndex && !/\.[^.]+$/.test(req.url)) {
                req.url = '/index.html';
            }
            return next();
        }
    });
    browsersync.watch(buildConf.watchDirs.dev).on('change', browsersync.reload);
});

if (helpers.isDevelopment()) {
    gulp.task('dev:init', function (callback) {
        helpers.createFolder(buildConf.folders.main.builds.dev.js);
        helpers.createFolder(buildConf.folders.main.builds.dev.css);
        helpers.createFolder(buildConf.folders.main.builds.dev.img);
        helpers.createFolder(buildConf.folders.main.builds.dev.fonts);
        helpers.createFolder(buildConf.folders.main.builds.dev.resources);
        helpers.createFolder(buildConf.folders.main.builds.temp.cache);
        helpers.createFolder(buildConf.lints.cachesDir);
        helpers.createFolder(buildConf.entries.libs.cache.dir);
        callback();
    });


    gulp.task('dev',
        gulp.series('dev:init',
            gulp.parallel('statics', 'js', 'css'),
            statics.buildHtml(tasksConf.buildStaticConfig.html),
            gulp.parallel('watch', 'serve')
        )
    );
}

if (helpers.isProduction()) {
    gulp.task('prod:init', function (callback) {
        helpers.createFolder(buildConf.folders.main.builds.prod.js);
        helpers.createFolder(buildConf.folders.main.builds.prod.css);
        helpers.createFolder(buildConf.folders.main.builds.prod.img);
        helpers.createFolder(buildConf.folders.main.builds.prod.fonts);
        helpers.createFolder(buildConf.folders.main.builds.prod.resources);
        helpers.createFolder(buildConf.folders.main.builds.temp.cache);
        helpers.createFolder(buildConf.manifest.dir);
        helpers.createFolder(buildConf.lints.cachesDir);
        helpers.createFolder(buildConf.entries.libs.cache.dir);
        callback();
    });

    gulp.task('prod',
        gulp.series(clean(), 'prod:init',
            gulp.parallel('statics', 'css', 'js'),
            statics.buildHtml(tasksConf.buildStaticConfig.html),
            clean('cache')
        )
    );
}

