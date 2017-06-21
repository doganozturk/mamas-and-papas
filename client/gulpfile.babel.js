'use strict';

import gulp from 'gulp';
import del from 'del';
import fs from 'fs';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/images',
    '!app/scss',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Sprite creation task
gulp.task('sprite', () =>
  gulp.src('app/images/*.png')
    .pipe($.spritesmith({
      imgName: 'sprite.png',
      imgPath: '/css/sprite.png',
      cssName: '_sprite.scss'
    }))
    .pipe($.if('*.scss', gulp.dest('./app/scss/utils')))
    .pipe($.if('*.png', gulp.dest('dist/css')))
    .pipe($.if('*.png', gulp.dest('.tmp/css')))
    .pipe($.size({title: 'sprite'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles:scss', () => {
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

  return gulp.src('app/scss/**/*.scss')
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/css'))
    .pipe($.size({title: 'styles:scss'}));
});

// Concatenate css files
gulp.task('styles:concat', () => {
  return gulp.src([
    './node_modules/flexboxgrid/css/flexboxgrid.css',
    '.tmp/css/*.css',
    '!.tmp/css/styles.css'
  ])
    .pipe($.concatCss('styles.css'))
    .pipe(gulp.dest('.tmp/css'))
    .pipe($.size({title: 'styles:concat'}))
    .on('end', function () {
      del(['.tmp/css/*.css', '.tmp/css/*.css.map', '!.tmp/css/styles.css', '!.tmp/css/styles.css.map']);
    });
});

gulp.task('styles:watch', () =>
  runSequence(
    'styles:scss',
    'styles:concat'
  )
);

// Minify resulting css file
gulp.task('styles:minify', () =>
  gulp.src([
    '.tmp/css/styles.css',
    'dist/css/styles.css'
  ])
    .pipe($.cssnano({discardComments: {removeAll: true}}))
    .pipe($.rename('styles.min.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('.tmp/css'))
    .pipe($.size({title: 'styles:minify'}))
);

// Concatenate JavaScript.
gulp.task('scripts:concat', () =>
    gulp.src([
      './node_modules/jquery/dist/jquery.js',
      './node_modules/slick-carousel/slick/slick.js',
      './app/js/main.js'
    ])
      .pipe($.newer('.tmp/js'))
      .pipe($.concat('main.js'))
      // Output files
      .pipe(gulp.dest('dist/js'))
      .pipe(gulp.dest('.tmp/js'))
      .pipe($.size({title: 'scripts:concat'}))
);

// Minify JavaScript on prod.
gulp.task('scripts:uglify', () =>
  gulp.src([
    './dist/js/main.js',
    './tmp/js/main.js'
  ])
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.rename('main.min.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(gulp.dest('.tmp/js'))
    .pipe($.size({title: 'scripts:uglify'}))
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.htmlReplace({
      'css': 'css/styles.min.css',
      'js': 'js/main.min.js'
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

// Task to remove main.js from js folder on prod.
gulp.task('complete-build', () => 
  del(['./dist/js/main.js', './dist/css/styles.css'])
);

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Dev tasks
gulp.task('dev', () => {
  runSequence(
    'clean',
    'scripts:concat',
    'sprite',
    'styles:scss',
    'styles:concat'
  )  
});

// Browser-Sync
gulp.task('serve', () => {
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
  gulp.watch(['app/scss/**/*.scss'], ['styles:watch', reload]);
  gulp.watch(['app/js/**/*.js'], ['scripts:concat', reload]);
  gulp.watch(['app/images/**/*'], ['sprite', reload]);
});

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'sprite', 
    'styles:scss',
    'styles:concat',
    'styles:minify',
    ['html', 'scripts:concat', 'copy'],
    'scripts:uglify',
    'complete-build',
    cb
  )
);

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
