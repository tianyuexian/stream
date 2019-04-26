let fs = require('fs');
let WriteStream = require('./writeStream');
let ws = new WriteStream('./2.txt', {
  flags: 'w', // 当前操作文件是写的状态
  encoding: 'utf8', // 默认写入的编码是utf8模式
  mode: 0o666,
  autoClose: true,
  start: 0, // 写入文件的为止
  highWaterMark:3 // 16k  希望用的缓存区的大小 ,限制写入的个数（没有决定性的作用）
});
// 我现在要向文件中写入10个数
// 0-9
let i = 9;
let flag;
function write() {
  flag = true;
  while (flag&&i>=0) {
    flag = ws.write(i-- + '')
  }
}
ws.on('drain',function () { // 抽干 达到预期后内容被清空 就会执行drain方法
  console.log('抽干')
  write();
})
write();

// let i = 5;
// let index = 0;
// function write(str) {
//  setTimeout(() => {
//    console.log('写入')
//  }, 0);
//   index+=str.length;
//   return index < i;
// }
// let flag = write('aa');
// console.log(flag);
// flag = write('aa');p
// console.log(flag);
// flag = write('aa');
// console.log(flag);