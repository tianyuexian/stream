// 写是有缓存区的概念 写的时候比较复杂

let fs = require('fs');

// 可写流 write end 
let ws = fs.createWriteStream('./2.txt',{
  flags:'w', // 当前操作文件是写的状态
  encoding:'utf8', // 默认写入的编码是utf8模式
  mode:0o666, 
  autoClose:true,
  start:0, // 写入文件的为止
  highWaterMark:2 // 16k  希望用的缓存区的大小
});
// 写入的内容必须是buffer 或者字符串类型
let flag = ws.write('a','utf8',function () {
  console.log('写入成功')
}); // 用写入的个数 和highWaterMark比较

// write after end 已经关闭就不能再次写入
// 把内存中的东西强制写入到文件中，并且把遗言 也写入进去 之后关闭文件
ws.end('结束'); // 结合了 write方法 + close方法 res.end();
