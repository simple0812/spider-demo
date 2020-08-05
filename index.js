var fs = require("fs-extra");
var moment = require("moment");
var qs = require("query-string");
var qsx = require("qs");
var _ = require("lodash");
var httpHelper = require("./utils/httpHelper");
var utils = require("./utils");

var models = require("./models");
const { each } = require("lodash");

async function writeDataIndex(data, cb) {
  try {
    let res = await models.DataIndex.findOne({
      raw: true,
      where: { code: data.code },
    });
    if (_.isEmpty(res)) {
      await models.DataIndex.create({ ...data });
    } else {
      await models.DataIndex.upsert({ ...res, updateAt: Date.now(), ...data });
    }

    cb();
  } catch (err) {
    cb({ code: data.code, menuTreeId: data.menuTreeId, type: "dataIndex" });
  }
}

async function writeMonthData(data, cb) {
  // 如果没数据 就不执行插入操作
  if (!data || !data.hasdata) {
    cb();
    return;
  }
  console.log("month_data", data.dataIndexCode + moment(data.time).format('YYYY-MM'));
  try {
    let res = await models.MonthData.findOne({
      raw: true,
      where: { dataIndexCode: data.dataIndexCode, time: data.time },
    });
    if (_.isEmpty(res)) {
      await models.MonthData.create({ ...data });
    } else {
      await models.MonthData.upsert({ ...res, updateAt: Date.now(), ...data });
    }

    cb();
  } catch (err) {
    console.log("e", err.message);
    cb({
      time: data.time,
      dataIndexCode: data.dataIndexCode,
      type: "monthData",
    });
  }
}

async function getMonthData(id) {
  let res = await httpHelper.get(
    "http://data.stats.gov.cn/easyquery.htm",
    {
      m: "QueryData",
      dbcode: "hgyd",
      rowcode: "zb",
      colcode: "sj",
      wds: JSON.stringify([]),
      dfwds: JSON.stringify([{ wdcode: "zb", valuecode: id }]),
      k1: Date.now(),
      h: 1,
    },
    {
      headers: {
        accept: "text/plain, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "x-requested-with": "XMLHttpRequest",
        cookie: "JSESSIONID=3670F413475D9C8147CBC899D7220F37; u=1",
      },
    }
  );

  // fs.writeFileSync("./ress.json", JSON.stringify(res, null, 2));

  // 如果获取的第一笔数据不在36个月内 在重新获取36个月的数据
  let isInLast36 = true;
  if (res && res.returncode == 200 && res.returndata) {
    let zbArr =
      (_.find(res.returndata.wdnodes, (each) => each.wdcode === "zb") || {})
        .nodes || [];
    let dataList = (res.returndata.datanodes || []).map((item) => {
      let data = item.data;
      let zb = _.find(item.wds, (each) => each.wdcode == "zb") || {};
      let sj = _.find(item.wds, (each) => each.wdcode == "sj") || {};
      let x = (sj.valuecode || "").split("");
      x.splice(4, 0, "-");

      return {
        ...data,
        status: 0,
        dataIndexCode: zb.valuecode,
        time: moment(x.join("")).valueOf(),
      };
    });

    isInLast36 = moment(dataList[0].time).add(36, "M").valueOf() > Date.now();

    zbArr.forEach((item) => {
      item.menuTreeId = id;
    });

    await utils.workflow(zbArr, writeDataIndex).catch((err) => {
      fs.appendFileSync(
        "./dataindex.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });

    await utils.workflow(dataList, writeMonthData).catch((err) => {
      fs.appendFileSync(
        "./monthdata.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });
  }

  if (isInLast36) {
    console.log("in 36");
    return;
  }
  console.log("out 36");

  let xRes = await httpHelper.get(
    "http://data.stats.gov.cn/easyquery.htm",
    {
      m: "QueryData",
      dbcode: "hgyd",
      rowcode: "zb",
      colcode: "sj",
      wds: JSON.stringify([]),
      dfwds: JSON.stringify([{ wdcode: "sj", valuecode: "LAST36" }]),
      k1: Date.now(),
    },
    {
      headers: {
        accept: "text/plain, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "x-requested-with": "XMLHttpRequest",
        cookie: "JSESSIONID=3670F413475D9C8147CBC899D7220F37; u=1",
      },
    }
  );
  // fs.writeFileSync("./xress.json", JSON.stringify(xRes, null, 2));

  if (xRes && xRes.returncode == 200 && xRes.returndata) {
    let zbArr =
      (_.find(xRes.returndata.wdnodes, (each) => each.wdcode === "zb") || {})
        .nodes || [];
    let dataList = (xRes.returndata.datanodes || []).map((item) => {
      let data = item.data;
      let zb = _.find(item.wds, (each) => each.wdcode == "zb") || {};
      let sj = _.find(item.wds, (each) => each.wdcode == "sj") || {};
      let x = (sj.valuecode || "").split("");
      x.splice(4, 0, "-");

      return {
        ...data,
        status: 0,
        dataIndexCode: zb.valuecode,
        time: moment(x.join("")).valueOf(),
      };
    });

    zbArr.forEach((item) => {
      item.menuTreeId = id;
    });

    await utils.workflow(zbArr, writeDataIndex).catch((err) => {
      fs.appendFileSync(
        "./dataindex.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });

    await utils.workflow(dataList, writeMonthData).catch((err) => {
      fs.appendFileSync(
        "./monthdata.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });
  }
}

async function writeData(data, cb) {
  try {
    await getMonthData(data);
    cb();
  } catch (e) {
    cb({ err: "writeData", id: data });
  }
}

async function getMenuTree() {
  try {
    let res = await models.MenuTree.findAll({
      where: { isParent: 0 },
      raw: true,
    });
    await utils.workflow(res.map((each) => each.id), writeData, (err) => {
      console.log('all done', )
      fs.appendFileSync(
        "./all.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });
  } catch (err) {
    console.log("err", err.message);
  }
}

// getMonthData("A0203")
//   .then((res) => {
//     console.log("zzz", res);
//   })
//   .catch((err) => {
//     console.log("errr", err.message);
//   });
getMenuTree()
