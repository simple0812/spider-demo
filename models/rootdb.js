var Sequelize = require('sequelize');
var config = require('./config');

// const db = new Sequelize({
//   dialect: 'sqlite',
//   storage:  config.SQLITE_DB
// });

//可配置多个数据库
// hack 初始化的时候 连接默认数据库来创建新的数据库
var db = new Sequelize('mysql', config.DB.user, config.DB.password, {
  host: config.DB.host,
  dialect: 'mysql',
  pool: {
    max: 500,
    min: 0
  }
});

module.exports = db;