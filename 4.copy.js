let fs = require('fs');

// 你是看不到当前./1.txt内容的 会默认先读取4b 往2.txt中写入
let ReadStream = require('./readStream');
let WriteStream = require('./writeStream')
let rs = new ReadStream('./1.txt',{highWaterMark:4});
let ws = new WriteStream('./2.txt',{highWaterMark:1});
rs.pipe(ws);

// rs.on('data',function (chunk) {
//   let flag = ws.write(chunk);
//   if(!flag){
//     rs.pause();
//   }
// });
// ws.on('drain',function () {
//   rs.resume();
// })