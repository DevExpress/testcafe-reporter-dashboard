var gulp    = require('gulp');
var eslint  = require('gulp-eslint');
var del     = require('del');

var gulpTypeScript = require('gulp-typescript');

function clean (cb) {
    del('lib', cb);
}

function lint () {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
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
exports.lint = lint;
exports.test = gulp.series(clean, lint, build);
exports.build = gulp.series(clean, build);
exports.preview = gulp.series(clean, lint, build, preview);
