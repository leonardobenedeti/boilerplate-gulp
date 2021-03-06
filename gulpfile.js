const gulp = require('gulp');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');

const sass = require('gulp-sass')(require('sass'));

const del = require('del')
const es = require('event-stream');
const minify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

const tinypng = require('gulp-tinypng');

var buildPath = 'build';

function buildCSS() {
    return gulp.src('./src/scss/general.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(cleanCSS({
			debug: false
		}))
		.pipe(rename('general.min.css'))
		.pipe(gulp.dest('./build/css/'));
}

function minifyJs() {
	return gulp.src(['./src/js/script.js'])
		.pipe(minify())
		.pipe(rename('script.min.js'))
		.pipe(gulp.dest('./build/js/'))
}

function tinyImages(){
	return gulp.src('./src/images/**/*.{png,jpg,jpeg}')
        .pipe(tinypng('API_KEY'))
        .pipe(gulp.dest('./build/images/'));
}

async function bundle(){
	return es.concat(
		gulp.src('./src/index.html').pipe(gulp.dest('./build/')),
		gulp.src('./src/images/**/*').pipe(gulp.dest('./build/images/')),
		gulp.src('./src/fonts/**/*').pipe(gulp.dest('./build/fonts/')),
        gulp.src('./src/js/*.min.js').pipe(gulp.dest('./build/js/'))
	);
}

async function preBuild(){
	const deletedFiles = await del([buildPath]+'/*')
	console.log('deletedFiles', deletedFiles)

	return gulp.src('./build/*.*', {read: false})
        .pipe(gulp.dest('./css'))
        .pipe(gulp.dest('./images'))
        .pipe(gulp.dest('./fonts'))
        .pipe(gulp.dest('./js'));
}

async function prePublish(){
	const deletedFiles = await del('./node_modules/.cache/gh-pages')
	return console.log('gh-pages deleted', deletedFiles)
}

function server(){
	browserSync.init({
        server: "./build",
    });

	gulp.watch("./src/**/*", build).on('change', (stream)=>{
        setTimeout(function(){
            browserSync.reload();
        }, 1500);
	});
}

const build = gulp.series(
	preBuild,
	buildCSS, 
	minifyJs, 
	bundle,
	prePublish,
);

exports.default = gulp.series(build, server);
exports.build = build;
exports.buildProd = gulp.series(build, tinyImages);