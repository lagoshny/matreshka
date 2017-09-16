const path = require('path');
const fs = require('fs');
const userConf = require('../../build.config');

/* Setup path for project's folders */
const currDir = process.env.PWD ? process.env.PWD : __dirname;

const testSuffix = 'test';

/* Setup path and name for manifests files */
const manifests = {
    dirName: 'manifest',
    fileNames: {
        css: 'css',
        js: 'js',
        img: 'img',
        provided: 'provided'
    }
};

/* Setup path and name for lints configuration and cache */
const lintsConf = {
    dirName: 'lints',
    fileNames: {
        css: 'csslint',
        js: 'eslint',
        ts: 'tslint',
    }
};


const defConf = {
    get mainDir() {
        return path.resolve(currDir, './main');
    },
    get mainNameDir() {
        return './main';
    },
    get srcDir() {
        return path.resolve(this.mainDir, './src');
    },
    get srcHtmlDir() {
        return path.resolve(this.srcDir, './');
    },
    get srcHtmlFiles() {
        return path.resolve(this.srcDir, './*.html');
    },
    get srcImgExt() {
        return '{jpg,png,svg}';
    },
    get srcImgDir() {
        return path.resolve(this.srcDir, './img');
    },
    get srcImgFiles() {
        return path.resolve(this.srcDir, `./img/**/*.${this.srcImgExt}`);
    },
    get srcFontsExt() {
        return '{eot,svg,ttf,woff}';
    },
    get srcFontsDir() {
        return path.resolve(this.srcDir, `./fonts`);
    },
    get srcFontsFiles() {
        return path.resolve(this.srcDir, `./fonts/**/*.${this.srcFontsExt}`);
    },
    get srcCommonStylDir() {
        return path.resolve(this.srcDir, './styles');
    },
    get srcCommonStylName() {
        return 'styles.css';
    },
    get srcCssDir() {
        return path.resolve(this.srcDir, './css');
    },
    get cssProjectNeedBuilding() {
        return (getProperty(userConf, 'entries.css.styles') !== undefined) || (getProperty(userConf, 'entries.css.commonStyles') !== undefined);
    },
    get cssNeedLinting() {
        return this.cssProjectNeedBuilding;
    },
    get srcJsDir() {
        return this.srcDir;
    },
    get srcSpecDir() {
        return this.srcDir;
    },
    get jsProjectNeedBuilding() {
        return getProperty(userConf, 'entries.scripts.js') !== undefined;
    },
    get jsNeedLinting() {
        return this.jsProjectNeedBuilding;
    },
    get srcTsDir() {
        return this.srcDir;
    },
    get tsProjectNeedBuilding() {
        return getProperty(userConf, 'entries.scripts.ts') !== undefined;
    },
    get tsNeedLinting() {
        return this.tsProjectNeedBuilding;
    },
    get srcResourcesExt() {
        return '{ico}';
    },
    get srcResourcesDir() {
        return path.resolve(this.srcDir, './');
    },
    get srcResourcesFiles() {
        return path.resolve(this.srcDir, `./**/*.${this.srcResourcesExt}`);
    },

    get buildsDir() {
        return path.resolve(this.mainDir, './builds');
    },

    get buildsNameDir() {
        return './builds';
    },

    get devDir() {
        return path.resolve(this.buildsDir, './development');
    },

    get devNameDir() {
        return './development';
    },
    get devHtmlDir() {
        return path.resolve(this.devDir, './');
    },
    get devImgDir() {
        return path.resolve(this.devDir, './img');
    },
    get devFontsDir() {
        return path.resolve(this.devDir, './fonts');
    },
    get devCssDir() {
        return path.resolve(this.devDir, './css');
    },
    get devJsDir() {
        return path.resolve(this.devDir, './js');
    },
    get devPublicPath() {
        return /js/;
    },
    get devResourcesDir() {
        return path.resolve(this.devDir, './');
    },

    get prodDir() {
        return path.resolve(this.buildsDir, './production');
    },
    get prodNameDir() {
        return './production';
    },
    get prodHtmlDir() {
        return path.resolve(this.prodDir, './');
    },
    get prodImgDir() {
        return path.resolve(this.prodDir, './img');
    },
    get prodFontsDir() {
        return path.resolve(this.prodDir, './fonts');
    },
    get prodCssDir() {
        return path.resolve(this.prodDir, './css');
    },
    get prodJsDir() {
        return path.resolve(this.prodDir, './js');
    },
    get prodPublicPath() {
        return /js/;
    },
    get prodResourcesDir() {
        return path.resolve(this.prodDir, './');
    },
    get tempDir() {
        return path.resolve(this.buildsDir, './tmp');
    },
    get typeScriptConf() {
        return 'tsconfig.json';
    },
    get libVendorDir() {
        return path.resolve(this.srcDir, 'provided');
    },
    get libVendorsHandle() {
        return false;
    },
    get libPolifylsDir() {
        return path.resolve(this.srcDir, 'provided');
    },
    get libPolifylsHandle() {
        return false;
    },
    get angularInlineTemplate() {
        return true;
    },
    get angularInlineStyles() {
        return false;
    },
    get lazyRoute() {
        return false;
    },
    get redirectToIndex() {
        return false;
    },
    get modulesHandle() {
        return false;
    },
    get baseUrl() {
        return "";
    }
};

const buildWebpackFile = 'webpack.config.js';
const buildWebpackDllFile = 'webpack.dll.config.js';
const buildWebpackTestFile = 'webpack.test.config.js';
const buildKarmaFile = 'karma.conf.js';
const configsDirName = 'configs';
const configsMainDir = path.resolve(currDir, configsDirName);
const configsBuildDir = 'builds';
const configsLintsDir = path.resolve(currDir, configsMainDir, lintsConf.dirName);

(function checkExistsConfigs() {
    if (!fs.existsSync(path.resolve(configsMainDir, configsBuildDir, buildWebpackFile)) ||
        !fs.existsSync(path.resolve(configsMainDir, configsBuildDir, buildWebpackDllFile))) {
        console.log('Файлы конфигурации не были обнаружены! ');
        throw new Error('Файлы конфигурации не были обнаружены!');
    }
})();


const linting = {
    get css() {
        if (getProperty(userConf, 'linting.css') !== undefined) {
            return userConf.linting.css;
        }
        return defConf.cssNeedLinting;
    },
    get js() {
        if (getProperty(userConf, 'linting.js') !== undefined) {
            return userConf.linting.js;
        }
        return defConf.jsNeedLinting;
    },
    get ts() {
        if (getProperty(userConf, 'linting.ts') !== undefined) {
            return userConf.linting.ts;
        }
        return defConf.tsNeedLinting;
    }
};

exports.constants = {
  testSuffix: testSuffix
};

exports.server = {
    get baseUrl() {
        return getProperty(userConf, 'server.baseUrl') || defConf.baseUrl;
    }
};

const ucDirs = userConf.structure;
const rootDirsProp = "structure.main";
exports.folders = {
    main: {
        get dir() {
            return getProperty(userConf, `${rootDirsProp}.dir`) ? path.resolve(currDir, ucDirs.main.dir) : defConf.mainDir
        },
        get nameDir() {
            return getProperty(userConf, `${rootDirsProp}.dir`) ? ucDirs.main.dir : defConf.mainNameDir;
        },
        src: {
            get dir() {
                return getProperty(userConf, `${rootDirsProp}.src.dir`) ? path.resolve(exports.folders.main.dir, ucDirs.main.src.dir) : defConf.srcDir;
            }
        },
        builds: {
            get dir() {
                return getProperty(userConf, `${rootDirsProp}.builds.dir`)
                    ? path.resolve(exports.folders.main.dir, ucDirs.main.builds.dir) : defConf.buildsDir
            },
            get nameDir() {
                return getProperty(userConf, `${rootDirsProp}.builds.dir`)
                    ? ucDirs.main.builds.dir : defConf.buildsNameDir;
            },
            temp: {
                get dir() {
                    return getProperty(userConf, `${rootDirsProp}.builds.temp`)
                        ? path.resolve(exports.folders.main.builds.dir, ucDirs.main.builds.temp) : defConf.tempDir
                },
                get cache() {
                    return path.resolve(this.dir, 'cache');
                },
                get vendors() {
                    return path.resolve(this.cache, 'vendors');
                },
                get spec() {
                    return path.resolve(this.dir, 'tests');
                }
            },

            dev: {
                get dir() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.dir`)
                        ? path.resolve(exports.folders.main.builds.dir, ucDirs.main.builds.dev.dir) : defConf.devDir
                },
                get nameDir() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.dir`)
                        ? ucDirs.main.builds.dev.dir : defConf.devNameDir;
                },
                get publicPath() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.js`)
                        ? `/${ucDirs.main.builds.dev.js}/` : defConf.devPublicPath;
                },
                get html() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.html`)
                        ? path.resolve(this.dir, ucDirs.main.builds.dev.html) : defConf.devHtmlDir
                },
                get img() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.img`)
                        ? path.resolve(this.dir, ucDirs.main.builds.dev.img) : defConf.devImgDir
                },
                get fonts() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.fonts`)
                        ? path.resolve(this.dir, ucDirs.main.builds.dev.fonts) : defConf.devFontsDir
                },
                get css() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.css`)
                        ? path.resolve(this.dir, ucDirs.main.builds.dev.css) : defConf.devCssDir
                },
                get cssFiles() {
                    if (exports.entries.css.out) {
                        return [path.resolve(this.css, `${exports.entries.css.out}.css`)];
                    }
                    let cssCommonFileNames = exports.entries.css.commonStyles.replace(path.dirname(exports.entries.css.commonStyles), this.css);
                    let cssFileNames = exports.entries.css.files.map(file => file.replace(path.dirname(file), this.css));
                    return [...cssCommonFileNames, ...cssFileNames];
                },
                get js() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.js`)
                        ? path.resolve(this.dir, ucDirs.main.builds.dev.js) : defConf.devJsDir
                },
                get jsFiles() {
                    if (exports.entries.scripts.out) {
                        return [path.resolve(this.js, `${exports.entries.scripts.out}.js`)];
                    }
                    if (exports.entries.libs.polifyls.handle) {
                        return [path.resolve(this.js, `${exports.entries.scripts.polyfillsOut}.js`)];
                    }
                    let tsFileNames = exports.entries.scripts.ts.files.map(file => file.replace(path.dirname(file), this.js).replace('.ts', '.js'));
                    let jsFileNames = exports.entries.scripts.js.files.map(file => file.replace(path.dirname(file), this.js));
                    return [...tsFileNames, ...jsFileNames];
                },
                get polyfillsFiles() {
                    if (exports.entries.libs.polifyls.out) {
                        return [path.resolve(this.js, `${exports.entries.libs.polifyls.out}.js`)];
                    }
                    let polyfillsFileNames = exports.entries.libs.polifyls.files.map(file => file.replace(path.dirname(file), this.js).replace('.ts', '.js'));
                    return [...polyfillsFileNames];
                },
                get vendorsFiles() {
                    if (exports.entries.libs.scripts.out) {
                        return [path.resolve(this.js, `${exports.entries.libs.scripts.out}.js`)];
                    }
                    let vendorsFileNames = exports.entries.libs.scripts.files.map(file => file.replace(path.dirname(file), this.js).replace('.ts', '.js'));
                    return [...vendorsFileNames];
                },
                get resources() {
                    return getProperty(userConf, `${rootDirsProp}.builds.dev.resources`)
                        ? path.resolve(this.dir, ucDirs.main.builds.dev.resources) : defConf.devResourcesDir
                }
            },
            prod: {
                get dir() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.dir`)
                        ? path.resolve(exports.folders.main.builds.dir, ucDirs.main.builds.prod.dir) : defConf.prodDir
                },
                get nameDir() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.dir`)
                        ? ucDirs.main.builds.prod.dir : defConf.prodNameDir;
                },
                get publicPath() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.js`)
                        ? `/${ucDirs.main.builds.prod.js}/` : defConf.prodPublicPath;
                },
                get html() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.html`)
                        ? path.resolve(this.dir, ucDirs.main.builds.prod.html) : defConf.prodHtmlDir
                },
                get img() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.img`)
                        ? path.resolve(this.dir, ucDirs.main.builds.prod.img) : defConf.prodImgDir
                },
                get fonts() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.fonts`)
                        ? path.resolve(this.dir, ucDirs.main.builds.prod.fonts) : defConf.prodFontsDir
                },
                get css() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.css`)
                        ? path.resolve(this.dir, ucDirs.main.builds.prod.css) : defConf.prodCssDir
                },
                get cssFiles() {
                    if (exports.entries.css.out) {
                        return [path.resolve(this.css, `${exports.entries.css.out}-*.css`)];
                    }
                    let cssCommonFileNames = exports.entries.css.commonStyles.replace(path.dirname(exports.entries.css.commonStyles), this.css).replace('.css', '-*.css');
                    let cssFileNames = exports.entries.css.files.map(file => file.replace(path.dirname(file), this.css).replace('.css', '-*.css'));
                    return [...cssCommonFileNames, ...cssFileNames];
                },
                get js() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.js`)
                        ? path.resolve(this.dir, ucDirs.main.builds.prod.js) : defConf.prodJsDir
                },
                get jsFiles() {
                    if (exports.entries.scripts.out) {
                        return [path.resolve(this.js, `${exports.entries.scripts.out}.js`)];
                    }
                    let tsFileNames = exports.entries.scripts.ts.files.map(file => file.replace(path.dirname(file), this.js).replace('.ts', '-*.js'));
                    let jsFileNames = exports.entries.scripts.js.files.map(file => file.replace(path.dirname(file), this.js).replace('.js', '-*.js'));
                    return [...tsFileNames, ...jsFileNames];
                },
                get polyfillsFiles() {
                    if (exports.entries.libs.polifyls.out) {
                        return [path.resolve(this.js, `${exports.entries.libs.polifyls.out}.js`)];
                    }
                    let polyfillsFileNames = exports.entries.libs.polifyls.files.map(file => file.replace(path.dirname(file), this.js).replace('.ts', '-*.js'));
                    return [...polyfillsFileNames];
                },
                get vendorsFiles() {
                    if (exports.entries.libs.scripts.out) {
                        return [path.resolve(this.js, `${exports.entries.libs.scripts.out}.js`)];
                    }
                    let vendorsFileNames = exports.entries.libs.scripts.files.map(file => file.replace(path.dirname(file), this.js).replace('.ts', '-*.js'));
                    return [...vendorsFileNames];
                },
                get resources() {
                    return getProperty(userConf, `${rootDirsProp}.builds.prod.resources`)
                        ? path.resolve(this.dir, ucDirs.main.builds.prod.resources) : defConf.prodResourcesDir
                }
            }
        }
    },
    configs: {
        dirName: configsDirName,
        path: configsMainDir,
        utils: path.resolve(configsMainDir, 'utils'),
        karmaConfig: path.resolve(configsMainDir, `builds/${buildKarmaFile}`),
        webpackConf: path.resolve(configsMainDir, `builds/${buildWebpackFile}`),
        webpackLibsConf: path.resolve(configsMainDir, `builds/${buildWebpackDllFile}`),
        webpackTestConf: path.resolve(configsMainDir, `builds/${buildWebpackTestFile}`)
    },
    dependencies: {
        node: path.resolve(currDir, 'node_modules'),
    }
};

const cacheVendorsDir = path.resolve(exports.folders.main.builds.temp.cache, 'vendors');
const manifestDir = path.resolve(exports.folders.main.builds.temp.dir, manifests.dirName);
const cacheLintsDir = path.resolve(exports.folders.main.builds.temp.cache, lintsConf.dirName);

exports.entries = {
    html: {
        get files() {
            return getProperty(userConf, 'entries.html')
                ? getArrayPathsAsString(userConf.entries.html, defConf.srcHtmlDir, 'html') : [defConf.srcHtmlFiles];
        }
    },
    img: {
        get files() {
            return getProperty(userConf, 'entries.img')
                ? getArrayPathsAsString(userConf.entries.img, defConf.srcImgDir, defConf.srcImgExt) : [defConf.srcImgFiles];
        }
    },
    fonts: {
        get files() {
            return getProperty(userConf, 'entries.fonts')
                ? getArrayPathsAsString(userConf.entries.fonts, defConf.srcFontsDir, defConf.srcFontsExt) : [defConf.srcFontsFiles];
        }
    },

    css: {
        get handle() {
            return !!(this.files && this.files.length > 0)
        },
        get out() {
            return (getProperty(userConf, 'entries.css.out') !== undefined)
                ? userConf.entries.css.out.replace(/\.[^.]+$/, "") : "";
        },
        get commonStyles() {
            if (!getProperty(userConf, 'entries.css.commonStyles')) {
                return;
            }
            let dir = getProperty(userConf, 'entries.css.commonStyles.dir') || defConf.srcCommonStylDir;
            let name = getProperty(userConf, 'entries.css.commonStyles.fileName') || defConf.srcCommonStylName;
            return path.resolve(exports.folders.main.src.dir, dir, name);
        },
        get files() {
            return getProperty(userConf, 'entries.css.styles')
                ? getArrayPathsAsString(userConf.entries.css.styles, defConf.srcCssDir, 'css') : [];
        }
    },
    scripts: {
        get modules() {
            if (exports.entries.scripts.ts.files.length > 0) {
                return true;
            }
            return (getProperty(userConf, 'entries.scripts.modules') !== undefined)
                ? userConf.entries.scripts.modules : defConf.modulesHandle;
        },
        get out() {
            return (getProperty(userConf, 'entries.scripts.out') !== undefined)
                ? userConf.entries.scripts.out.replace(/\.[^.]+$/, "") : "";
        },
        get polyfillsOut() {
            if (exports.entries.scripts.out) {
                return exports.entries.scripts.out;
            }
            return 'main';
        },
        spec: {
            out: 'main.test',
            get handle() {
                if (process.env.npm_config_test || (process.env.npm_config_test && process.env.npm_config_test === 'tdd')) {
                    return !!getProperty(userConf, 'entries.scripts.spec');
                }
                return false;
            },
            get tdd() {
                if (process.env.npm_config_test && process.env.npm_config_test === 'tdd') {
                    return !!getProperty(userConf, 'entries.scripts.spec');
                }
                return false;
            },
            get files() {
                if (getProperty(userConf, 'entries.scripts.spec')) {
                    if (exports.entries.scripts.ts.handle && exports.entries.scripts.js.handle) {
                        return getArrayPathsAsString(userConf.entries.scripts.spec, defConf.srcSpecDir, 'spec.js|spec.ts');
                    }
                    if (exports.entries.scripts.ts.handle) {
                        return getArrayPathsAsString(userConf.entries.scripts.spec, defConf.srcSpecDir, 'spec.ts');
                    }
                    if (exports.entries.scripts.js.handle) {
                        return getArrayPathsAsString(userConf.entries.scripts.spec, defConf.srcSpecDir, 'spec.js');
                    }
                }
                return [];
            },
            get allTestFiles() {
                return path.resolve(exports.folders.main.builds.temp.spec, '**/*.js')
            },
            get builded() {
                if (this.handle) {
                    let files = [
                        ...exports.entries.libs.polifyls.test.map(
                            (file) => file.replace(path.dirname(file), exports.folders.main.builds.temp.vendors).replace('.ts', '.js')),
                        ...exports.entries.libs.scripts.files.map(
                            (file) => file.replace(path.dirname(file), exports.folders.main.builds.temp.vendors).replace('.ts', '.js')),
                        ...exports.entries.scripts.ts.test.map(
                            (file) => file.replace(path.dirname(file), exports.folders.main.builds.temp.spec).replace('.ts', '.js')),
                        // ...exports.entries.libs.scripts.files.map(
                        //     (file) => file.replace(path.dirname(file), exports.folders.main.builds.dev.js).replace('.ts', '.js')),
                        // path.resolve(exports.folders.main.builds.temp.spec, 'aaa.js')
                    ];
                    files.push(...this.files.map(file => file.replace(path.dirname(file), exports.folders.main.builds.temp.spec).replace('.ts', '.js')));
                    return files.filter((entry) => /[^undefined]\S/.test(entry));
                }
                return [];
            }
        },
        js: {
            get handle() {
                return this.files.length > 0;
            },
            get files() {
                if (getProperty(userConf, 'entries.scripts.js')) {
                    let jsFiles = getArrayPathsAsString(userConf.entries.scripts.js, defConf.srcJsDir, 'js');
                    if (!exports.entries.scripts.spec.handle) {
                        jsFiles.push(`!${path.resolve(exports.folders.main.dir, '**/*.spec.js')}`);
                    }
                    return jsFiles;
                }
                return [];
            },
            get test() {
                return getProperty(userConf, 'entries.scripts.ts')
                    ? getArrayPathsAsString(userConf.entries.scripts.js, defConf.srcJsDir, 'js').filter(file => file.includes(testSuffix))
                    : [];
            }
        },
        ts: {
            get handle() {
                return this.files.length > 0;
            },
            get all() {
                return getProperty(userConf, 'entries.scripts.ts')
                    ? getArrayPathsAsString(userConf.entries.scripts.ts, defConf.srcTsDir, 'ts')
                    : [];
            },
            get files() {
                if (getProperty(userConf, 'entries.scripts.ts')) {
                    let tsFiles = getArrayPathsAsString(userConf.entries.scripts.ts, defConf.srcTsDir, 'ts');
                    if (!exports.entries.scripts.spec.handle) {
                        tsFiles.push(`!${path.resolve(exports.folders.main.dir, '**/*.spec.ts')}`);
                    }
                    return tsFiles.filter(file => !file.includes(`.${testSuffix}.`));
                }
                return [];
            },
            get test() {
                return getProperty(userConf, 'entries.scripts.ts')
                    ? getArrayPathsAsString(userConf.entries.scripts.ts, defConf.srcTsDir, 'ts').filter(file => file.includes(`.${testSuffix}.`))
                    : [];
            }
        }
    },
    libs: {
        cache: {
            dir: cacheVendorsDir,
            get polifylsModify() {
                return path.resolve(this.dir, 'polifyls.cache.json')
            },
            get vendorsModify() {
                return path.resolve(this.dir, 'vendors.cache.json')
            }
        },
        polifyls: {
            get handle() {
                return (this.files && this.files.length > 0)
                    ? true : defConf.libPolifylsHandle;
            },
            get out() {
                return (getProperty(userConf, 'entries.libs.polifyls.out') !== undefined)
                    ? userConf.entries.libs.polifyls.out.replace(/\.[^.]+$/, "") : "";
            },
            get dir() {
                return (getProperty(userConf, 'entries.libs.polifyls.dir') !== undefined)
                    ? path.resolve(exports.folders.main.src.dir, userConf.entries.libs.polifyls.dir) : defConf.libPolifylsDir;
            },
            get all() {
                if (getProperty(userConf, 'entries.libs.polifyls.files') !== undefined) {
                    if (Array.isArray(userConf.entries.libs.polifyls.files) && userConf.entries.libs.polifyls.files.length > 0) {
                        return userConf.entries.libs.polifyls.files.map(function (file) {
                            if (!/\.js$/.test(file) && !/\.ts$/.test(file)) {
                                let ext = '.ts';
                                if (exports.entries.scripts.js.handle && !exports.entries.scripts.ts.handle) {
                                    ext = '.js';
                                }
                                if (!exports.entries.scripts.js.handle && exports.entries.scripts.ts.handle) {
                                    ext = '.ts';
                                }
                                return path.resolve(exports.entries.libs.polifyls.dir, `${file}${ext}`);
                            }
                            return path.resolve(exports.entries.libs.polifyls.dir, `${file}`);
                        })
                    }
                }
                return [];
            },
            get files() {
                return this.all && this.all.length > 0 ? this.all.filter(file => !file.includes(`.${testSuffix}.`)) : [];
            },
            get test() {
                return this.all && this.all.length > 0 ? this.all.filter(file => file.includes(`.${testSuffix}.`)) : [];
            }
        },
        scripts: {
            get handle() {
                return (this.files && this.files.length > 0)
                    ? true : defConf.libVendorsHandle;
            },
            get out() {
                return (getProperty(userConf, 'entries.libs.scripts.out') !== undefined)
                    ? userConf.entries.libs.scripts.out.replace(/\.[^.]+$/, "") : "";
            },
            get dir() {
                return (getProperty(userConf, 'entries.libs.scripts.dir') !== undefined)
                    ? path.resolve(exports.folders.main.src.dir, userConf.entries.libs.scripts.dir) : defConf.libVendorDir;
            },
            get files() {
                if (getProperty(userConf, 'entries.libs.scripts.files') !== undefined) {
                    if (Array.isArray(userConf.entries.libs.scripts.files) && userConf.entries.libs.scripts.files.length > 0) {
                        return userConf.entries.libs.scripts.files.map(function (file) {
                            if (!/\.js$/.test(file) && !/\.ts$/.test(file)) {
                                let ext = '.ts';
                                if (exports.entries.scripts.js.handle && !exports.entries.scripts.ts.handle) {
                                    ext = '.js';
                                }
                                if (!exports.entries.scripts.js.handle && exports.entries.scripts.ts.handle) {
                                    ext = '.ts';
                                }
                                return path.resolve(exports.entries.libs.scripts.dir, `${file}${ext}`);
                            }
                            return path.resolve(exports.entries.libs.scripts.dir, `${file}`);
                        })
                    }
                }
                return [];
            }
        },
        styles: {
            get dir() {
                return (getProperty(userConf, 'entries.libs.styles.dir') !== undefined)
                    ? path.resolve(exports.folders.main.src.dir, userConf.entries.libs.styles.dir) : defConf.libVendorDir;
            },
            get files() {
                if (getProperty(userConf, 'entries.libs.styles.files') !== undefined) {
                    if (Array.isArray(userConf.entries.libs.styles.files) && userConf.entries.libs.styles.files.length > 0) {
                        return userConf.entries.libs.styles.files.map(function (file) {
                            if (!/\.css$/.test(file)) {
                                let ext = '.css';
                                return path.resolve(exports.entries.libs.styles.dir, `${file}${ext}`);
                            }
                            return path.resolve(exports.entries.libs.styles.dir, `${file}`);
                        })
                    }
                }
                return [];
            }
        }
    },

    resources: {
        get files() {
            return getProperty(userConf, 'entries.resources')
                ? getArrayPathsAsString(userConf.entries.resources, defConf.srcResourcesDir, defConf.srcResourcesExt) : [defConf.srcResourcesFiles];
        }
    }
};

exports.angular = {
    get inlineTemplate() {
        return (getProperty(userConf, 'angular.inlineTemplate'))
            ? userConf.angular.inlineTemplate : defConf.angularInlineTemplate;
    },
    get inlineStyles() {
        return (getProperty(userConf, 'angular.inlineStyles'))
            ? userConf.angular.inlineStyles : defConf.angularInlineStyles;
    },
    get lazyRoute() {
        return (getProperty(userConf, 'angular.lazyRoute'))
            ? userConf.angular.lazyRoute : defConf.lazyRoute;
    },
    get redirectToIndex() {
        return (getProperty(userConf, 'angular.redirectToIndex'))
            ? userConf.angular.redirectToIndex : defConf.redirectToIndex;
    }
};

exports.cacheName = {
    html: 'html',
    img: 'images',
    fonts: 'fonts',
    css: 'css',
    js: 'js',
    polifyls: 'polifyls',
    vendors: 'vendors',
    ts: 'ts',
    test: 'test',
    resources: 'resources'
};

exports.tsConf = getProperty(userConf, 'typeScript.configFile')
    ? userConf.typeScript.configFile : defConf.typeScriptConf;


exports.watchDirs = {
    dev: path.resolve(exports.folders.main.builds.dev.dir, '**/*.*'),
    html: exports.entries.html.files,
    img: exports.entries.img.files,
    fonts: exports.entries.fonts.files,
    get polifyls() {
        if (!exports.entries.libs.polifyls.handle) {
            return;
        }
        return [...exports.entries.libs.polifyls.files.map(file => path.resolve(path.dirname(file), '**/*.{js,ts}'))]
    },
    get vendors() {
        if (!exports.entries.libs.scripts.handle) {
            return;
        }
        return [...exports.entries.libs.scripts.files.map(file => path.resolve(path.dirname(file), '**/*.{js,ts}'))]
    },
    get css() {
        if (!exports.entries.css.handle && !exports.entries.css.commonStyles && !exports.entries.libs.styles.files) {
            return;
        }
        return [
            ...exports.entries.css.files.map(file => path.resolve(path.dirname(file), '**/*.css')),
            exports.entries.css.commonStyles,
            `${path.resolve(exports.entries.libs.styles.dir, '**/*.css')}`
        ].filter((entry) => /[^undefined]\S/.test(entry));
    },
    get js() {
        if (!exports.entries.scripts.js.handle || exports.entries.scripts.modules) {
            return;
        }
        return [...exports.entries.scripts.js.files.map(file => path.resolve(path.dirname(file), '**/*.js'))];
    },
    test: exports.entries.scripts.spec.files,
    resources: exports.folders.main.src.resources
};

exports.lints = {
    cachesDir: cacheLintsDir,
    configsDir: configsLintsDir,
    css: {
        get files() {
            if (!linting.css) {
                return;
            }
            return exports.entries.css.files;
        },
        result: {},
        get cacheFile() {
            return path.resolve(exports.lints.cachesDir, lintsConf.fileNames.css + '.cache.json');
        },
        get configFile() {
            return path.resolve(exports.lints.configsDir, lintsConf.fileNames.css + '.config.json');
        }
    },
    js: {
        get files() {
            if (!linting.js) {
                return;
            }
            return [...exports.entries.scripts.js.files, `!${path.resolve(exports.folders.main.dir, '**/*.spec.js')}`];
        },
        result: {},
        get cacheFile() {
            return path.resolve(exports.lints.cachesDir, lintsConf.fileNames.js + '.cache.json');
        },
        get configFile() {
            return path.resolve(exports.lints.configsDir, lintsConf.fileNames.js + '.config.json');
        }
    },
    ts: {
        get files() {
            if (!linting.ts) {
                return;
            }
            return [...exports.entries.scripts.ts.files, `!${path.resolve(exports.folders.main.dir, '**/*.spec.ts')}`];
        },
        result: {},
        get cacheFile() {
            return path.resolve(exports.lints.cachesDir, lintsConf.fileNames.ts + '.cache.json');
        },
        get configFile() {
            return path.resolve(exports.lints.configsDir, lintsConf.fileNames.ts + '.config.json');
        }
    }
};

exports.manifest = {
    get dir() {
        return manifestDir
    },
    css: {
        get path() {
            return exports.manifest.dir
        },
        get name() {
            return manifests.fileNames.css + '.manifest.json'
        },
        get file() {
            return path.resolve(this.path, manifests.fileNames.css + '.manifest.json')
        }
    },
    img: {
        get path() {
            return exports.manifest.dir
        },
        get name() {
            return manifests.fileNames.img + '.manifest.json'
        },
        get file() {
            return path.resolve(this.path, manifests.fileNames.img + '.manifest.json')
        }
    },
    js: {
        get path() {
            return exports.manifest.dir
        },
        get name() {
            return manifests.fileNames.js + '.manifest.json'
        },
        get file() {
            return path.resolve(this.path, manifests.fileNames.js + '.manifest.json')
        }
    },
    provided: {
        get path() {
            return exports.manifest.dir
        },
        get name() {
            return manifests.fileNames.provided + '.manifest.json'
        },
        get file() {
            return path.resolve(this.path, manifests.fileNames.provided + '.manifest.json')
        }
    }
};


// console.log('TS: ' + JSON.stringify(exports.entries.scripts.ts.files, null, 2));
// console.log('SPEC TS: ' + JSON.stringify(exports.entries.scripts.spec.files, null, 2));
// console.log('SRC: ' + JSON.stringify(exports.folders.main.src, null, 2));
// console.log('ANGULAR: ' + JSON.stringify(exports.angular, null, 2));
// console.log('ENTRIES: ' + JSON.stringify(exports.entries, null, 2));
// console.log('entries' + JSON.stringify(exports.entries, null, 2));
// console.log('LINTING' + JSON.stringify(linting, null, 2));

function getArrayPathsAsString(arrayOfFileObjects, defDir, defExt) {
    if (arrayOfFileObjects && Array.isArray(arrayOfFileObjects) && arrayOfFileObjects.length > 0) {
        let result = [];
        for (let fileObject of arrayOfFileObjects) {
            let dir = fileObject.dir || defDir;
            let ext = fileObject.extensions || defExt;
            if (fileObject.files && Array.isArray(fileObject.files) && fileObject.files.length > 0) {
                result.push(...fileObject.files.map(function (file) {
                    let extMatcher = new RegExp(`.${ext}$`);
                    if (extMatcher.test(file)) {
                        return path.resolve(exports.folders.main.src.dir, dir, file)
                    }
                    return path.resolve(exports.folders.main.src.dir, dir, `${file}.${ext.split('|')[0]}`);
                }))
            } else {
                result.push(path.resolve(exports.folders.main.src.dir, dir, `*.${ext}`));
            }
        }
        return result;
    }
}

function getProperty(obj, prop) {
    return prop.split('.')
        .reduce(function (m, i) {
            return m && typeof m === 'object' ? m[i] : undefined;
        }, obj);
}