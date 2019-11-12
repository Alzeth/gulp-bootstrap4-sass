const gulp = require('gulp');
const config = require('./gulp-settings.json');
const clean = require('del');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const pngmin = require('gulp-pngmin');
const copy = require('gulp-contrib-copy');
const gcmq = require('gulp-group-css-media-queries');
const includePaths = ['node_modules/'];
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');


const postCssPlugins = [
    autoprefixer({ browsers: ['last 4 version', 'Android 4'] })
];

gulp.task('clean:prod', () => clean([
    `${config.cssDir}**/*.map`,
    `${config.cssMainFileDir}${config.cssMainFileName}.css.map`,
    `${config.imgDir}*.*`
]));

gulp.task('imagemin', () => gulp
    .src(`${config.imgSourceDir}*.{jpg,gif}`)
    .pipe(newer(config.imgDir))
    .pipe(imagemin())
    .pipe(gulp.dest(config.imgDir)));

gulp.task('pngmin', () => gulp
    .src(`${config.imgSourceDir}*.png`)
    .pipe(newer(config.imgDir))
    .pipe(pngmin())
    .pipe(gulp.dest(config.imgDir)));

// compiling for development (sourcemaps=true)
gulp.task('sass:dev', () => gulp
    .src(`${config.sassDir}./**/*.scss`)
    .pipe(sass({includePaths}))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postCssPlugins))
    .pipe(sourcemaps.write('./', {includeContent:false, sourceRoot:'./'}))
    .pipe(gulp.dest(`./${config.cssDir}`)));

// compiling for production (sourcemaps=false)
gulp.task('sass:prod', () => gulp
    .src(`${config.sassDir}./**/*.scss`)
    .pipe(sass({includePaths}))
    .pipe(sass().on('error', sass.logError))
    .pipe(gcmq())
    .pipe(postcss(postCssPlugins))
    .pipe(gulp.dest(`./${config.cssDir}`)));


gulp.task('minify-css', () => gulp
    .src(`${config.cssDir}*.css`)
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(`${config.cssDir}/min`)));

gulp.task('copy', () => gulp
    .src(`${config.imgSourceDir}*`)
    .pipe(newer(config.imgDir))
    .pipe(copy())
    .pipe(gulp.dest(config.imgDir)));

// Static Server + watching html/scss/js files
gulp.task('serve', ['sass:dev'], function() {
    browserSync.init({
        port: 3333,
        server: "./"
    });
    // without browserReload
    gulp.watch(`${config.sassDir}**/*.scss`, ['sass:dev']);
    gulp.watch(`${config.imgSourceDir}**/*.{jpg,gif}`, ['imagemin', 'copy']);
    gulp.watch(`${config.imgSourceDir}**/*.png`, ['pngmin']);
    gulp.watch(`${config.imgSourceDir}**/*.svg`, ['copy']);

    // with browserReload
    gulp.watch(`${config.cssDir}**/*.css`).on('change', browserSync.reload);
    gulp.watch('./*.html').on('change', browserSync.reload);
    gulp.watch(`./${config.jsDir}*.js`).on('change', browserSync.reload);
    gulp.watch(`${config.imgDir}**`).on('change', browserSync.reload);
});


gulp.task('default', ['serve']);
gulp.task('dist', ['clean:prod', 'sass:prod', 'copy', 'imagemin', 'pngmin']);
gulp.task('min', ['minify-css', 'imagemin', 'pngmin']);
