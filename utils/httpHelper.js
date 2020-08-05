var request = require('request');

module.exports = (function() {
  var MAX_HTTP_RETRIES = 3;
  var RETRY_DELAY = 5000;
  var TIMEOUT = 30000;

  function handle(host, options, callback) {
    var tries = MAX_HTTP_RETRIES;

    function attempt() {
      var opt = {
        uri: host,
        json: true,
        method:'GET',
        timeout: TIMEOUT,
        ...options
      };

      if (tries !== MAX_HTTP_RETRIES) {
          console.log(`retry ${host} ${MAX_HTTP_RETRIES - tries} times`)
      }

      request(opt, function(err, res, data) {
        if (!err && (res.statusCode === 200 || res.statusCode === 304)) {
          callback(null, data);
        } else if (--tries) {
          setTimeout(attempt, RETRY_DELAY);
        } else {
          callback(err, data);
        }
      });
    }

    attempt();
  }

  function post(host, postData, options) {
    return new Promise(function(resolve, reject) {
      let opt ={
          method: 'POST',
          body: postData,
          ...options
      }

      handle(host, opt, function(err, data) {
        if (err) {
          return reject(new Error('获取数据失败'));
        }

        resolve(data);
      });
    });
  }

  function get(host, queryObj, options) {
    let opt ={
        method: 'GET',
        qs: queryObj,
        ...options
    }

    return new Promise(function(resolve, reject) {
      handle(host, opt, function(err, data) {
        if (err) {
          return reject(new Error('获取数据失败'));
        }

        resolve(data);
      });
    });
  }
  
  return {
    post,
    get,
    handle
  };

})();