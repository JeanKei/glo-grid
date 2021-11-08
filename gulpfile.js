let project_folder = 'build';
let source_folder = '#src';

/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
let path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
    svg: project_folder + '/svg/',
  },
  src: {
    html: source_folder + '/*.html',
    css: source_folder + '/scss/style.scss',
    js: source_folder + '/js/main.js',
    img: source_folder + '/img/**/*.*',
    // img: source_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
    fonts: source_folder + '/fonts/**/*.ttf',
    svg: source_folder + '/svg/*.svg',
  },
  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/main.js',
    img: source_folder + '/img/**/*.*',
    fonts: source_folder + '/fonts/**/*.ttf',
    svg: source_folder + '/svg/',
  },
  clean: './' + project_folder + '/'
}
/* подключаем gulp и плагины */
let {src, dest} = require('gulp'),
  gulp = require('gulp'), // подключаем Gulp
  browsersync = require('browser-sync').create(), // сервер для работы и автоматического обновления страниц
  fileinclude = require('gulp-file-include'),// позволяет подключать html файлы как если бы вы работали с PHP
  del = require('del'), // Удалить
  scss = require('gulp-sass')(require('sass')), // модуль для компиляции SASS (SCSS) в CSS
  autoprefixer = require('gulp-autoprefixer'), // Автопрефиксы
  group_media = require('gulp-group-css-media-queries'), // Обьеденить одинаковые @media
  rename = require('gulp-rename'), // Переиминовать
  cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
  uglify = require('gulp-uglify-es').default, // плагин для минимизации JS
  imagemin= require('gulp-imagemin'), // плагин для сжатия картинок
  webp = require('gulp-webp'), // плагин создаёт webp
  webpHTML = require('gulp-webp-html'),  // плагин встраивает webp в html
  webpCss = require('gulp-webp-css'),  // плагин встраивает webp в css
  svgSprite = require('gulp-svg-sprite'),   // плагин делает svg sprite 
  cheerio = require('gulp-cheerio');  // плагин убирает тэги в svg sprite 
  ttf2woff = require("gulp-ttf2woff") // ttf в woff 
  ttf2woff2 = require("gulp-ttf2woff2") // ttf в woff2 

  /* ЗАДАЧИ*/
 
// 1. browser-sync
function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/' // Базовая папка, откуда будет запускаться browser-sync. Значение как для переменной clean
    },
    port: 3000,
    notify: false
  })
}
// 2. HTML
function html() {
  return src(path.src.html) // выбор всех html файлов по указанному пути
    .pipe(fileinclude()) 
    // .pipe(webpHTML())
    .pipe(dest(path.build.html)) // выкладывание готовых файлов
    .pipe(browsersync.stream()) // перезагрузка сервера
}

// 3. CSS
function css() {
  return src(path.src.css) // выбор всех css файлов по указанному пути
    // .pipe(scss({}))
    .pipe(scss({outputStyle: 'expanded'}))
    // .pipe(group_media())
    .pipe(autoprefixer({overrideBrowserslist: ["last 10 version"], grid: true, cascade:true }))
    // .pipe(webpCss())
    .pipe(gulp.dest(path.build.css)) // выгружаем build до сжатия css 

    .pipe(cleanCSS()) // минимизируем CSS
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(gulp.dest(path.build.css)) // выгружаем в build
    .pipe(browsersync.stream()) // перезагрузим сервер
}

// 4. JS
function js() {
  return src(path.src.js) // выбор всех html файлов по указанному пути
    .pipe(fileinclude())
    .pipe(dest(path.build.js)) // выкладывание готовых файлов
    .pipe(uglify(/* options */))
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js)) // выкладывание готовых файлов
    .pipe(browsersync.stream()) // перезагрузка сервера
}

// 5. IMAGES
function images() {
  return src(path.src.img) // выбор всех файлов по указанному пути
  .pipe(imagemin([
	      imagemin.gifsicle({interlaced: true}),
	      imagemin.mozjpeg({ progressive: true}),
	      imagemin.optipng({optimizationLevel: 3}),
	      imagemin.svgo({
		      plugins: [
			      {removeViewBox: false}
		        ]
	      })
      ]))
    .pipe(dest(path.build.img)) // выкладывание готовых файлов
    .pipe(browsersync.stream()) // перезагрузка сервера
}

// 5. IMAGES
// function images() {
//   return src(path.src.img) // выбор всех html файлов по указанному пути
//   .pipe(webp({quality: 70}))
//   .pipe(dest(path.build.img)) // выкладывание готовых файлов
//   .pipe (src(path.src.img))
//   .pipe(imagemin([
// 	      imagemin.gifsicle({interlaced: true}),
// 	      imagemin.mozjpeg({ progressive: true}),
// 	      imagemin.optipng({optimizationLevel: 3}),
// 	      imagemin.svgo({
// 		      plugins: [
// 			      {removeViewBox: false}
// 		        ]
// 	      })
//       ]))
//     .pipe(dest(path.build.img)) // выкладывание готовых файлов
//     .pipe(browsersync.stream()) // перезагрузка сервера
// }


// 6. SVG SPRITE
const svg = () => {
  return gulp.src([source_folder + '/svg/*.svg'])
    .pipe(cheerio({
      run: function ($) {
        $("[id]").removeAttr("id");
        $("[fill]").removeAttr("fill");
        $("[clip]").removeAttr("clip");
        $("[stroke]").removeAttr("stroke");
        $("[mask]").removeAttr("mask");
        $("[opacity]").removeAttr("opacity");
        $("[width]").removeAttr("width");
        $("[height]").removeAttr("height");
        $("[class]").removeAttr("class");
        $("[aria-hidden]").removeAttr("aria-hidden");
        $("[data-prefix]").removeAttr("data-prefix");
        $("[data-icon]").removeAttr("data-icon");
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest(path.build.svg))
    .pipe(browsersync.stream());
};

// 7.1. ttf в woff и ttf в woff2
function fonts() {
    src([source_folder + "/fonts/*.ttf"])
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts))
    return src(path.src.fonts)
      .pipe(ttf2woff2())
      .pipe(dest(path.build.fonts))
};

// 7.2. ПРОСТО КОПИРУЕМ woff и woff2 ШРИФТЫ ИЗ SRC В BUILD
function fonts_copy() {
    src([source_folder + "/fonts/*.{woff,woff2}"])
      .pipe(dest(path.build.fonts))
};

// 8. ПРОСМОТР ФАЙЛОВ
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
  gulp.watch([path.watch.svg], svg);
}

// 9. ОЧИСТКА (УДАЛЕНИЕ ПАПКИ BUILD)
function clean(params) {
  return del(path.clean);
}

// 10. ЗАПУСК ЗАДАЧ 
let build = gulp.series(clean, gulp.parallel(js, css, html, images, svg, fonts, fonts_copy));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
exports.svg = svg;
exports.fonts = fonts;
exports.fonts_copy = fonts_copy;