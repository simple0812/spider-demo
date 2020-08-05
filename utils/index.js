var Zrror = require('./Zrror');

exports.delay = function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, +ms || 1000);
  });
};

exports.workflow = function workflow(arr, fn) {

  return new Promise(function(resolve, reject) {
    let errorList = [];
  next(null);

  function next(err) {
    if (err) {
      errorList.push(err);
    }

    if (arr.length === 0) {
      if (errorList.length > 0) {
        reject(new Zrror(errorList))
      } else {
        resolve()
      }
      return;
    }

    let data = arr.shift();
    fn(data, next);
  }

  })
  
};
