var models = require('./models');

models.syncDb()
  .then(function() {
    console.log('数据库同步成功')
  }).catch(function(err) {
    console.log(err, '数据库同步失败')
  })