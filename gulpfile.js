const gulp = require("gulp");

const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const inline = require("inline-source");
const source = require("vinyl-source-stream");
const through = require("through2");
const uglify = require("gulp-uglify");

gulp.task("javascript", () => {
    return browserify("src/index.js")
        .bundle()
        .pipe(source("index.js"))
        .pipe(buffer())
        .pipe(gulp.dest("."))
});

gulp.task("html", ["javascript"], () => {
    return gulp.src("src/index.html", { read: false })
        .pipe(through.obj(function (file, enc, cb) {
            inline(file.path, {
                attribute: false,
                compress: true
            }, (err, html) => {
                if (err) return cb(err);

                file.contents = Buffer.from(html);
                this.push(file);

                cb();
            })
        }))
        .pipe(gulp.dest("."));
});

gulp.task("default", ["html"]);
