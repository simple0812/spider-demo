httpHelper.get('http://www.baidu.com').then(res => {
  console.log('xxx', res)
}).catch(err => {
  console.log(err.message)
})

httpHelper
  .post(
    "http://data.stats.gov.cn/easyquery.htm",
    {},
    {
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
    }
  )
  .then((res) => {
    console.log("xxx", res);
  })
  .catch((err) => {
    console.log(err.message);
  });
