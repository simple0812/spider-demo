var fs = require("fs-extra");
var moment = require("moment");
var qs = require("query-string");
var qsx = require("qs");
var _ = require("lodash");
var httpHelper = require("./utils/httpHelper");
var utils = require("./utils");
var logger = require("./utils/logger");
var config = require("./config");

var models = require("./models");
const { each } = require("lodash");

async function writeDataIndexFn(data, cb) {
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
    logger.error(
      JSON.stringify({
        code: data.code,
        menuTreeId: data.menuTreeId,
        type: "dataIndex",
      })
    );
    cb();
  }
}

async function writeMonthDataFn(data, cb) {
  // 如果没数据 就不执行插入操作
  if (!data || !data.hasdata) {
    cb();
    return;
  }
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

    console.log(
      "month_data done item ",
      data.dataIndexCode + "--" + moment(data.time).format("YYYY-MM")
    );

    cb();
  } catch (err) {
    logger.error(
      JSON.stringify({
        time: data.time,
        dataIndexCode: data.dataIndexCode,
        type: "monthData",
      })
    );
    cb();
  }
}

//获取、解析菜单对应的表格数据 并写入数据库
async function resolveDataById(id) {
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
        cookie: config.cookie,
      },
    }
  );

  // 如果获取的第一笔数据不在36个月内 在重新获取36个月的数据
  let isInLast36 = true;
  if (res && res.returncode == 200 && res.returndata) {
    let zbArr =
      (_.find(res.returndata.wdnodes, (each) => each.wdcode === "zb") || {})
        .nodes || [];
    let dataList = [];
    (res.returndata.datanodes || []).forEach((item) => {
      let data = item.data;
      if (data.hasdata) {
        let zb = _.find(item.wds, (each) => each.wdcode == "zb") || {};
        let sj = _.find(item.wds, (each) => each.wdcode == "sj") || {};
        let x = (sj.valuecode || "").split("");
        x.splice(4, 0, "-");

        dataList.push({
          ...data,
          status: 0,
          dataIndexCode: zb.valuecode,
          time: moment(x.join("")).valueOf(),
        });
      }
    });

    if (_.isEmpty(dataList)) {
      isInLast36 = false
    } else {
      isInLast36 = moment(dataList[0].time).add(36, "M").valueOf() > Date.now();
    }

    zbArr.forEach((item) => {
      item.menuTreeId = id;
    });

    await utils.workflow(zbArr, writeDataIndexFn).then(() => {
      logger.info(`item ${id} data_index done`);
    });

    await utils.workflow(dataList, writeMonthDataFn).then(() => {
      logger.info(`item ${id} monthdata done`);
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
        cookie: config.cookie,
      },
    }
  );
  // fs.writeFileSync("./xress.json", JSON.stringify(xRes, null, 2));

  if (xRes && xRes.returncode == 200 && xRes.returndata) {
    let zbArr1 =
      (_.find(xRes.returndata.wdnodes, (each) => each.wdcode === "zb") || {})
        .nodes || [];
    let dataList1 = [];

    (xRes.returndata.datanodes || []).forEach((item) => {
      let data = item.data;

      if (data.hasdata) {
        let zb = _.find(item.wds, (each) => each.wdcode == "zb") || {};
        let sj = _.find(item.wds, (each) => each.wdcode == "sj") || {};
        let x = (sj.valuecode || "").split("");
        x.splice(4, 0, "-");

        dataList1.push({
          ...data,
          status: 0,
          dataIndexCode: zb.valuecode,
          time: moment(x.join("")).valueOf(),
        });
      }
    });

    zbArr1.forEach((item) => {
      item.menuTreeId = id;
    });

    await utils.workflow(zbArr1, writeDataIndexFn).catch((err) => {
      fs.appendFileSync(
        "./dataindex.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });

    await utils.workflow(dataList1, writeMonthDataFn).catch((err) => {
      fs.appendFileSync(
        "./monthdata.err",
        JSON.stringify(err.objMessage, null, 2)
      );
    });
  }
}

async function writeDataFn(data, cb) {
  try {
    await resolveDataById(data);
    cb();
  } catch (e) {
    logger.error("writeDataFn:" + e.message);
    cb();
  }
}

async function getMenuTree() {
  try {
    let res = await models.MenuTree.findAll({
      where: { isParent: 0 },
      raw: true,
    });
    let xArr = res.map((each) => each.id);


    await utils.workflow(
      xArr,
      writeDataFn,
      () => {
        logger.info("all done");
      }
    );
  } catch (err) {
    logger.error("err", err.message);
  }
}

// 爬取所有菜单下的数据
getMenuTree();

// 只爬取某个菜单底下的数据
// resolveDataById("A0203")
//   .then((res) => {
//     console.log("zzz", res);
//   })
//   .catch((err) => {
//     console.log("errr", err.message);
//   });
