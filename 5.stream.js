// // 如果用文件的流 他会采用fs.read fs.write

// let {Readable} = require('stream'); // 流的模块

// let fs = require('fs');

// // 我的流如果继承了 Readable接口 就必须要重写一个_read的方法
// class MyReadStream extends Readable{ // read _read
//   constructor(){
//     super();
//     this.index = 0;
//   }
//   _read(){
//     if(this.index == 5){
//       return this.push(null); // 读取完毕了
//     }
//     this.push(this.index+++''); // push方法也是Readble实现的
//   }
// }
// let rs = new MyReadStream();
// rs.on('data',function (data) {
//   console.log(data);
// })
// rs.on('end',function () {
//   console.log('end');
// })

// fs.createReadStream('./1.txt');


// 如果用文件的流 他会采用fs.read fs.write

let { Writable } = require('stream'); // 流的模块
let fs = require('fs');
// 我的流如果继承了 Readable接口 就必须要重写一个_write的方法
class MyWriteStream extends Writable { // write _write
  constructor() {
    super();
  }
  _write(chunk,encoding,clearBuffer) {
    fs.appendFile('1.txt',chunk,function () {
      clearBuffer();
    })
  }
}
let ws = new MyWriteStream();
ws.write('hello','utf8',function () {
  console.log('ok');
});
ws.write('hello', 'utf8', function () {
  console.log('ok');
});
// 作业 广度遍历 -> 异步 primise  async+await 
// 自己尝试 用链表来写可写流  （掌握pipe原理）  视频尽量快速传