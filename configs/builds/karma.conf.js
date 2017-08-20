/**
 * Created by Ilya Lagoshny (ilya@lagoshny.ru)
 *
 * Date: 20.08.2017 11:45
 */
const buildConf = require('../utils/paths.config');
let preprocessorsFiles = {};
if (buildConf.entries.scripts.js.handle) {
    for (let file of buildConf.entries.scripts.js.files) {
        preprocessorsFiles[file] = ['babel'];
    }
}
if (buildConf.entries.scripts.ts.handle) {
    for (let file of buildConf.entries.scripts.ts.files) {
        preprocessorsFiles[file] = ['babel'];
    }
}
if (buildConf.entries.scripts.spec.handle) {
    for (let file of buildConf.entries.scripts.spec.files) {
        preprocessorsFiles[file] = ['babel'];
    }
}

module.exports = function (config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        // preprocessors: preprocessorsFiles,
        // babelPreprocessor: {
        //     options: {
        //         presets: ['es2015'],
        //         sourceMap: 'inline'
        //     },
        //     filename: function (file) {
        //         return file.originalPath.replace(/\.js$/, '.es5.js');
        //     },
        //     sourceFileName: function (file) {
        //         return file.originalPath;
        //     }
        // }
    });
};