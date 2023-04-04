const {dest, src, watch, series, parallel} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');

function serverRun(){
    sync.init({
        server: {
            baseDir: 'dist/',
            notify: false,
            online: 3000
        }
    })
}  

function styles(){
    return src(['src/scss/style.scss', 'src/**/*.scss'])
        .pipe(autoprefixer(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
            })))
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(dest('src/css'))
        .pipe(sync.stream());
}


// image minify
const images = () =>{
    return src('src/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}')
        .pipe(newer('dist/images/'))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images/'))
        .pipe(sync.stream())
}


function scripts(){
    return src(['src/js/index.js', 'src/**/*.js', '!src/**/main.min.js'])
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(dest('src/js'))
        .pipe(sync.stream());
}

const htmlFiles = () => {
    return src('./src/**/*.html')
            .pipe(replace(/\n\s*/g, ''))
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(dest('./dist'));
}

// fonts
const fonts = () =>{
    return src('src/fonts/**/*.{eot,woff,woff2,ttf,svg}')
        .pipe(dest('dist/fonts/'))
        .pipe(sync.stream())
}



function building(){
    return src(['src/js/main.min.js', 'src/css/style.min.css', 'src/index.html'], {base: 'src'})
        .pipe(dest('dist'));
}

function cleaning(){
    return src('dist').pipe(clean());
}

function watchers(){
    watch(['src/**/*.js', '!src/**/main.min.js'], scripts);
    watch('src/**/*.scss', styles);
    watch('src/**/*.html').on('change', sync.reload);
}


exports.styles = styles;
exports.scripts = scripts;
exports.watchers = watchers;
exports.serverRun = serverRun;


exports.build = series(cleaning, building);
exports.default = parallel(styles, scripts, fonts, images, htmlFiles, serverRun, watchers);