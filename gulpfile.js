/**
 * Created by wangchunyang on 16/5/15.
 */
var gulp = require("gulp"),
    del = require("del"),
    uglify = require("gulp-uglify"),
    cssnano = require("gulp-cssnano"),
    concat = require("gulp-concat"),
    rev = require("gulp-rev"),
    sourcemaps = require("gulp-sourcemaps"),
    filter = require("gulp-filter"),
    useref = require("gulp-useref"),
    revReplace = require("gulp-rev-replace"),
    replace = require("gulp-replace"),
    gulpif = require("gulp-if"),
    rename = require("gulp-rename");

gulp.task("compress", function() {
    gulp.src("./src/simple-jquery.js")
        .pipe(uglify())
        .pipe(rename(function(path) {
            path.basename += ".min"
        }))
        .pipe(gulp.dest("./src"));
})