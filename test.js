var axios = require("axios");
var qs = require("qs");

axios({
  url: "http://data.stats.gov.cn/easyquery.htm",
  method: "POST",
  headers: {
    accept: "text/plain, */*; q=0.01",
    "accept-language": "zh-CN,zh;q=0.9",
    "content-type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest",
    cookie: "JSESSIONID=2C9F96FC222B6DC714A456044AEC06E3; u=1",
  },
  data: qs.stringify({
    id: "zb",
    dbcode: "hgyd",
    wdcode: "zb",
    m: "getTree",
  }),
  //   data: qs.stringify({
  //     id: 'A01',
  //     dbcode: 'hgyd',
  //     wdcode: 'zb',
  //     m: 'getTree'
  //   }),
  mode: "cors",
}).then((res) => {
  console.log("zzzzzzzzzz", JSON.stringify(res.data));
});
