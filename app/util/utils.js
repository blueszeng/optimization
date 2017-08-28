let utils = module.exports;

// control variable of func "myPrint"
let isPrintFlag = false;
// let isPrintFlag = true;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function (cb) {
  if (!!cb && typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

/**
 * clone an object
 */
utils.clone = function (origin) {
  if (!origin) {
    return;
  }

  let obj = {};
  for (let f in origin) {
    if (origin.hasOwnProperty(f)) {
      obj[f] = origin[f];
    }
  }
  return obj;
};

utils.size = function (obj) {
  if (!obj) {
    return 0;
  }

  let size = 0;
  for (let f in obj) {
    if (obj.hasOwnProperty(f)) {
      size++;
    }
  }

  return size;
};

// print the file name and the line number ~ begin
function getStack() {
  let orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };
  let err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  let stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

function getFileName(stack) {
  return stack[1].getFileName();
}

function getLineNumber(stack) {
  return stack[1].getLineNumber();
}

utils.myPrint = function () {
  if (isPrintFlag) {
    let len = arguments.length;
    if (len <= 0) {
      return;
    }
    let stack = getStack();
    let aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
    for (let i = 0; i < len; ++i) {
      aimStr += arguments[i] + ' ';
    }
    console.log('\n' + aimStr);
  }
};
// print the file name and the line number ~ end

/**
 * 转换rpc回调函数为promise
 */
utils.rpcFuncPromisify = function (func, self) {
  return function () {
    let args = [];
    let len = arguments.length;
    for (let i = 0; i < len; i++) {
      args.push(arguments[i]);
    }
    return new Promise(function (resolve, reject) {
      let onCallBack = function (err, result) {
        if (!!err) {
          return reject(err);
        }
        if (arguments.length >= 3) {  //RPC 回调返回参数超过 3个 就返回一个数组
          let arryRes = [];
          for (let i = 1; i < arguments.length; i++) {
            arryRes.push(arguments[i]);
          }
          return resolve(arryRes);
        }
        resolve(result);
      };
      args.push(onCallBack);
      func.apply(self, args);
    });
  };
};


/**
 * 转换对象所有函数为promise
 */
utils.rpcFuncPromisifyAll = function (self) {
  for (let funIndex in self) {
    self[funIndex] = utils.rpcFuncPromisify(self[funIndex], self)
  }
  return self;
};


