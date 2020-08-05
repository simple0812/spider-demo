var utils = require("./index");
var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function mockFn(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      Math.random() > 0.4 ? resolve("") : reject("eee");
    }, ms || 100);
  });
}

async function test(data, cb) {
  try {
    await mockFn(1000);
    console.log('data', data)
    cb();
  } catch (e) {
    cb(data);
  }
}

utils
  .workflow(arr, test)
  .then((res) => {})
  .catch((err) => {
    console.log("err", err.message || err.objMessage);
  });
