var Zrror = require("./Zrror");

exports.delay = function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, +ms || 1000);
  });
};

// 不记录异常 异常由fn 函数自己处理
exports.workflow = function workflow(arr, fn) {
  return new Promise(function (resolve, reject) {
    next();

    function next() {
      if (!arr || arr.length <= 0) {
        resolve();
        return;
      }

      let data = arr.shift();

      // fixed: Maximum call stack size exceeded （arr > 5000 and 直接调用next导致 ）
      setImmediate(function() {
        fn(data, next);
      }, 0)
    }
  });
};
