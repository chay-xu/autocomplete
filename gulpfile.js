var gulp = require('gulp');
var connect = require('gulp-connect');
var fs = require('fs');         //node.js文件输出
var querystring = require('querystring');         //node.js文件输出
// var jshint = require('gulp-jshint');
// var uglify = require('gulp-uglify');
// var cssmin = require('gulp-minify-css');
// var rename = require('gulp-rename');
// var rev = require('gulp-rev');

// //var gifsicle = require('imagemin-gifsicle');
// //var pngcrush = require('imagemin-pngcrush')
var saveFile = function (file,content,type){
    switch(type){
        case 'a':{
            fs.appendFile(file, content, function (err) {
                if (err) throw err;
                console.log(file + ':It\'s saved append!'); //文件被保存
            });
            break;
        }
        case 'n':{
            fs.writeFile(file, content, function (err) {
                if (err) throw err;
                console.log(file + ':It\'s saved new!'); //文件被保存
            });
            break;
        }
    }
};

//创建watch任务去检测html文件,其定义了当html改动之后，去调用一个Gulp的Task
gulp.task('watch', function () {
  gulp.watch(['./demo/*.html'], ['html']);
});

//使用connect启动一个Web服务器
gulp.task('connect', function () {
  connect.server({
    root: './',
    livereload: true,
    port: 8080,
    fallback: './log.txt',
    middleware: function(connect, options){
      // var str = '';
      // for(var i in req){
      //   str+=(i+'\r\n');
      // }
      // saveFile('log.txt', str, 'n')
      // console.log(req.query())
      var arr = [function(req, res, next) {
        var stubUrl = {
              "/user/info": function( params ){
                //console.log(params['wd']);
                var newData = [];
                var key = params['wd'];

                var fileData = fs.readFileSync('./json.json', 'utf-8');
                  
                var dataArr = JSON.parse( fileData ).data;
                if( key !== '' )
                  for( var i in dataArr ){
                    //if( data.hasOwnProperty( i ) ){
                      //console.log(String(dataArr[i]).indexOf( params['wd'] ))
                      // if( String(dataArr[i]).indexOf( params['wd'] ) !== -1 )
                      var reg = new RegExp( params['wd'], 'gi' );
                      if( String(dataArr[i]).search( reg ) !== -1 )
                        newData.push( dataArr[i] );
                    //}
                  }
                console.log(newData,1)

                return newData;
              },
              "user/login": {
                "authority": true
              }
            };

         //判断是GET/POST请求
          if(req.method == "GET"){
              return next();
              // var params = [];
              // params = url.parse(req.url,true).query;

              // res.write(JSON.stringify(params));
              // res.end();
          }else{
              var postdata = "";
              req.addListener("data",function(postchunk){
                  postdata += postchunk;
              })

              //POST结束输出结果
              req.addListener("end",function(){
                  var params = querystring.parse(postdata);

                  if(!stubUrl.hasOwnProperty(req.url)) {
                    return next();
                  }
                  var resArr = stubUrl[req.url]( params );
                  console.log(resArr)
                  var resData = {
                    "msg": "",
                    "err": "",
                    "data": resArr
                  };
                  //console.log( resArr );
                  //res.write();
                  res.end( JSON.stringify( resData ) );
              })
          }

      }];
      return arr;
    }
  })
});

gulp.task('html', function () {
  gulp.src('./demo/*.html')
    .pipe(connect.reload());
});

//运行Gulp时，默认的Task
gulp.task('default', ['connect', 'watch']);

// // 语法检查
// gulp.task('jshint', function () {
//     return gulp.src('dialog.js')
//         .pipe(jshint())
//         .pipe(jshint.reporter('default'));
// });

// var options = {
//     preserveComments: 'some'
// };
// // js压缩代码
// gulp.task('script', function (){
//      return gulp.src('src/*.js')
//           // .pipe(concat('all.js'))
//           // .pipe(gulp.dest('dist'))
//           .pipe(uglify(options))
//           .pipe(rename({
//             suffix: "-min"
//           }))
//           .pipe(gulp.dest('build'));
// });

// // css压缩代码
// gulp.task('css', function (){
//      return gulp.src('src/css/*.css')
//           // .pipe(concat('all.js'))
//           // .pipe(gulp.dest('dist'))
//           .pipe(cssmin({
//             keepSpecialComments: 1
//           }))
//           .pipe(rename({
//             suffix: "-min"
//           }))
//           .pipe(gulp.dest('build/css/'));
// });

// // images压缩代码
// gulp.task('image', function (){
//      return gulp.src('src/images/*.gif')
//           // .pipe(concat('all.js'))
//           // .pipe(gulp.dest('dist'))
//           .pipe(gifsicle({
//             interlaced: true
//           }))
//           // .pipe(rename({
//           //   suffix: "-min"
//           // }))
//           .pipe(gulp.dest('build/images/'));
// });

// // 修改文件名
// gulp.task('rev', function () {
//     return gulp.src('src/*.js')
//           .pipe( rev() )
//           .pipe( gulp.dest('build') );
// });

// // 监视文件的变化
// gulp.task('watch', function () {
//     gulp.watch('src/*.js', ['jshint', 'minify']);
// });

// // 压缩代码
// gulp.task('minify', ['script', 'css' ] );

// // 注册缺省任务
// gulp.task('default', ['jshint', 'minify', 'watch']);

// 可以看出，基本上所有的任务体都是这么个模式：
// gulp.task('任务名称', function () {
//     return gulp.src('文件')
//         .pipe(...)
//         .pipe(...)
//         // 直到任务的最后一步
//         .pipe(...);
// });