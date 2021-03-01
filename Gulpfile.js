var gulp    = require('gulp');
var del     = require('del');

var gulpTypeScript = require('gulp-typescript');

function clean (cb) {
    del('lib', cb);
}

function lint () {
    return gulp
        .src([
            'src/**/*.ts',
            'test/**/*.ts',
            'Gulpfile.js'
        ])
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function build () {
    const tsConfig = gulpTypeScript.createProject('tsconfig.json');

    return gulp
        .src('src/**/*.ts')
        .pipe(tsConfig())
        .pipe(gulp.dest('lib'));
}

function buildTypes () {
    const tsConfig = gulpTypeScript({declaration: true})

    return gulp
        .src('src/types/*.ts')
        .pipe(tsConfig).dts
        .pipe(gulp.dest('lib/types/'));
}

function preview () {
    var buildReporterPlugin = require('testcafe').embeddingUtils.buildReporterPlugin;
    var pluginFactory       = require('./lib');
    var reporterTestCalls   = require('./test/utils/reporter-test-calls');
    var plugin              = buildReporterPlugin(pluginFactory);

    console.log();

    reporterTestCalls.forEach(function (call) {
        plugin[call.method].apply(plugin, call.args);
    });

    process.exit(0);
}

exports.clean = clean;
exports.test = gulp.series(clean, build);
exports.build = gulp.series(clean, build, buildTypes);
exports.preview = gulp.series(clean, build, preview);
