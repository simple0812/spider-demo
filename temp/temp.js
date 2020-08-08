var qs = require("query-string");

let str =
  "?m=QueryData&dbcode=hgyd&rowcode=zb&colcode=sj&wds=%5B%5D&dfwds=%5B%7B%22wdcode%22%3A%22zb%22%2C%22valuecode%22%3A%22A030101%22%7D%5D&k1=1596459141521&h=1";

let p = qs.stringify({
  m: "QueryData",
  dbcode: "hgyd",
  rowcode: "zb",
  colcode: "sj",
  wds: JSON.stringify([]),
  dfwds: JSON.stringify([{ wdcode: "zb", valuecode: "A030101" }]),
  k1: 1596459141521,
  h: 1,
});


console.log('str', str)
console.log('p', p)