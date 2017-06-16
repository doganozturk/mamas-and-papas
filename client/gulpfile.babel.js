'use strict';

import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Sprite creation task
gulp.task('sprite', () =>
  gulp.src('app/images/*.png')
    .pipe($.spritesmith({
      imgName: 'sprite.png',
      cssName: 'sprite.css'
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe(gulp.dest('.tmp/images'))
    .pipe($.size({title: 'images'}))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src([
    'app/scss/**/*.scss',
    'app/scss/**/*.css'
  ])
    .pipe($.newer('.tmp/css'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano({discardComments: {removeAll: true}})))
    .pipe($.rename('main.min.css'))
    .pipe($.size({title: 'scss'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('.tmp/css'));
});

// Concatenate JavaScript.
gulp.task('scripts', () =>
    gulp.src([
      './node_modules/jquery/dist/jquery.js',
      './node_modules/slick-carousel/slick/slick.js',
      './app/js/main.js'
    ])
      .pipe($.newer('.tmp/js'))
      .pipe($.sourcemaps.init())
      .pipe($.concat('main.js'))
      // Output files
      .pipe($.size({title: 'js'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/js'))
      .pipe(gulp.dest('.tmp/js'))
);

// Minify JavaScript on prod.
gulp.task('uglify', () =>
  gulp.src([
    './tmp/js/main.js',
    './dist/js/main.js'
  ])
    .pipe($.sourcemaps.init())
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.rename('main.min.js'))
    .pipe($.size({title: 'js'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    .pipe(gulp.dest('.tmp/js'))
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.htmlReplace({
      'css': 'css/main.min.css',
      'js': 'js/main.min.js'
    }))
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/scss/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/js/**/*.js'], ['scripts', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    ['html', 'scripts', 'sprite', 'copy'],
    'uglify',
    cb
  )
);
