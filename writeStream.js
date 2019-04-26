let EventEmitter = require('events'); // on emit off once newListener
let fs = require('fs');
class WriteStream extends EventEmitter {
  constructor(path, options = {}) {
    super();
    this.path = path;
    this.flags = options.flags || 'w';
    this.encoding = options.encoding || 'utf8';
    this.mode = options.mode || 0o666;
    this.autoClose = options.autoClose || true;
    this.start = options.start || 0;
    this.highWaterMark = options.highWaterMark || 16 * 1024
    this.open();// 打开文件
    // 1) 需要一个写入的偏移量
    this.pos = this.start; // 可变的
    // 2) 需要计算当前写入字节数
    this.len = 0;
    // 3) needDrain 是否触发drain事件 当前写入的个数和highWaterMark
    this.needDrain = false; // 默认不触发
    // 4) 缓存队列
    this.cache = [];
    // 5) 是否正在写入
    this.writing = false;
  }
  open(){ // 异步的
    fs.open(this.path,this.flags,this.mode,(err,fd)=>{
      if(err){
        return this.emit('error',err)
      }
      this.fd = fd;
      this.emit('open',fd);
    })
  }
  // write方法 buffer or string
  write(chunk,encoding=this.encoding,callback=()=>{}){ // 这个write方法 一上来就执行了，等着open后在调用
    // 转一下输入内容的类型 统一为buffer
    chunk = Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
    this.len += chunk.length; // 当前这个内容肯定没有写到文件里
    // 是否达到预期后需要触发drain事件
    this.needDrain = this.len >= this.highWaterMark;
    if(this.writing){ // 正在写入
      this.cache.push({
        chunk,
        encoding,
        callback
      })
    }else{
      // 往里面写 创造一个独立写的方法
      this.writing = true; // 更改成正在写入的
      this._write(chunk, encoding, ()=>{callback();this.clearBuffer()});
    }
    return !this.needDrain; // 返回的是是否达到预期
  }
  _write(chunk,encoding,clearBuffer){ // 真正的写入逻辑
    if(typeof this.fd != 'number'){ // 文件还没有打开
      return this.once('open', () => this._write(chunk, encoding, clearBuffer));
    }
    // this.fd 产生了
    fs.write(this.fd, chunk,0,chunk.length,this.pos, (err,written) =>{
      // 第一次已经写入了
      this.len -= written; // 写入成功后缓存区要减小
      this.pos += written; // 写入的偏移量
      clearBuffer(); // 在去数组里去取，取到后继续写入
    });
  }
  clearBuffer(){ // 当前写入后调用的回调函数
    let obj = this.cache.shift(); // 如果取出东西了
    if(obj){
      this._write(obj.chunk,obj.encoding,()=>{
        obj.callback();
        this.clearBuffer();
      });
    }else{ // 缓存区空了
      this.writing = false; // 表示已经彻底都写完了 
      if(this.needDrain){ // 需要触发drain
        this.needDrain = false;
        this.emit('drain');
      }
    }
  }
}

module.exports = WriteStream;

