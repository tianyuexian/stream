// 可读流 是一个类
let EventEmitter = require('events');
let fs = require('fs');
class ReadStream extends EventEmitter {
  constructor(path, options = {}) {
    super();
    // promise 所有的属性 都需要挂载再实例 方便使用
    this.path = path;
    this.flags = options.flags || 'r';
    this.encoding = options.encoding || null;
    this.mode = options.mode || 0o666;
    this.autoClose = options.autoClose || true;
    this.start = options.start || 0;
    this.end = options.end || null; // 为null 就表示读取到结尾
    this.highWaterMark = options.highWaterMark || 64 * 1024;

    // 当前模式 是不是流动模式 默认是非流动模式
    this.flowing = null;
    this.open();
    this.on('newListener', (type) => {
      // 如果类型不是data 不管 是data 开始读取文件
      if (type === 'data') {
        this.flowing = true;
        this.read();
      }
    });
    // start 是不变的 position 是可变的
    this.position = this.start || 0;
  }
  open() {
    fs.open(this.path, this.flags, this.mode, (err, fd) => {
      if (err) {
        return this.emit('error', err)
      }
      this.fd = fd; // 保存再当前的实例上
      this.emit('open', fd);
    });
  }
  read() { // 用户监听了data事件 开始读取
    // 打开文件 read方法来读取
    if (typeof this.fd !== 'number') {
      return this.once('open', () => this.read())
    }
    // 到此说明fd 存在了 ,创建一个buffer 把文件中的内容读取到buffer中
    let buffer = Buffer.alloc(this.highWaterMark);
    // 我们应该先计算一个靠谱的值来读取？
    // 怎么算应该读取多少个 一共要读取 0-10 5个 每次读四个 
    // 第一次读取完毕后 position =4
    // end - position + 1
  
    let howMuchToRead = this.end ? Math.min(this.highWaterMark, this.end - this.position + 1) : this.highWaterMark;
    fs.read(this.fd, buffer, 0, howMuchToRead, this.position, (err, bytesRead) => {
      if (bytesRead > 0) { // 能读取到东西
        this.position += bytesRead;
        let chunk = this.encoding ? buffer.slice(0, bytesRead).toString(this.encoding) : buffer.slice(0, bytesRead)
        this.emit('data', chunk); // 把结果发射出来
        if (this.flowing) { // 如果是流动模式 就要不停的读取，读取到读不到内容为止
          this.read();
        }
      } else {
        this.emit('end');
        this.emit('close');
      }
    });
  }
  pause(){
    this.flowing = false;
  }
  resume(){
    this.flowing = true;
    this.read();
  }
  pipe(dest){
    this.on('data', (chunk)=> {
      let flag = dest.write(chunk);
      if(!flag){
        this.pause();
      }
    });
    dest.on('drain',()=>{
      this.resume();
    })
  }
}

module.exports = ReadStream;