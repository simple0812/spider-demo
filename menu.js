// 爬取菜单栏数据

var Crawler = require("crawler");
var fs = require("fs-extra");
var moment = require("moment");
var qs = require("query-string");
var qsx = require("qs");
var _ = require("lodash");

var models = require('./models');

function getTree(id) {
  c.queue({
    uri: "http://data.stats.gov.cn/easyquery.htm",
    method: "POST",
    headers: {
      accept: "text/plain, */*; q=0.01",
      "accept-language": "zh-CN,zh;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "x-requested-with": "XMLHttpRequest",
      cookie: "JSESSIONID=2C9F96FC222B6DC714A456044AEC06E3; u=1",
    },
    form: {
      id,
      dbcode: "hgyd",
      wdcode: "zb",
      m: "getTree",
    },
  });
}

function queryData(id) {
  c.queue({
    uri: `http://data.stats.gov.cn/easyquery.htm`,
    qs: {
      m: "QueryData",
      dbcode: "hgyd",
      rowcode: "zb",
      colcode: "sj",
      wds: JSON.stringify([]),
      dfwds: JSON.stringify([{ wdcode: "zb", valuecode: id }]),
      k1: 1596459141521,
      h: 1,
    },
  });
}

var c = new Crawler({
  jQuery: false,
  rateLimit: 500,
  maxConnections: 1,
  headers: {
    accept: "text/plain, */*; q=0.01",
    "accept-language": "zh-CN,zh;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest",
    cookie: "JSESSIONID=2C9F96FC222B6DC714A456044AEC06E3; u=1",
  },
  referer: "https://insights.ceicdata.com/Untitled-insight/views",
  //   "referrerPolicy": "no-referrer-when-downgrade",
  callback: function (error, res, done) {
    if (error) {
      console.log("error", error);
    } else {
      let body  = res.toJSON().body;
      let xbody = JSON.parse(body);
      let xUri = res.request.uri;
      let pathname = xUri.pathname;

      // 导航树
      if (_.isArray(xbody)) {
        _.forEach(xbody, item => {
          if (item.isParent) {
            getTree(item.id) //请求导航tree
          } else {
            // queryData(item.id) // 请求表格数据
          }

          // fs.appendFileSync('./tree.txt', JSON.stringify(item) + '\r\n')
          models.MenuTree.upsert(item)
          .then((doc) => {
          })
          .catch((err) => {
            console.log('write db error' + err.message)
          });
        })
      } else {
        // fs.writeFileSync(`table.json`, body);

        //数据表
      }

      console.log(`done ${pathname}  \r\n`)
    }
    done();
  },
});

c.on("drain", function (err) {
  console.log("parse end");
});
c.queue({
  uri: "http://data.stats.gov.cn/easyquery.htm",
  method: "POST",
  headers: {
    accept: "text/plain, */*; q=0.01",
    "accept-language": "zh-CN,zh;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest",
    cookie: "JSESSIONID=2C9F96FC222B6DC714A456044AEC06E3; u=1",
  },
  form: {
    id: "zb",
    dbcode: "hgyd",
    wdcode: "zb",
    m: "getTree",
  },
});


// c.queue(
//     `http://data.stats.gov.cn/easyquery.htm?` +
//       qs.stringify({
//         m: "getOtherWds",
//         dbcode: "hgyd",
//         rowcode: "zb",
//         colcode: "sj",
//         wds: JSON.stringify([]),
//         k1: 1596460410181
//       })
//   );
