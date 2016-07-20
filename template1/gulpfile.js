/**
* gulp  
* @date 2016-06-27 11:00:24
* @author Allenice <994298628@qq.com>
* @link http://www.allenice233.com
*/

'use strict'

var gulp = require('gulp'),
    runSequence = require('run-sequence').use(gulp),
    plugins = require('gulp-load-plugins')(),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config'),
    del = require('del'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload
    ;

var isProd = process.env.NODE_ENV === 'prod';

var assets = {
    styles: {
        basePath: './src/sass/',
        src: './src/sass/**/*.scss',
        dest: './build/dev/assets/css/'
    },

    html: {
        src: './src/tpl/**/*.html',
        dest: './build/dev/'
    },

    scripts: {
        entries: entries,
        src: './src/js/**/*.coffee',
        output: './build/dev/assets/js/'
    },

    img: {
        basePath: './src/img/',
        src: './src/img/**',
        dest: './build/dev/assets/img/'
    }
}

// 如果是 build 产品模式，修改目标路径
if (isProd) {
    assets.styles.dest = './build/prod/assets/css/';
    assets.html.dest = './build/prod/';
    assets.scripts.output = './build/prod/assets/js';
    assets.img.dest = './build/prod/assets/img';

    // 删除之前的
    del.sync([path.join(__dirname, './build/prod/**')]);
}


var processors = [
    require('autoprefixer')({
        browsers: ['last 2 versions']
    }),
    require('postcss-assets')({
        relative: isProd ? true : assets.styles.dest,
        loadPaths: [assets.img.basePath]
    }),
    require('postcss-at2x')()
];

var processorsProd = [];

processorsProd = processorsProd.concat(processors, [
    require('postcss-sprites').default({
        stylesheetPath: assets.styles.basePath,
        spritePath: assets.img.basePath + 'dist',
        retina: true,
        filterBy: function(img) {
            if (/sprites\//.test(img.url)) {
                return Promise.resolve();
            }

            return Promise.reject();
        }
    })
]);

gulp.task('sass', function() {
    
    return gulp.src(assets.styles.src)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass.sync({
            includePaths: [ assets.styles.basePath + 'env/dev']
        }).on('error', plugins.sass.logError))
        .pipe(plugins.postcss(processors))
        .pipe(plugins.sourcemaps.write('./', {sourceRoot: '../sass'}))
        .pipe(gulp.dest(assets.styles.dest))
        .pipe(plugins.filter('**/*.css'))
        .pipe(reload({stream: true}))
        ;
});

// product
gulp.task('sass:prod', function() {

    return gulp.src(assets.styles.src)
        .pipe(plugins.sass.sync({
            outputStyle: 'compressed',
            includePaths: [assets.styles.basePath + 'env/prod']
        }).on('error', plugins.sass.logError))
        .pipe(plugins.postcss(processorsProd))
        .pipe(gulp.dest(assets.styles.dest));
});

gulp.task('assets:img', function() {
    return gulp.src([
            assets.img.src,
            '!' + assets.img.basePath + 'sprites/**/**.*'
        ])
        .pipe(gulp.dest(assets.img.dest))
});

gulp.task('assets', ['assets:img']);

// webpack 
webpackConfig.output.path = assets.scripts.output;

if (isProd) {
    webpackConfig.output.filename = '[name].[chunkhash].js';
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
}

var statsData = {}
gulp.task('webpack', function(callback) {

    webpack(webpackConfig, function(err, stats) {
        if (err) {
            console.log(err);
            return false
        }

        statsData = stats.toJson();
        console.log(statsData);

        callback();
    });
});

// html
var assetsPath = {
    css: './assets/css',
    js: './assets/js',
    img: isProd ? './assets/img' : '../../src/img'
}

console.log(assetsPath);
gulp.task('html', function() {

    return gulp.src([
            assets.html.src,
            '!src/tpl/base/**/**.html',
            '!src/tpl/include/**/**.html'
        ])
        .pipe(plugins.nunjucks.compile({
            stats: statsData,
            assets: assetsPath
        }, {
        }))
        .pipe(plugins.prettify({
            indent_size: 4,
            indent_char: " ",
            indent_with_tabs: false,
            preserve_newlines: true,
            max_preserve_newlines: 1,
            wrap_line_length: 0,
            indent_inner_html: false,
            brace_style: "collapse"
        }))
        .pipe(gulp.dest(assets.html.dest))
});

gulp.task('default', function(callback) {
    runSequence('sass', 'webpack', 'html', function() {
        // browserSync.init({
        //     server: "./",
        //     port: 3002
        // });
        gulp.watch(assets.styles.src, ['sass']);
        gulp.watch(assets.scripts.src, ['webpack']);
        gulp.watch(assets.html.src, ['html']);
        // gulp.watch(['build/dev/**/*.js', 'build/dev/**/*.html']).on('change', reload);
        callback();
    });
    
});

gulp.task('prod', function() {
    runSequence('sass:prod', 'assets', 'webpack', 'html');
});


