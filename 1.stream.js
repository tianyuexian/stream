let fs = require('fs');
let ReadStream  = require('./readStream');
let rs = new ReadStream('./1.txt',{
  flags:'r', 
  encoding:null, 
  mode:0o666, 
  autoClose:true, 
  start:0, 
  end:5, 
  highWaterMark:4 
});
let arr = [];
rs.on('open',function (fd) { 
  // console.log(fd);
})
rs.on('data',function (data) {
  console.log(data)
  rs.pause();
  arr.push(data); // [0xfff,0xfff]
});
rs.on('end',function () { 
 // console.log('结束')
  console.log(Buffer.concat(arr).toString())
});
rs.on('close',function () {
  console.log('close');
});
rs.on('error',function (err) {
  console.log(err)
})
setTimeout(() => {
  rs.resume();
}, 1000);

// 可写流