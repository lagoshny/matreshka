const path = require('path');

let src = '';
let dev = '';
let isAngular = '';

exports.getMethods = function (srcConf, devConf, isAngularParam) {
    src = srcConf;
    dev = devConf;
    isAngular = isAngularParam;
    return {
        getDevBuildWatch: getDevBuildWatch,
        getHtmlWatch: getHtmlWatch,
        getImgWatch: getImgWatch,
        getFontsWatch: getFontsWatch,
        getResourcesWatch: getResourcesWatch,
        getTestsWatch: getTestsWatch,
        getPolifylsWatch: getPolifylsWatch,
        getVendorsWatch: getVendorsWatch,
        getCssWatch: getCssWatch,
        getJsWatch: getJsWatch
    };
};

function getDevBuildWatch() {
    return path.resolve(dev.getDir(), '**/*.*');
}

function getHtmlWatch() {
    return src.getHtmlFiles();
}

function getImgWatch() {
    return src.getImgFiles();
}

function getFontsWatch() {
    return src.getFontFiles();
}

function getResourcesWatch() {
    return src.getResourceFiles();
}

function getTestsWatch() {
    return src.scripts.getTestFiles();
}

function getPolifylsWatch() {
    if (!src.scripts.isPolifyls()) {
        return;
    }
    return [...src.scripts.getAllPolifyls().map(file => path.resolve(path.dirname(file), '**/*.{js,ts}'))];
}

function getVendorsWatch() {
    if (src.scripts.isTsVendors()) {
        return [...src.scripts.getTsVendors().map(file => path.resolve(path.dirname(file), '**/*.{js,ts}'))];
    }
    if (src.scripts.isJsVendors()) {
        return [...src.scripts.getJsVendors().map(file => path.resolve(path.dirname(file), '**/*.{js,ts}'))];
    }
}

function getCssWatch() {
    return src.getStyleFiles();
}

function getJsWatch() {
    if (isAngular || src.scripts.isModuleScript()) {
        return;
    }
    return src.scripts.getJsFiles();
}