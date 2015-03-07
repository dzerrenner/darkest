var gulp = require('gulp'),
    merge = require('merge-stream'),
    flatten = require('gulp-flatten'),
    imageResize = require('gulp-image-resize');

var src_folder = "F:/Steam/steamapps/common/DarkestDungeon/";
var dst_folder = "dist/";

gulp.task('default', function() {
    console.log("gulp!");
});

gulp.task('collect', function() {
    return merge(
        gulp.src(src_folder + "panels/icons_map/indicator.png")
            .pipe(gulp.dest(dst_folder + "images/")),
        gulp.src(src_folder + "svn_revision.txt")
            .pipe(gulp.dest(dst_folder + "data/")),
        gulp.src(src_folder + "panels/icons_equip/*.png")
            .pipe(gulp.dest(dst_folder + "images/equip/")),
        gulp.src(src_folder + "heroes/*/*portrait*.png")
            .pipe(flatten())
            .pipe(gulp.dest(dst_folder + "images/heroes/"))
    )
});