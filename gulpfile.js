'use strict';
const gulp = require('gulp'),
    rimraf = require('rimraf'),
    sass = require('gulp-sass')(require('node-sass')),
    prefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    inlineCss = require('gulp-inline-css'),
    typograf = require('gulp-typograf'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    cssScss = require('gulp-css-scss'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;
const {stream} = require("browser-sync");

const path = {
        build:{
            html:'build/',
            assets:'build/assets/',
            css:'src/scss/',
            scss:'src/styles/'
        },
        src:{
            html:'src/*.{html,htm}',
            assets:'src/assets/**/*.*',
            css:'src/theme.css',
            scss:'src/scss/theme.scss'
        },
        watch:{
            html:'src/*.{html,htm}',
            assets:'src/assets/**/*.*',
        },
        clean:'build/'
    },
    config = {
        server:{
            baseDir:'build/',
            index:'nti.html'
        },
        tunnel:true,
        port:4201
    };

gulp.task('clean', function (done){
    rimraf(path.clean,done);
})

gulp.task('css:scss', function (done){
    gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(cssScss())
        .pipe(gulp.dest(path.build.css));
    done();
})

gulp.task('build:scss', function (done){
    gulp.src(path.src.scss)
        .pipe(plumber())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(gulp.dest(path.build.scss));
    done();
})


gulp.task('build:email', function (done){
    gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(inlineCss({
            applyStyleTags:true,
            applyLinkTags:true,
            removeStyleTags:true,
            removeLinkTags:true
        }))
        .pipe(typograf({
            locale: ['ru', 'en-US'],
            htmlEntity: { type: 'digit' }
        }))
        .pipe(htmlmin({
            collapseWhitespace:true,
            minifyCSS:true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream:true}));
    done();
})
gulp.task('mv:assets', function (done){
    gulp.src(path.src.assets)
        .pipe(plumber())
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 50, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {minifyStyles: true},
                    {cleanupIDs: true}
                ]
            })
        ],{
            verbose: true
        }))
        .pipe(gulp.dest(path.build.assets))
        .pipe(reload({stream:true}));
    done();
})

gulp.task('watch', function (done){
    gulp.watch(path.watch.html, gulp.series('build:email'))
    gulp.watch(path.watch.assets, gulp.series('mv:assets'))
    done();
})

gulp.task('webserver', function(done){
    browserSync(config);
    done();
});

gulp.task('default', gulp.series('clean','build:scss',gulp.parallel('build:email','mv:assets'),'watch','webserver'))